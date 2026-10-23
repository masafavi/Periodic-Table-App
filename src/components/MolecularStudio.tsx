import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Search,
  ExternalLink,
  Compass,
  Ruler,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  Atom3D,
  CPK_ATOM_COLORS,
  fetchPubChemCompound3D,
  MoleculeData,
  PRESET_MOLECULES,
} from '../data/molecules';

type MolRenderStyle = 'ball-stick' | 'space-filling' | 'wireframe' | 'electrostatic';

// Pre-allocated math helpers at module scope (zero GC in render loop)
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vMid = new THREE.Vector3();
const _vDir = new THREE.Vector3();
const _vUp = new THREE.Vector3(0, 1, 0);
const _vOrtho = new THREE.Vector3();
const _quat = new THREE.Quaternion();

const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

export const MolecularStudio: React.FC = () => {
  const [molecule, setMolecule] = useState<MoleculeData>(PRESET_MOLECULES[0]);
  const [pubchemQuery, setPubchemQuery] = useState('');
  const [isLoadingPubchem, setIsLoadingPubchem] = useState(false);
  const [pubchemError, setPubchemError] = useState<string | null>(null);

  const [renderStyle, setRenderStyle] = useState<MolRenderStyle>('ball-stick');
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(0.5);
  const [bondExpansion, setBondExpansion] = useState(0.0);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [selectedAtomIds, setSelectedAtomIds] = useState<number[]>([0, 1]);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'druglikeness' | 'coordinates'>('overview');
  const [imgFailed, setImgFailed] = useState(false);

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const rebuildSceneRef = useRef<((mol: MoleculeData, style: MolRenderStyle) => void) | null>(null);
  const resetCamRef = useRef<(() => void) | null>(null);

  const stateRef = useRef({
    molecule,
    renderStyle,
    autoRotateSpeed,
    bondExpansion,
    selectedAtomIds,
  });

  useEffect(() => {
    stateRef.current.molecule = molecule;
    stateRef.current.renderStyle = renderStyle;
    stateRef.current.autoRotateSpeed = autoRotateSpeed;
    stateRef.current.bondExpansion = bondExpansion;
    stateRef.current.selectedAtomIds = selectedAtomIds;
  }, [molecule, renderStyle, autoRotateSpeed, bondExpansion, selectedAtomIds]);

  useEffect(() => {
    setImgFailed(false);
    setSelectedAtomIds(molecule.atoms.length >= 2 ? [0, 1] : []);
    if (rebuildSceneRef.current) {
      rebuildSceneRef.current(molecule, renderStyle);
    }
  }, [molecule, renderStyle]);

  const handlePubChemSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubchemQuery.trim()) return;
    setIsLoadingPubchem(true);
    setPubchemError(null);
    try {
      const fetched = await fetchPubChemCompound3D(pubchemQuery);
      setMolecule(fetched);
    } catch (err: any) {
      setPubchemError(err?.message || 'Could not retrieve 3D conformer from PubChem.');
    } finally {
      setIsLoadingPubchem(false);
    }
  };

  const handleToggleAtomPick = (atomId: number) => {
    setSelectedAtomIds((prev) => {
      if (prev.includes(atomId)) {
        return prev.filter((id) => id !== atomId);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], atomId];
      }
      return [...prev, atomId];
    });
  };

  const onAtomPickRef = useRef(handleToggleAtomPick);
  useEffect(() => {
    onAtomPickRef.current = handleToggleAtomPick;
  });

  // Compute distance (Å) and bond angle (°) for selected atoms
  const measurementInfo = useMemoMeasurement(molecule.atoms, selectedAtomIds);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    camera.position.set(0, 2.5, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e293b, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.3);
    keyLight.position.set(10, 16, 12);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-12, -8, -10);
    scene.add(rimLight);

    // Subtle ground contact plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070a12,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4.6;
    scene.add(ground);

    const grid = new THREE.GridHelper(32, 16, 0x1e293b, 0x111827);
    grid.position.y = -4.58;
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.5;
    controls.maxDistance = 35;

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);

    const sphereGeo = new THREE.SphereGeometry(1, 28, 28);
    const ringHighlightGeo = new THREE.TorusGeometry(1.18, 0.07, 12, 36);
    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 18);

    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });

    interface AtomNode {
      atom: Atom3D;
      group: THREE.Group;
      sphere: THREE.Mesh;
      halo: THREE.Mesh;
      basePos: THREE.Vector3;
    }

    interface BondNode {
      fromIdx: number;
      toIdx: number;
      order: 1 | 2 | 3;
      meshes: THREE.Mesh[];
    }

    let atomNodes: AtomNode[] = [];
    let bondNodes: BondNode[] = [];
    let pickableSpheres: THREE.Object3D[] = [];

    const buildMoleculeScene = (mol: MoleculeData, style: MolRenderStyle) => {
      while (moleculeGroup.children.length > 0) {
        moleculeGroup.remove(moleculeGroup.children[0]);
      }
      atomNodes = [];
      bondNodes = [];
      pickableSpheres = [];

      // Create multi-part Atom Nodes
      mol.atoms.forEach((atom, idx) => {
        const meta = CPK_ATOM_COLORS[atom.element] || { hex: '#ec4899', radius: 0.52 };
        let colorHex = meta.hex;

        if (style === 'electrostatic') {
          const q = atom.partialCharge ?? (atom.element === 'O' || atom.element === 'N' ? -0.45 : atom.element === 'H' ? 0.25 : 0.05);
          if (q < -0.15) colorHex = '#ef4444'; // Negative partial charge (δ-)
          else if (q > 0.15) colorHex = '#3b82f6'; // Positive partial charge (δ+)
          else colorHex = '#94a3b8'; // Neutral
        }

        const radius =
          style === 'space-filling'
            ? meta.radius * 2.15
            : style === 'wireframe'
            ? meta.radius * 0.35
            : meta.radius * 0.78;

        const mat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(colorHex),
          roughness: style === 'electrostatic' ? 0.2 : 0.25,
          metalness: atom.element === 'Pt' || atom.element === 'Fe' ? 0.85 : 0.18,
          clearcoat: 0.65,
          clearcoatRoughness: 0.15,
          wireframe: style === 'wireframe',
        });

        const group = new THREE.Group();
        const basePos = new THREE.Vector3(atom.x, atom.y, atom.z);
        group.position.copy(basePos);

        const sphere = new THREE.Mesh(sphereGeo, mat);
        sphere.scale.setScalar(radius);
        sphere.castShadow = !isSoftwareGl;
        sphere.receiveShadow = true;
        sphere.userData = { atomIndex: idx };
        sphere.layers.enable(1);
        group.add(sphere);
        pickableSpheres.push(sphere);

        // Selection ring halo
        const halo = new THREE.Mesh(ringHighlightGeo, highlightMat);
        halo.scale.setScalar(radius);
        halo.visible = false;
        group.add(halo);

        moleculeGroup.add(group);
        atomNodes.push({ atom, group, sphere, halo, basePos });
      });

      // Create Covalent Bond Cylinders (Single, Double, Triple)
      if (style !== 'space-filling') {
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.4,
          metalness: 0.65,
          wireframe: style === 'wireframe',
        });

        mol.bonds.forEach((bond) => {
          const count = bond.order;
          const meshes: THREE.Mesh[] = [];
          for (let k = 0; k < count; k++) {
            const m = new THREE.Mesh(cylGeo, bondMat);
            m.castShadow = !isSoftwareGl;
            moleculeGroup.add(m);
            meshes.push(m);
          }
          bondNodes.push({
            fromIdx: bond.from,
            toIdx: bond.to,
            order: bond.order,
            meshes,
          });
        });
      }
    };

    rebuildSceneRef.current = buildMoleculeScene;
    buildMoleculeScene(stateRef.current.molecule, stateRef.current.renderStyle);

    resetCamRef.current = () => {
      camera.position.set(0, 2.5, 9.5);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    // Raycasting for Atom Selection & Distance/Angle Probing
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (Math.abs(e.clientX - downPos.x) > 5 || Math.abs(e.clientY - downPos.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableSpheres, false);
      if (hits.length > 0) {
        const atomIdx = hits[0].object.userData?.atomIndex;
        if (typeof atomIdx === 'number') {
          onAtomPickRef.current(atomIdx);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (gl.flush) gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const st = stateRef.current;

      controls.update();

      if (st.autoRotateSpeed > 0) {
        moleculeGroup.rotation.y += delta * st.autoRotateSpeed * 0.6;
      }

      const scaleFactor = 1 + st.bondExpansion * 0.85;

      // Update atom positions and selection rings
      for (let i = 0; i < atomNodes.length; i++) {
        const node = atomNodes[i];
        _vA.copy(node.basePos).multiplyScalar(scaleFactor);
        node.group.position.lerp(_vA, 1 - Math.exp(-10 * delta));
        node.halo.visible = st.selectedAtomIds.includes(i);
        if (node.halo.visible) {
          node.halo.lookAt(camera.position);
        }
      }

      // Update bond cylinders to connect live damped atom positions
      for (let i = 0; i < bondNodes.length; i++) {
        const b = bondNodes[i];
        const n1 = atomNodes[b.fromIdx];
        const n2 = atomNodes[b.toIdx];
        if (!n1 || !n2) continue;

        _vA.copy(n1.group.position);
        _vB.copy(n2.group.position);
        _vMid.addVectors(_vA, _vB).multiplyScalar(0.5);
        _vDir.subVectors(_vB, _vA);
        const len = _vDir.length();
        _vDir.normalize();
        _quat.setFromUnitVectors(_vUp, _vDir);

        // Compute perpendicular offset vector for double/triple bonds
        _vOrtho.crossVectors(_vDir, _vUp);
        if (_vOrtho.lengthSq() < 0.001) {
          _vOrtho.set(1, 0, 0);
        } else {
          _vOrtho.normalize();
        }

        const radius = b.order === 1 ? 0.085 : 0.055;
        const sep = 0.16;

        for (let k = 0; k < b.meshes.length; k++) {
          const m = b.meshes[k];
          m.position.copy(_vMid);
          if (b.order === 2) {
            m.position.addScaledVector(_vOrtho, k === 0 ? -sep * 0.55 : sep * 0.55);
          } else if (b.order === 3) {
            m.position.addScaledVector(_vOrtho, (k - 1) * sep * 0.75);
          }
          m.quaternion.copy(_quat);
          m.scale.set(radius, len, radius);
        }
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Lipinski Rule of 5 evaluation
  const lipinskiChecks = [
    {
      label: 'Molecular Weight ≤ 500 Da',
      value: `${molecule.molarMass.toFixed(2)} Da`,
      pass: molecule.molarMass <= 500,
    },
    {
      label: 'Lipophilicity (XLogP) ≤ 5.0',
      value: `${molecule.xlogp}`,
      pass: molecule.xlogp <= 5.0,
    },
    {
      label: 'H-Bond Donors ≤ 5',
      value: `${molecule.hBondDonors}`,
      pass: molecule.hBondDonors <= 5,
    },
    {
      label: 'H-Bond Acceptors ≤ 10',
      value: `${molecule.hBondAcceptors}`,
      pass: molecule.hBondAcceptors <= 10,
    },
    {
      label: 'Veber TPSA ≤ 140 Å²',
      value: `${molecule.tpsa} Å²`,
      pass: molecule.tpsa <= 140,
    },
    {
      label: 'Rotatable Bonds ≤ 10',
      value: `${molecule.rotatableBonds}`,
      pass: molecule.rotatableBonds <= 10,
    },
  ];
  const violations = lipinskiChecks.slice(0, 4).filter((c) => !c.pass).length;

  return (
    <div className="space-y-6">
      {/* Top Quick-Try Molecule Selector + Live PubChem 3D Conformer Fetch Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              3D Molecular Structure Studio & Live PubChem Explorer
            </h2>
            <p className="text-xs text-slate-500">
              Inspect VSEPR geometry, hybridization, bond lengths, and live 3D SDF conformers from NCBI PubChem.
            </p>
          </div>

          {/* Live PubChem 3D Search Form */}
          <form onSubmit={handlePubChemSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={pubchemQuery}
                onChange={(e) => setPubchemQuery(e.target.value)}
                placeholder="Fetch live PubChem 3D (e.g. ibuprofen, 3672)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingPubchem}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {isLoadingPubchem ? 'Loading 3D SDF...' : 'Load from PubChem'}
            </button>
          </form>
        </div>

        {pubchemError && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{pubchemError}</span>
          </div>
        )}

        {/* Quick-Try Curated Molecules */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-mono text-slate-400 mr-1">Quick-Try 3D Structures:</span>
          {PRESET_MOLECULES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setPubchemError(null);
                setMolecule(m);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                molecule.id === m.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {m.name} ({m.formula})
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Pane Workbench: 3D Molecular WebGL Canvas (Left 7 cols) + Synchronized Data Inspector (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: 3D WebGL Viewport */}
        <div className="lg:col-span-7 relative h-[560px] rounded-xl overflow-hidden border border-slate-800 bg-[#090d16]">
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Minimal Top-Left Molecular Telemetry Badge */}
          <div className="absolute top-4 left-4 pointer-events-none select-none bg-[#0f172a]/90 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-slate-100 max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{molecule.name}</span>
              <span className="text-xs font-mono text-sky-400">· {molecule.formula}</span>
              <span className="text-xs font-mono text-slate-400">
                · {molecule.molarMass.toFixed(2)} g/mol
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 mt-1 flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{measurementInfo}</span>
            </div>
          </div>

          {/* CPK Legend Top-Right (Compact Unboxed Row) */}
          <div className="absolute top-4 right-4 pointer-events-none select-none bg-[#0f172a]/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-[11px] font-mono text-slate-300 hidden sm:flex items-center gap-3">
            <span>C: Slate</span>
            <span>·</span>
            <span className="text-slate-100">H: White</span>
            <span>·</span>
            <span className="text-red-400">O: Red</span>
            <span>·</span>
            <span className="text-blue-400">N: Blue</span>
            <span>·</span>
            <span className="text-yellow-400">S: Yellow</span>
          </div>

          {/* Unified Collapsible Bottom Control Dock */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-4 w-[min(900px,94%)] transition-transform duration-200 ${
              dockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
            }`}
          >
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setDockCollapsed((p) => !p)}
                className="px-3.5 py-1 text-xs font-mono font-medium text-slate-200 bg-[#111827] border border-b-0 border-slate-700 rounded-t-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                {dockCollapsed ? '▴ Show Molecular Controls' : '▾ Hide Molecular Controls'}
              </button>
            </div>

            <div className="bg-[#111827]/95 border border-slate-700 rounded-xl p-3 text-slate-200 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 3D Representation Style Buttons */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {(
                    [
                      ['ball-stick', 'Ball & Stick'],
                      ['space-filling', 'Space-Filling (CPK)'],
                      ['electrostatic', 'Partial Charge (δ+/δ−)'],
                      ['wireframe', 'Wireframe'],
                    ] as [MolRenderStyle, string][]
                  ).map(([st, label]) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRenderStyle(st)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        renderStyle === st
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Bond Stretch & Spin Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-mono text-slate-300 whitespace-nowrap">
                    <span>Bond Stretch: {Math.round(bondExpansion * 100)}%</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={bondExpansion}
                      onChange={(e) => setBondExpansion(parseFloat(e.target.value))}
                      className="w-20 accent-sky-500"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs font-mono text-slate-300 whitespace-nowrap">
                    <span>Spin: {autoRotateSpeed.toFixed(1)}x</span>
                    <input
                      type="range"
                      min="0"
                      max="2.5"
                      step="0.1"
                      value={autoRotateSpeed}
                      onChange={(e) => setAutoRotateSpeed(parseFloat(e.target.value))}
                      className="w-16 accent-sky-500"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => resetCamRef.current?.()}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    Reset View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Synchronized Molecular & Pharmacological Inspector */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header & Provenance */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>
                  {molecule.category} · [{molecule.provenance}]
                </span>
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${molecule.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <span>PubChem CID {molecule.cid}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {molecule.name}{' '}
                <span className="font-mono text-blue-600 text-lg">({molecule.formula})</span>
              </h3>
              <div className="text-xs font-mono text-slate-500 mt-0.5 truncate">
                IUPAC: {molecule.iupacName}
              </div>
            </div>

            {/* Inspector Sub-Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  ['overview', 'VSEPR & Structure'],
                  ['druglikeness', 'Lipinski & ADME'],
                  ['coordinates', `3D Coordinates (${molecule.atoms.length})`],
                ] as const
              ).map(([tabKey, label]) => (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setInspectorTab(tabKey)}
                  className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    inspectorTab === tabKey
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {inspectorTab === 'overview' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {molecule.description}
                </p>

                {/* VSEPR & Bonding Table */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">VSEPR Geometry</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">
                      {molecule.vseprGeometry}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Orbital Hybridization</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">
                      {molecule.hybridization}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Equilibrium Bond Angles</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">
                      {molecule.bondAngle}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Dipole Moment / Polarity</span>
                    <span className="font-mono font-semibold text-blue-700 text-right">
                      {molecule.dipoleMoment} · {molecule.polarity}
                    </span>
                  </div>
                </div>

                {/* Canonical SMILES & 2D PubChem Depiction */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                  <div className="sm:col-span-7 space-y-2">
                    <div className="text-xs font-semibold text-slate-800">Canonical SMILES</div>
                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded font-mono text-xs text-slate-800 break-all">
                      {molecule.smiles}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tip: Click any 2 or 3 atoms inside the 3D viewport to compute exact interatomic distance (Å) and bond angle (°).
                    </div>
                  </div>
                  <div className="sm:col-span-5 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-2 h-32">
                    {!imgFailed ? (
                      <img
                        src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${molecule.cid}/PNG?image_size=300x300`}
                        alt={`2D chemical structure of ${molecule.name}`}
                        referrerPolicy="no-referrer"
                        onError={() => setImgFailed(true)}
                        className="max-h-28 object-contain"
                      />
                    ) : (
                      <div className="text-center font-mono text-xs text-slate-500 p-2">
                        <Compass className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                        <span>{molecule.formula}</span>
                        <span className="block text-[10px] text-slate-400">2D Skeletal Graph</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {inspectorTab === 'druglikeness' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Lipinski’s Rule of Five Evaluation
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        violations <= 1 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {violations <= 1
                        ? `● Bioavailable (${violations} violations)`
                        : `▲ ${violations} Rule Violations`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluates oral bioavailability and membrane permeability using molecular weight, lipophilicity, hydrogen bonding, and polar surface area.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {lipinskiChecks.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                    >
                      <span className="text-slate-700 font-medium">{item.label}</span>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="font-semibold text-slate-900">{item.value}</span>
                        <span
                          className={
                            item.pass ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'
                          }
                        >
                          {item.pass ? '✓ PASS' : '✕ EXCEEDS'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inspectorTab === 'coordinates' && (
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  Click any row below to toggle its 3D selection halo and measure distances/angles:
                </div>
                <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Atom</th>
                        <th className="py-2 px-3">X (Å)</th>
                        <th className="py-2 px-3">Y (Å)</th>
                        <th className="py-2 px-3">Z (Å)</th>
                        <th className="py-2 px-3">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {molecule.atoms.map((a, idx) => {
                        const isSel = selectedAtomIds.includes(idx);
                        return (
                          <tr
                            key={idx}
                            onClick={() => handleToggleAtomPick(idx)}
                            className={`cursor-pointer transition-colors ${
                              isSel ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-1.5 px-3">
                              #{idx + 1} {a.element}
                            </td>
                            <td className="py-1.5 px-3">{a.x.toFixed(3)}</td>
                            <td className="py-1.5 px-3">{a.y.toFixed(3)}</td>
                            <td className="py-1.5 px-3">{a.z.toFixed(3)}</td>
                            <td className="py-1.5 px-3">
                              {isSel ? '● Probed' : 'Select'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Geometry Summary */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>
              Atoms: <strong className="text-slate-900">{molecule.atoms.length}</strong> · Bonds:{' '}
              <strong className="text-slate-900">{molecule.bonds.length}</strong>
            </span>
            <span>{ measurementInfo }</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function useMemoMeasurement(atoms: Atom3D[], selectedIds: number[]): string {
  if (selectedIds.length === 2) {
    const a1 = atoms[selectedIds[0]];
    const a2 = atoms[selectedIds[1]];
    if (!a1 || !a2) return 'Click 2 atoms to measure bond length (Å)';
    const dx = a1.x - a2.x;
    const dy = a1.y - a2.y;
    const dz = a1.z - a2.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return `d(${a1.element}${selectedIds[0] + 1}–${a2.element}${selectedIds[1] + 1}) = ${dist.toFixed(3)} Å`;
  }
  if (selectedIds.length === 3) {
    const a1 = atoms[selectedIds[0]];
    const a2 = atoms[selectedIds[1]]; // Vertex
    const a3 = atoms[selectedIds[2]];
    if (!a1 || !a2 || !a3) return 'Click 2 or 3 atoms to measure geometry';
    const v1 = { x: a1.x - a2.x, y: a1.y - a2.y, z: a1.z - a2.z };
    const v2 = { x: a3.x - a2.x, y: a3.y - a2.y, z: a3.z - a2.z };
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const m1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const m2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    if (m1 > 0 && m2 > 0) {
      const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
      const deg = (Math.acos(cos) * 180) / Math.PI;
      return `∠(${a1.element}${selectedIds[0] + 1}-${a2.element}${selectedIds[1] + 1}-${a3.element}${selectedIds[2] + 1}) = ${deg.toFixed(2)}°`;
    }
  }
  return 'Click any 2 atoms for distance (Å) or 3 atoms for angle (°)';
}
