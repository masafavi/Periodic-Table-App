import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CATEGORY_META, ChemicalElement, ELEMENTS } from '../data/elements';

export type SceneMode3D = 'atom-bohr' | 'periodic-relief' | 'periodic-helix';
export type ReliefMetric = 'electronegativity' | 'ionizationEnergy' | 'atomicRadius' | 'meltingPoint';

interface ThreePeriodicAndAtomProps {
  selectedElement: ChemicalElement;
  onSelectElement: (el: ChemicalElement) => void;
  sceneMode: SceneMode3D;
  onChangeSceneMode: (mode: SceneMode3D) => void;
}

// Pre-allocated math helpers at module scope (zero GC in render loop)
const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

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

function createElementCapTexture(
  el: ChemicalElement,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const catHex = CATEGORY_META[el.category].hex;

  // Dark metallic slate face with subtle border
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  // Top accent bar
  ctx.fillStyle = catHex;
  ctx.fillRect(0, 0, 256, 26);

  // Border hairline
  ctx.strokeStyle = catHex;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 250);

  // Atomic number
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 34px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(el.number), 20, 68);

  // Atomic mass top right
  ctx.fillStyle = '#64748b';
  ctx.font = '500 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(el.atomicMass.toFixed(1), 236, 66);

  // Element Symbol
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 96px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(el.symbol, 128, 162);

  // Element Name
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(el.name, 128, 212);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export const ThreePeriodicAndAtom: React.FC<ThreePeriodicAndAtomProps> = ({
  selectedElement,
  onSelectElement,
  sceneMode,
  onChangeSceneMode,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [reliefMetric, setReliefMetric] = useState<ReliefMetric>('electronegativity');
  const [showOrbitals, setShowOrbitals] = useState(true);
  const [orbitalSpeed, setOrbitalSpeed] = useState(1.0);
  const [explodedFactor, setExplodedFactor] = useState(0.0);

  // Mutable refs for animation loop without tearing down WebGL canvas
  const stateRef = useRef({
    selectedElement,
    sceneMode,
    reliefMetric,
    showOrbitals,
    orbitalSpeed,
    explodedFactor,
    cameraPresetTrigger: 0,
  });

  useEffect(() => {
    stateRef.current.selectedElement = selectedElement;
    stateRef.current.sceneMode = sceneMode;
    stateRef.current.reliefMetric = reliefMetric;
    stateRef.current.showOrbitals = showOrbitals;
    stateRef.current.orbitalSpeed = orbitalSpeed;
    stateRef.current.explodedFactor = explodedFactor;
  }, [selectedElement, sceneMode, reliefMetric, showOrbitals, orbitalSpeed, explodedFactor]);

  const onSelectRef = useRef(onSelectElement);
  useEffect(() => {
    onSelectRef.current = onSelectElement;
  }, [onSelectElement]);

  // Keyboard 'H' shortcut for collapsible bottom dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger rebuild of atom group when selectedElement changes
  const rebuildAtomRef = useRef<((el: ChemicalElement) => void) | null>(null);
  useEffect(() => {
    if (rebuildAtomRef.current) {
      rebuildAtomRef.current(selectedElement);
    }
  }, [selectedElement]);

  // Camera reset trigger
  const resetCameraRef = useRef<((mode: SceneMode3D) => void) | null>(null);
  useEffect(() => {
    if (resetCameraRef.current) {
      resetCameraRef.current(sceneMode);
    }
  }, [sceneMode]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x0b0f19);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.014);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
    camera.position.set(0, 7.5, 16);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Studio Lighting Rig (Warm Key + Cool Hemisphere Fill + Rim)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(14, 24, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
    rimLight.position.set(-16, 10, -14);
    scene.add(rimLight);

    // Ground Contact Plane + Subtle Reference Grid (offset by 0.02 on Y to prevent coplanar Z-fighting)
    const floorGeo = new THREE.PlaneGeometry(90, 90);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -5.5;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const gridHelper = new THREE.GridHelper(64, 32, 0x1e293b, 0x151e30);
    gridHelper.position.y = -5.48;
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 55;
    controls.minDistance = 3.5;

    let cameraTransitionActive = false;
    controls.addEventListener('start', () => {
      cameraTransitionActive = false;
    });

    resetCameraRef.current = (mode: SceneMode3D) => {
      cameraTransitionActive = true;
      if (mode === 'atom-bohr') {
        _targetPos.set(0, 4.5, 13.5);
        _targetLook.set(0, 0, 0);
      } else if (mode === 'periodic-relief') {
        _targetPos.set(0, 18.5, 22.5);
        _targetLook.set(0, -1.5, 0);
      } else {
        _targetPos.set(0, 8.5, 23.0);
        _targetLook.set(0, 0.5, 0);
      }
    };
    resetCameraRef.current(stateRef.current.sceneMode);

    // =========================================================================
    // GROUP 1: 3D BOHR & QUANTUM ORBITAL ATOM MODEL (Multi-Part Composite Group)
    // =========================================================================
    const atomRootGroup = new THREE.Group();
    scene.add(atomRootGroup);

    const nucleusGroup = new THREE.Group();
    const shellsGroup = new THREE.Group();
    const quantumLobesGroup = new THREE.Group();
    atomRootGroup.add(nucleusGroup);
    atomRootGroup.add(shellsGroup);
    atomRootGroup.add(quantumLobesGroup);

    const protonMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48,
      roughness: 0.22,
      metalness: 0.35,
      clearcoat: 0.8,
    });
    const neutronMat = new THREE.MeshPhysicalMaterial({
      color: 0x64748b,
      roughness: 0.48,
      metalness: 0.75,
    });
    const electronMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      roughness: 0.15,
      metalness: 0.2,
    });
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.3,
      metalness: 0.85,
    });
    const pOrbitalPosMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: isSoftwareGl ? 0.26 : 0.32,
      roughness: 0.15,
      metalness: 0.05,
      depthWrite: false,
    });
    const pOrbitalNegMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: isSoftwareGl ? 0.26 : 0.32,
      roughness: 0.15,
      metalness: 0.05,
      depthWrite: false,
    });

    const nucleonGeo = new THREE.SphereGeometry(0.24, 18, 18);
    const electronGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const lobeGeo = new THREE.SphereGeometry(1, 24, 24);
    lobeGeo.scale(0.55, 1.35, 0.55);

    interface ElectronOrbitNode {
      mesh: THREE.Mesh;
      shellIndex: number;
      radius: number;
      baseAngle: number;
      speed: number;
      tiltX: number;
      tiltZ: number;
    }
    let activeElectrons: ElectronOrbitNode[] = [];
    let activeShellRings: THREE.Mesh[] = [];
    let activeNucleons: { mesh: THREE.Mesh; dir: THREE.Vector3; basePos: THREE.Vector3 }[] = [];

    const buildAtom3D = (el: ChemicalElement) => {
      // Clear previous children
      while (nucleusGroup.children.length > 0) nucleusGroup.remove(nucleusGroup.children[0]);
      while (shellsGroup.children.length > 0) {
        const c = shellsGroup.children[0] as THREE.Mesh;
        if (c.geometry && c.geometry !== electronGeo) c.geometry.dispose();
        shellsGroup.remove(c);
      }
      while (quantumLobesGroup.children.length > 0) {
        quantumLobesGroup.remove(quantumLobesGroup.children[0]);
      }
      activeElectrons = [];
      activeShellRings = [];
      activeNucleons = [];

      // 1. Multi-part Nucleus Cluster (capped at 48 visible nucleons for clarity + scaling)
      const protons = el.number;
      const neutrons = Math.max(0, Math.round(el.atomicMass) - protons);
      const totalNucleons = Math.min(56, protons + neutrons);
      const goldenRatio = (1 + Math.sqrt(5)) / 2;

      for (let i = 0; i < totalNucleons; i++) {
        const isProton = i % 2 === 0 || i < Math.ceil((protons / (protons + neutrons || 1)) * totalNucleons);
        const mesh = new THREE.Mesh(nucleonGeo, isProton ? protonMat : neutronMat);
        // Fibonacci sphere packing with radial shells
        const r = totalNucleons === 1 ? 0 : 0.22 * Math.cbrt(i + 1);
        const theta = (2 * Math.PI * i) / goldenRatio;
        const phi = Math.acos(1 - (2 * (i + 0.5)) / totalNucleons);
        const bx = r * Math.sin(phi) * Math.cos(theta);
        const by = r * Math.sin(phi) * Math.sin(theta);
        const bz = r * Math.cos(phi);
        mesh.position.set(bx, by, bz);
        nucleusGroup.add(mesh);

        const dir = new THREE.Vector3(bx, by, bz).normalize();
        activeNucleons.push({ mesh, dir, basePos: new THREE.Vector3(bx, by, bz) });
      }

      // 2. Concentric Electron Shells & Electrons
      el.shells.forEach((electronCount, sIdx) => {
        const radius = 1.45 + sIdx * 0.72;
        const ringGeo = new THREE.TorusGeometry(radius, 0.022, 12, 72);
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);

        // Give each shell a subtle gyroscopic tilt
        const tiltX = Math.PI / 2 + (sIdx % 2 === 0 ? 0.16 : -0.16) * (sIdx * 0.35);
        const tiltZ = (sIdx * 0.28) % 0.9;
        ringMesh.rotation.set(tiltX, 0, tiltZ);
        shellsGroup.add(ringMesh);
        activeShellRings.push(ringMesh);

        for (let eIdx = 0; eIdx < electronCount; eIdx++) {
          const eMesh = new THREE.Mesh(electronGeo, electronMat);
          const baseAngle = (2 * Math.PI * eIdx) / electronCount;
          const speed = (1.6 / Math.sqrt(sIdx + 1)) * (sIdx % 2 === 0 ? 1 : -1);
          shellsGroup.add(eMesh);
          activeElectrons.push({
            mesh: eMesh,
            shellIndex: sIdx,
            radius,
            baseAngle,
            speed,
            tiltX,
            tiltZ,
          });
        }
      });

      // 3. Quantum Probability Orbital Lobes (2p_x, 2p_y, 2p_z or 3d dumbbells)
      const lobeScale = 1.15 + el.period * 0.22;
      const axes: [number, number, number, THREE.Euler][] = [
        [0, lobeScale, 0, new THREE.Euler(0, 0, 0)],
        [0, -lobeScale, 0, new THREE.Euler(0, 0, 0)],
        [lobeScale, 0, 0, new THREE.Euler(0, 0, Math.PI / 2)],
        [-lobeScale, 0, 0, new THREE.Euler(0, 0, Math.PI / 2)],
        [0, 0, lobeScale, new THREE.Euler(Math.PI / 2, 0, 0)],
        [0, 0, -lobeScale, new THREE.Euler(Math.PI / 2, 0, 0)],
      ];

      axes.forEach(([lx, ly, lz, rot], idx) => {
        const mat = idx % 2 === 0 ? pOrbitalPosMat : pOrbitalNegMat;
        const lobe = new THREE.Mesh(lobeGeo, mat);
        lobe.position.set(lx, ly, lz);
        lobe.rotation.copy(rot);
        lobe.renderOrder = 2;
        quantumLobesGroup.add(lobe);
      });
    };

    rebuildAtomRef.current = buildAtom3D;
    buildAtom3D(stateRef.current.selectedElement);

    // =========================================================================
    // GROUP 2: 3D PERIODIC TABLE TOWERS (Relief Landscape & Mendeleev Helix)
    // =========================================================================
    const periodicGroup = new THREE.Group();
    scene.add(periodicGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const towerBaseGeo = new THREE.BoxGeometry(0.92, 1.0, 0.92);
    // Shift geometry so pivot is at bottom-center (y = 0 to 1)
    towerBaseGeo.translate(0, 0.5, 0);

    const plinthGeo = new THREE.BoxGeometry(1.02, 0.14, 1.02);
    plinthGeo.translate(0, 0.07, 0);

    const capPlaneGeo = new THREE.PlaneGeometry(0.88, 0.88);
    capPlaneGeo.rotateX(-Math.PI / 2);

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65,
      metalness: 0.7,
    });

    interface ElementTowerNode {
      el: ChemicalElement;
      root: THREE.Group;
      pillar: THREE.Mesh;
      cap: THREE.Mesh;
      pillarMat: THREE.MeshPhysicalMaterial;
      currentHeight: number;
      currentPos: THREE.Vector3;
      currentRotY: number;
    }

    const towerNodes: ElementTowerNode[] = [];
    const pickableMeshes: THREE.Object3D[] = [];

    ELEMENTS.forEach((el) => {
      const root = new THREE.Group();
      const catColor = new THREE.Color(CATEGORY_META[el.category].hex);

      // Part 1: Grounded bottom-center metallic plinth
      const plinth = new THREE.Mesh(plinthGeo, plinthMat);
      root.add(plinth);

      // Part 2: Variable-height PBR pillar
      const pillarMat = new THREE.MeshPhysicalMaterial({
        color: catColor,
        roughness: 0.32,
        metalness: 0.45,
        clearcoat: 0.4,
      });
      const pillar = new THREE.Mesh(towerBaseGeo, pillarMat);
      pillar.position.y = 0.14;
      pillar.castShadow = !isSoftwareGl;
      pillar.receiveShadow = true;
      pillar.userData = { elementNumber: el.number };
      pillar.layers.enable(1);
      root.add(pillar);
      pickableMeshes.push(pillar);

      // Part 3: High-anisotropy top legend cap
      const capTex = createElementCapTexture(el, maxAnisotropy);
      const capMat = new THREE.MeshBasicMaterial({
        map: capTex,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      const cap = new THREE.Mesh(capPlaneGeo, capMat);
      cap.position.y = 1.15;
      cap.userData = { elementNumber: el.number };
      cap.layers.enable(1);
      root.add(cap);
      pickableMeshes.push(cap);

      const gridX = (el.gridCol - 9.5) * 1.18;
      const gridZ = (el.gridRow - 5.2) * 1.18;
      const initPos = new THREE.Vector3(gridX, -4.5, gridZ);
      root.position.copy(initPos);

      periodicGroup.add(root);
      towerNodes.push({
        el,
        root,
        pillar,
        cap,
        pillarMat,
        currentHeight: 1.0,
        currentPos: initPos.clone(),
        currentRotY: 0,
      });
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster on layer 1 for element picking
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (stateRef.current.sceneMode === 'atom-bohr') return;
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);
      if (dx > 6 || dy > 6) return; // Ignore camera drag

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickableMeshes, false);
      if (hits.length > 0) {
        const elNum = hits[0].object.userData?.elementNumber;
        const found = ELEMENTS.find((item) => item.number === elNum);
        if (found) {
          onSelectRef.current(found);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop with software WebGL fenceSync pacing
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
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Smooth camera preset transition
      if (cameraTransitionActive) {
        camera.position.lerp(_targetPos, 1 - Math.exp(-5 * delta));
        controls.target.lerp(_targetLook, 1 - Math.exp(-5 * delta));
        if (camera.position.distanceTo(_targetPos) < 0.08) {
          cameraTransitionActive = false;
        }
      }
      controls.update();

      const isAtomMode = st.sceneMode === 'atom-bohr';
      atomRootGroup.visible = isAtomMode;
      periodicGroup.visible = !isAtomMode;

      if (isAtomMode) {
        quantumLobesGroup.visible = st.showOrbitals;
        const exp = st.explodedFactor;

        // Smoothly damp nucleon separation based on exploded view slider
        for (let i = 0; i < activeNucleons.length; i++) {
          const n = activeNucleons[i];
          _vec3.copy(n.basePos).addScaledVector(n.dir, exp * 1.4);
          n.mesh.position.lerp(_vec3, 1 - Math.exp(-8 * delta));
        }
        nucleusGroup.rotation.y += delta * 0.25 * st.orbitalSpeed;

        // Advance electrons along their 3D tilted Bohr rings
        for (let i = 0; i < activeElectrons.length; i++) {
          const e = activeElectrons[i];
          const r = e.radius * (1 + exp * 0.35);
          const angle = e.baseAngle + elapsed * e.speed * st.orbitalSpeed;
          _vec3.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
          // Apply ring rotation
          const ring = activeShellRings[e.shellIndex];
          if (ring) {
            const targetScale = 1 + exp * 0.35;
            ring.scale.setScalar(
              THREE.MathUtils.damp(ring.scale.x, targetScale, 8, delta)
            );
            _vec3.applyEuler(ring.rotation);
          }
          e.mesh.position.copy(_vec3);
        }

        quantumLobesGroup.rotation.y = elapsed * 0.18 * st.orbitalSpeed;
      } else {
        // Update 3D Periodic Table Towers (Relief vs Helix)
        const metric = st.reliefMetric;
        const selNum = st.selectedElement.number;
        const exp = st.explodedFactor;

        for (let i = 0; i < towerNodes.length; i++) {
          const node = towerNodes[i];
          const el = node.el;

          // Compute normalized metric height (0.4 to 5.2)
          let norm = 0.25;
          if (metric === 'electronegativity' && el.electronegativity !== null) {
            norm = el.electronegativity / 4.0;
          } else if (metric === 'ionizationEnergy' && el.ionizationEnergy !== null) {
            norm = el.ionizationEnergy / 2400;
          } else if (metric === 'atomicRadius' && el.atomicRadius !== null) {
            norm = el.atomicRadius / 300;
          } else if (metric === 'meltingPoint' && el.meltingPoint !== null) {
            norm = el.meltingPoint / 3800;
          }
          const targetHeight = Math.max(0.35, norm * 4.8);
          node.currentHeight = THREE.MathUtils.damp(
            node.currentHeight,
            targetHeight,
            7,
            delta
          );

          node.pillar.scale.y = node.currentHeight;
          node.cap.position.y = 0.14 + node.currentHeight + 0.01;

          // Highlight selected element
          const isSelected = el.number === selNum;
          node.pillarMat.emissive.setHex(isSelected ? 0x38bdf8 : 0x000000);
          node.pillarMat.emissiveIntensity = isSelected ? 0.55 : 0;

          if (st.sceneMode === 'periodic-relief') {
            const spread = 1.18 + exp * 0.45;
            const gx = (el.gridCol - 9.5) * spread;
            const gz = (el.gridRow - 5.2) * spread;
            const gy = isSelected ? -3.8 : -4.5;
            _vec3.set(gx, gy, gz);
            node.currentPos.lerp(_vec3, 1 - Math.exp(-7 * delta));
            node.currentRotY = THREE.MathUtils.damp(node.currentRotY, 0, 7, delta);
          } else {
            // 3D Mendeleev Spiral Helix arrangement
            const angle = el.number * 0.34;
            const radius = (6.8 + (el.period - 1) * 0.45) * (1 + exp * 0.35);
            const hx = Math.cos(angle) * radius;
            const hz = Math.sin(angle) * radius;
            const hy = 4.2 - el.number * 0.075 + (isSelected ? 0.5 : 0);
            _vec3.set(hx, hy, hz);
            node.currentPos.lerp(_vec3, 1 - Math.exp(-7 * delta));
            node.currentRotY = THREE.MathUtils.damp(
              node.currentRotY,
              -angle + Math.PI / 2,
              7,
              delta
            );
          }

          node.root.position.copy(node.currentPos);
          node.root.rotation.y = node.currentRotY;
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
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-slate-800 bg-[#0b0f19]">
      {/* Isolated WebGL Canvas Container */}
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top-Left Spec Readout (Leaves Center 100% Unobstructed) */}
      <div className="absolute top-4 left-4 pointer-events-none select-none bg-[#0f172a]/90 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
            #{selectedElement.number} {selectedElement.symbol}
          </span>
          <span className="text-sm font-semibold text-white">
            {selectedElement.name}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            · {selectedElement.atomicMass} u
          </span>
        </div>
        <div className="mt-1 text-xs font-mono text-slate-300">
          Config: {selectedElement.electronConfig} · Shells: [{selectedElement.shells.join(', ')}]
        </div>
      </div>

      {/* Unified Collapsible Bottom Control Dock (Zero Side-Panel Clutter, Zero Backdrop-Blur over WebGL) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-4 w-[min(920px,94%)] transition-transform duration-200 ${
          dockCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((p) => !p)}
            className="px-3.5 py-1 text-xs font-mono font-medium text-slate-200 bg-[#111827] border border-b-0 border-slate-700 rounded-t-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {dockCollapsed ? '▴ Show 3D Controls (H)' : '▾ Hide 3D Controls (H)'}
          </button>
        </div>

        <div className="bg-[#111827]/95 border border-slate-700 rounded-xl p-3 text-slate-200 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* 3D Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onChangeSceneMode('atom-bohr')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  sceneMode === 'atom-bohr'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                3D Bohr & Orbitals
              </button>
              <button
                type="button"
                onClick={() => onChangeSceneMode('periodic-relief')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  sceneMode === 'periodic-relief'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                3D Periodic Relief
              </button>
              <button
                type="button"
                onClick={() => onChangeSceneMode('periodic-helix')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  sceneMode === 'periodic-helix'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                3D Mendeleev Helix
              </button>
            </div>

            {/* Dynamic Mode-Specific Controls */}
            {sceneMode === 'atom-bohr' ? (
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowOrbitals((prev) => !prev)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                    showOrbitals
                      ? 'bg-sky-950 border-sky-500 text-sky-200'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  Quantum Lobes: {showOrbitals ? 'Visible' : 'Hidden'}
                </button>

                <label className="flex items-center gap-2 text-xs font-mono text-slate-300 whitespace-nowrap">
                  <span>Orbit Speed: {orbitalSpeed.toFixed(1)}x</span>
                  <input
                    type="range"
                    min="0"
                    max="2.5"
                    step="0.1"
                    value={orbitalSpeed}
                    onChange={(e) => setOrbitalSpeed(parseFloat(e.target.value))}
                    className="w-20 accent-sky-500"
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Tower Metric:</span>
                {(
                  [
                    ['electronegativity', 'Electronegativity'],
                    ['ionizationEnergy', 'Ionization E.'],
                    ['atomicRadius', 'Atomic Radius'],
                    ['meltingPoint', 'Melting Point'],
                  ] as [ReliefMetric, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setReliefMetric(key)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      reliefMetric === key
                        ? 'bg-slate-200 text-slate-900'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Exploded Separation Slider & Camera Reset */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 whitespace-nowrap">
                <span>Expand: {Math.round(explodedFactor * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explodedFactor}
                  onChange={(e) => setExplodedFactor(parseFloat(e.target.value))}
                  className="w-20 accent-sky-500"
                />
              </label>

              <button
                type="button"
                onClick={() => resetCameraRef.current?.(sceneMode)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                Reset Camera
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
