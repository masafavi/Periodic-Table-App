import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  FlaskConical,
  Droplets,
  Zap,
} from 'lucide-react';

interface ReactionPreset {
  id: string;
  title: string;
  equation: string;
  reactantA: string;
  reactantB: string;
  productC: string;
  eaUncatalyzed: number; // kJ/mol
  eaCatalyzed: number;   // kJ/mol
  deltaH: number;        // kJ/mol (negative = exothermic, positive = endothermic)
  catalystName: string;
  description: string;
}

const REACTION_PRESETS: ReactionPreset[] = [
  {
    id: 'haber',
    title: 'Haber-Bosch Ammonia Synthesis',
    equation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    reactantA: 'N₂',
    reactantB: 'H₂',
    productC: 'NH₃',
    eaUncatalyzed: 92,
    eaCatalyzed: 42,
    deltaH: -92.4,
    catalystName: 'Fe₃O₄ / K₂O Promoted Iron Surface',
    description: 'Cleaving the N≡N triple bond (945 kJ/mol) has a massive activation barrier in the gas phase. A promoted iron catalyst adsorbs and dissociates N₂ and H₂ on active surface sites, lowering Eₐ dramatically.',
  },
  {
    id: 'hi-decomp',
    title: 'Hydrogen Iodide Bimolecular Formation',
    equation: 'H₂(g) + I₂(g) ⇌ 2HI(g)',
    reactantA: 'H₂',
    reactantB: 'I₂',
    productC: '2HI',
    eaUncatalyzed: 165,
    eaCatalyzed: 58,
    deltaH: -9.5,
    catalystName: 'Platinum (Pt) Surface Catalyst',
    description: 'Classic elementary gas-phase collision benchmark studied by Max Trautz and William Lewis to formulate Arrhenius Collision Theory: k = A · exp(-Eₐ / RT).',
  },
  {
    id: 'no2-co',
    title: 'NO₂ + CO Oxygen Transfer',
    equation: 'NO₂(g) + CO(g) → NO(g) + CO₂(g)',
    reactantA: 'NO₂',
    reactantB: 'CO',
    productC: 'NO + CO₂',
    eaUncatalyzed: 132,
    eaCatalyzed: 55,
    deltaH: -226.0,
    catalystName: 'Rhodium / Platinum Three-Way Converter',
    description: 'Strongly exothermic oxygen-atom transfer reaction central to automotive catalytic converters. Requires proper steric orientation and kinetic energy ≥ Eₐ upon collision.',
  },
  {
    id: 'endo-n2o4',
    title: 'Endothermic NOCl Dissociation',
    equation: '2NOCl(g) ⇌ 2NO(g) + Cl₂(g)',
    reactantA: 'NOCl',
    reactantB: 'NOCl',
    productC: 'NO + Cl₂',
    eaUncatalyzed: 100,
    eaCatalyzed: 62,
    deltaH: +77.2,
    catalystName: 'UV Photolytic / Surface Sensitizer',
    description: 'An endothermic reaction (ΔH > 0) where product potential energy lies higher than reactant potential energy; elevated temperature shifts equilibrium toward products by Le Chatelier’s principle.',
  },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'A' | 'B' | 'C';
  flashTimer: number;
}

export const ReactionSimulator: React.FC = () => {
  const [simTab, setSimTab] = useState<'kinetics' | 'titration'>('kinetics');

  // --- KINETICS STATE ---
  const [selectedRxn, setSelectedRxn] = useState<ReactionPreset>(REACTION_PRESETS[0]);
  const [tempK, setTempK] = useState<number>(450);
  const [initialCountA, setInitialCountA] = useState<number>(28);
  const [initialCountB, setInitialCountB] = useState<number>(28);
  const [useCatalyst, setUseCatalyst] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const [counts, setCounts] = useState({ A: 28, B: 28, C: 0, collisions: 0, effectiveCollisions: 0 });
  const [history, setHistory] = useState<{ t: number; A: number; C: number }[]>([
    { t: 0, A: 28, C: 0 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const metricsRef = useRef({ collisions: 0, effective: 0, elapsed: 0 });

  const activeEa = useCatalyst ? selectedRxn.eaCatalyzed : selectedRxn.eaUncatalyzed;

  // Calculate Arrhenius Rate Constant k (relative educational scale)
  const arrheniusK = useMemo(() => {
    const R = 8.314e-3; // kJ/(mol·K)
    // Scale Ea by 0.22 for accessible visual classroom simulation dynamics
    const expTerm = Math.exp(-activeEa / (R * tempK * 14));
    return expTerm;
  }, [activeEa, tempK]);

  const initParticles = (countA: number, countB: number) => {
    const arr: Particle[] = [];
    const speedBase = Math.sqrt(tempK / 300) * 1.9;
    for (let i = 0; i < countA; i++) {
      const angle = Math.random() * Math.PI * 2;
      arr.push({
        x: 30 + Math.random() * 460,
        y: 30 + Math.random() * 220,
        vx: Math.cos(angle) * speedBase,
        vy: Math.sin(angle) * speedBase,
        type: 'A',
        flashTimer: 0,
      });
    }
    for (let i = 0; i < countB; i++) {
      const angle = Math.random() * Math.PI * 2;
      arr.push({
        x: 30 + Math.random() * 460,
        y: 30 + Math.random() * 220,
        vx: Math.cos(angle) * speedBase,
        vy: Math.sin(angle) * speedBase,
        type: 'B',
        flashTimer: 0,
      });
    }
    particlesRef.current = arr;
    metricsRef.current = { collisions: 0, effective: 0, elapsed: 0 };
    setCounts({ A: countA, B: countB, C: 0, collisions: 0, effectiveCollisions: 0 });
    setHistory([{ t: 0, A: countA, C: 0 }]);
  };

  useEffect(() => {
    initParticles(initialCountA, initialCountB);
  }, [selectedRxn, initialCountA, initialCountB]);

  const simParamsRef = useRef({ tempK, activeEa, isRunning });
  useEffect(() => {
    simParamsRef.current = { tempK, activeEa, isRunning };
  }, [tempK, activeEa, isRunning]);

  useEffect(() => {
    if (simTab !== 'kinetics') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let frameTick = 0;

    const renderLoop = () => {
      const { tempK: T, activeEa: Ea, isRunning: running } = simParamsRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const pts = particlesRef.current;
      const speedScale = Math.sqrt(T / 350);

      if (running) {
        frameTick++;
        // Move particles & bounce off walls
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          p.x += p.vx * speedScale;
          p.y += p.vy * speedScale;
          if (p.flashTimer > 0) p.flashTimer--;

          if (p.x < 10) {
            p.x = 10;
            p.vx = Math.abs(p.vx);
          } else if (p.x > W - 10) {
            p.x = W - 10;
            p.vx = -Math.abs(p.vx);
          }
          if (p.y < 10) {
            p.y = 10;
            p.vy = Math.abs(p.vy);
          } else if (p.y > H - 10) {
            p.y = H - 10;
            p.vy = -Math.abs(p.vy);
          }
        }

        // Pairwise collision detection
        const reactionProb = Math.min(0.85, Math.exp(-Ea / (0.18 * T)));
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const p1 = pts[i];
            const p2 = pts[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 256) {
              // Elastic velocity exchange
              const tvx = p1.vx;
              const tvy = p1.vy;
              p1.vx = p2.vx;
              p1.vy = p2.vy;
              p2.vx = tvx;
              p2.vy = tvy;

              // Separate slightly to prevent sticking
              const dist = Math.sqrt(distSq) || 1;
              const overlap = (16 - dist) * 0.5;
              p1.x -= (dx / dist) * overlap;
              p1.y -= (dy / dist) * overlap;
              p2.x += (dx / dist) * overlap;
              p2.y += (dy / dist) * overlap;

              if (
                (p1.type === 'A' && p2.type === 'B') ||
                (p1.type === 'B' && p2.type === 'A')
              ) {
                metricsRef.current.collisions += 1;
                if (Math.random() < reactionProb) {
                  p1.type = 'C';
                  p2.type = 'C';
                  p1.flashTimer = 18;
                  p2.flashTimer = 18;
                  metricsRef.current.effective += 1;
                }
              }
            }
          }
        }

        if (frameTick % 20 === 0) {
          let cA = 0;
          let cB = 0;
          let cC = 0;
          for (const p of pts) {
            if (p.type === 'A') cA++;
            else if (p.type === 'B') cB++;
            else cC++;
          }
          metricsRef.current.elapsed += 1;
          setCounts({
            A: cA,
            B: cB,
            C: cC,
            collisions: metricsRef.current.collisions,
            effectiveCollisions: metricsRef.current.effective,
          });
          setHistory((prev) => {
            const next = [...prev, { t: metricsRef.current.elapsed, A: cA, C: cC }];
            return next.length > 40 ? next.slice(next.length - 40) : next;
          });
        }
      }

      // Draw chamber
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // Subtle coordinate grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let gx = 40; gx < W; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 40; gy < H; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      // Draw particles
      for (const p of pts) {
        if (p.flashTimer > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2);
        if (p.type === 'A') ctx.fillStyle = '#38bdf8';
        else if (p.type === 'B') ctx.fillStyle = '#f59e0b';
        else ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [simTab]);

  // --- TITRATION LAB STATE ---
  const [analyteType, setAnalyteType] = useState<'weak-acid' | 'strong-acid'>('weak-acid');
  const [titrantAddedMl, setTitrantAddedMl] = useState<number>(0.0);
  const [indicator, setIndicator] = useState<'phenolphthalein' | 'bromothymol' | 'methyl-red'>('phenolphthalein');

  // Compute exact pH for 25.0 mL of 0.100 M Acid titrated with 0.100 M NaOH
  const computeTitrationPh = (vBaseMl: number, type: 'weak-acid' | 'strong-acid'): number => {
    const Va = 25.0; // mL
    const Ca = 0.100; // M
    const Cb = 0.100; // M
    const Ka = 1.75e-5; // Acetic acid pKa = 4.757
    const Kw = 1.0e-14;
    const totalVol = Va + vBaseMl;
    const molAcid = Va * Ca;
    const molBase = vBaseMl * Cb;

    if (type === 'strong-acid') {
      if (molBase < molAcid - 1e-7) {
        const hPlus = (molAcid - molBase) / totalVol;
        return -Math.log10(hPlus);
      }
      if (Math.abs(molBase - molAcid) <= 1e-7) {
        return 7.0;
      }
      const ohMinus = (molBase - molAcid) / totalVol;
      return 14.0 + Math.log10(ohMinus);
    } else {
      // Weak acid (CH3COOH) + Strong base (NaOH)
      if (vBaseMl <= 0.001) {
        const hPlus = Math.sqrt(Ka * Ca);
        return -Math.log10(hPlus);
      }
      if (molBase < molAcid - 1e-5) {
        // Henderson-Hasselbalch buffer region
        const ratio = molBase / (molAcid - molBase);
        return -Math.log10(Ka) + Math.log10(ratio);
      }
      if (Math.abs(molBase - molAcid) <= 1e-5) {
        // Equivalence point: hydrolysis of acetate ion CH3COO-
        const cSalt = molAcid / totalVol;
        const Kb = Kw / Ka;
        const ohMinus = Math.sqrt(Kb * cSalt);
        return 14.0 + Math.log10(ohMinus);
      }
      // Excess strong base
      const ohMinus = (molBase - molAcid) / totalVol;
      return 14.0 + Math.log10(ohMinus);
    }
  };

  const currentPh = computeTitrationPh(titrantAddedMl, analyteType);

  const getFlaskLiquidColor = (ph: number): { fill: string; label: string } => {
    if (indicator === 'phenolphthalein') {
      if (ph < 8.2) return { fill: 'rgba(226, 232, 240, 0.55)', label: 'Colorless (Acidic / Neutral)' };
      if (ph < 9.8) return { fill: 'rgba(244, 114, 182, 0.55)', label: 'Faint Endpoint Pink (pH 8.2–9.8)' };
      return { fill: 'rgba(219, 39, 119, 0.78)', label: 'Deep Magenta (Basic, pH > 9.8)' };
    }
    if (indicator === 'bromothymol') {
      if (ph < 6.0) return { fill: 'rgba(250, 204, 21, 0.65)', label: 'Yellow (Acidic, pH < 6.0)' };
      if (ph <= 7.6) return { fill: 'rgba(16, 185, 129, 0.65)', label: 'Emerald Green (Neutral Transition)' };
      return { fill: 'rgba(37, 99, 235, 0.70)', label: 'Royal Blue (Basic, pH > 7.6)' };
    }
    // Methyl red
    if (ph < 4.4) return { fill: 'rgba(239, 68, 68, 0.68)', label: 'Crimson Red (pH < 4.4)' };
    if (ph <= 6.2) return { fill: 'rgba(249, 115, 22, 0.65)', label: 'Orange Transition (pH 4.4–6.2)' };
    return { fill: 'rgba(250, 204, 21, 0.62)', label: 'Canary Yellow (pH > 6.2)' };
  };

  const flaskColor = getFlaskLiquidColor(currentPh);

  return (
    <div className="space-y-6">
      {/* Mode Selector Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Real-Time Chemical Reaction & Equilibrium Simulator
          </h2>
          <p className="text-xs text-slate-500">
            Interactive Maxwell-Boltzmann collision kinetics, potential energy surfaces, and quantitative acid-base titration curves.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSimTab('kinetics')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              simTab === 'kinetics'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Collision Kinetics & Energy Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setSimTab('titration')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              simTab === 'titration'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Acid-Base Titration Lab</span>
          </button>
        </div>
      </div>

      {simTab === 'kinetics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 7 Columns: Live Particle Collision Stage & Potential Energy Diagram */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-5 flex flex-col justify-between">
            {/* Reaction Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {REACTION_PRESETS.map((rxn) => (
                <button
                  key={rxn.id}
                  type="button"
                  onClick={() => setSelectedRxn(rxn)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedRxn.id === rxn.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {rxn.equation}
                </button>
              ))}
            </div>

            {/* Live Particle Collision Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-sky-600 font-semibold">
                    ● [{selectedRxn.reactantA}]: {counts.A}
                  </span>
                  <span>·</span>
                  <span className="text-amber-600 font-semibold">
                    ● [{selectedRxn.reactantB}]: {counts.B}
                  </span>
                  <span>·</span>
                  <span className="text-emerald-600 font-semibold">
                    ● [{selectedRxn.productC}]: {counts.C}
                  </span>
                </div>
                <div className="text-slate-500 tabular-nums">
                  Collisions: <strong className="text-slate-900">{counts.collisions}</strong> · Reactive (E ≥ Eₐ):{' '}
                  <strong className="text-emerald-700">{counts.effectiveCollisions}</strong>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0f172a]">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={250}
                  className="w-full h-[250px] block"
                />
              </div>
            </div>

            {/* Dual SVG Charts: Potential Energy Profile (Left) + Live Concentration Curve (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Potential Energy Reaction Coordinate SVG */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-semibold text-slate-800">Potential Energy Surface</span>
                  <span className="text-blue-700 font-bold">
                    Eₐ = {activeEa} kJ/mol · ΔH = {selectedRxn.deltaH > 0 ? `+${selectedRxn.deltaH}` : selectedRxn.deltaH} kJ/mol
                  </span>
                </div>
                <svg viewBox="0 0 280 155" className="w-full h-36 overflow-visible">
                  {/* Axes */}
                  <line x1="28" y1="12" x2="28" y2="132" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="28" y1="132" x2="265" y2="132" stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="34" y="22" className="text-[9px] fill-slate-500 font-mono">
                    Potential Energy (kJ/mol)
                  </text>
                  <text x="165" y="148" className="text-[9px] fill-slate-500 font-mono">
                    Reaction Coordinate →
                  </text>

                  {/* Calculate Y positions */}
                  {(() => {
                    const yReactant = selectedRxn.deltaH < 0 ? 78 : 104;
                    const yProduct = selectedRxn.deltaH < 0 ? 114 : 68;
                    const peakUncat = Math.max(18, yReactant - selectedRxn.eaUncatalyzed * 0.36);
                    const peakCat = Math.max(28, yReactant - selectedRxn.eaCatalyzed * 0.36);

                    return (
                      <>
                        {/* Uncatalyzed curve */}
                        <path
                          d={`M 30 ${yReactant} L 75 ${yReactant} C 105 ${yReactant}, 115 ${peakUncat}, 145 ${peakUncat} C 175 ${peakUncat}, 185 ${yProduct}, 215 ${yProduct} L 260 ${yProduct}`}
                          fill="none"
                          stroke={useCatalyst ? '#94a3b8' : '#2563eb'}
                          strokeWidth={useCatalyst ? '1.5' : '2.5'}
                          strokeDasharray={useCatalyst ? '4 3' : undefined}
                        />
                        {/* Catalyzed curve */}
                        {useCatalyst && (
                          <path
                            d={`M 30 ${yReactant} L 75 ${yReactant} C 105 ${yReactant}, 115 ${peakCat}, 145 ${peakCat} C 175 ${peakCat}, 185 ${yProduct}, 215 ${yProduct} L 260 ${yProduct}`}
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2.5"
                          />
                        )}
                        {/* Labels */}
                        <text x="34" y={yReactant - 5} className="text-[9px] font-mono fill-slate-700 font-semibold">
                          Reactants
                        </text>
                        <text x="216" y={yProduct - 5} className="text-[9px] font-mono fill-slate-700 font-semibold">
                          Products
                        </text>
                        <circle
                          cx="145"
                          cy={useCatalyst ? peakCat : peakUncat}
                          r="3.5"
                          fill={useCatalyst ? '#059669' : '#2563eb'}
                        />
                        <text
                          x="145"
                          y={(useCatalyst ? peakCat : peakUncat) - 6}
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-slate-800 font-bold"
                        >
                          ‡ Transition State
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Real-Time Concentration [A](t) & [C](t) Time-Series */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-semibold text-slate-800">Concentration vs Time</span>
                  <span className="text-slate-500">
                    Blue: [Reactant] · Green: [Product]
                  </span>
                </div>
                <svg viewBox="0 0 280 155" className="w-full h-36 overflow-visible">
                  <line x1="28" y1="12" x2="28" y2="132" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="28" y1="132" x2="265" y2="132" stroke="#94a3b8" strokeWidth="1.5" />
                  {(() => {
                    const maxN = Math.max(10, initialCountA + initialCountB);
                    const ptsA = history
                      .map((h, idx) => {
                        const x = 28 + (idx / Math.max(1, history.length - 1)) * 232;
                        const y = 132 - (h.A / maxN) * 110;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ');
                    const ptsC = history
                      .map((h, idx) => {
                        const x = 28 + (idx / Math.max(1, history.length - 1)) * 232;
                        const y = 132 - (h.C / maxN) * 110;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ');

                    return (
                      <>
                        {history.length > 1 && (
                          <>
                            <polyline
                              fill="none"
                              stroke="#0284c7"
                              strokeWidth="2.2"
                              points={ptsA}
                            />
                            <polyline
                              fill="none"
                              stroke="#059669"
                              strokeWidth="2.2"
                              points={ptsC}
                            />
                          </>
                        )}
                      </>
                    );
                  })()}
                  <text x="175" y="148" className="text-[9px] fill-slate-500 font-mono">
                    Simulation Time (t) →
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Control & Concept Deck */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <div className="text-xs font-mono text-slate-500">
                  Arrhenius Collision Theory · {selectedRxn.deltaH < 0 ? 'Exothermic (ΔH < 0)' : 'Endothermic (ΔH > 0)'}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedRxn.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {selectedRxn.description}
                </p>
              </div>

              {/* Parameter Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="font-semibold text-slate-700">System Temperature (T)</span>
                    <span className="font-bold text-blue-700 tabular-nums">
                      {tempK} K ({(tempK - 273.15).toFixed(0)} °C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1000"
                    step="25"
                    value={tempK}
                    onChange={(e) => setTempK(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700">Initial [{selectedRxn.reactantA}]₀</span>
                      <span className="font-bold text-sky-600 tabular-nums">{initialCountA} mol</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="2"
                      value={initialCountA}
                      onChange={(e) => setInitialCountA(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-700">Initial [{selectedRxn.reactantB}]₀</span>
                      <span className="font-bold text-amber-600 tabular-nums">{initialCountB} mol</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="2"
                      value={initialCountB}
                      onChange={(e) => setInitialCountB(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>

                {/* Catalyst Toggle */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Heterogeneous Catalyst: {selectedRxn.catalystName}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      Lowers Eₐ from {selectedRxn.eaUncatalyzed} kJ/mol → {selectedRxn.eaCatalyzed} kJ/mol
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseCatalyst((p) => !p)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                      useCatalyst
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                  >
                    {useCatalyst ? 'Catalyst Active' : 'Add Catalyst'}
                  </button>
                </div>

                {/* Live Arrhenius Equation Readout */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 font-mono text-xs space-y-1.5">
                  <div className="text-slate-500">Arrhenius Rate Law Expression:</div>
                  <div className="text-sm font-bold text-slate-900">
                    k = A · exp(−Eₐ / RT)
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-slate-400 block">Effective Barrier (Eₐ)</span>
                      <span className="font-bold text-slate-900 tabular-nums">{activeEa} kJ/mol</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Boltzmann Factor</span>
                      <span className="font-bold text-emerald-700 tabular-nums">
                        {(arrheniusK * 100).toFixed(1)}% reactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Playback Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning((r) => !r)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? 'Pause Simulation' : 'Resume Simulation'}</span>
              </button>
              <button
                type="button"
                onClick={() => initParticles(initialCountA, initialCountB)}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Chamber</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: INTERACTIVE ACID-BASE TITRATION LAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 7 Columns: Interactive Burette + Erlenmeyer Flask + Live Titration Curve */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Interactive Apparatus Diagram (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-mono font-semibold text-slate-700 mb-2">
                Volumetric Burette & Flask
              </div>
              <svg viewBox="0 0 200 310" className="w-44 h-72">
                {/* Ring Stand Base & Rod */}
                <rect x="20" y="292" width="160" height="10" rx="3" fill="#475569" />
                <rect x="34" y="12" width="6" height="282" fill="#64748b" />
                <rect x="38" y="65" width="62" height="5" fill="#64748b" />

                {/* Burette Column */}
                <rect x="92" y="14" width="16" height="145" fill="#f8fafc" stroke="#475569" strokeWidth="2" />
                {/* NaOH Titrant Level in Burette */}
                {(() => {
                  const fillRatio = Math.max(0.05, 1 - titrantAddedMl / 50);
                  const h = 135 * fillRatio;
                  const y = 18 + (135 - h);
                  return (
                    <rect
                      x="94"
                      y={y}
                      width="12"
                      height={h}
                      fill="rgba(56, 189, 248, 0.45)"
                    />
                  );
                })()}
                {/* Burette Graduation Marks */}
                {Array.from({ length: 10 }, (_, i) => (
                  <line
                    key={i}
                    x1="92"
                    y1={22 + i * 13}
                    x2="100"
                    y2={22 + i * 13}
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                ))}
                {/* Stopcock Valve */}
                <rect x="86" y="159" width="28" height="7" rx="2" fill="#dc2626" />
                <polygon points="97,166 103,166 101,182 99,182" fill="#475569" />

                {/* Falling Drop */}
                {titrantAddedMl > 0 && (
                  <circle cx="100" cy="194" r="3" fill="#38bdf8" />
                )}

                {/* Erlenmeyer Flask */}
                <path
                  d="M 88 205 L 88 225 L 58 282 Q 55 290 65 290 L 135 290 Q 145 290 142 282 L 112 225 L 112 205"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2.5"
                />
                {/* Solution Fill inside Erlenmeyer Flask */}
                <path
                  d="M 74 252 L 59 282 Q 56 289 65 289 L 135 289 Q 144 289 141 282 L 126 252 Z"
                  fill={flaskColor.fill}
                />
                {/* Magnetic Stir Bar */}
                <rect x="90" y="283" width="20" height="4" rx="2" fill="#ffffff" stroke="#334155" strokeWidth="1" />
              </svg>
              <div className="text-[11px] font-mono text-slate-600 text-center mt-1">
                {flaskColor.label}
              </div>
            </div>

            {/* Live Titration Curve SVG (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-500">Digital pH Electrode Readout</div>
                  <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                    pH {currentPh.toFixed(2)}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-500">0.100 M NaOH Added</div>
                  <div className="text-xl font-bold text-blue-600 tabular-nums">
                    {titrantAddedMl.toFixed(2)} mL
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-mono font-semibold text-slate-700 mb-2">
                  Titration Curve: pH vs Volume of 0.100 M NaOH (Equivalence @ 25.00 mL)
                </div>
                <svg viewBox="0 0 320 200" className="w-full h-48 overflow-visible">
                  {/* Grid Lines */}
                  {[2, 4, 7, 10, 12].map((phVal) => {
                    const y = 175 - (phVal / 14) * 155;
                    return (
                      <g key={phVal}>
                        <line
                          x1="34"
                          y1={y}
                          x2="305"
                          y2={y}
                          stroke={phVal === 7 ? '#94a3b8' : '#e2e8f0'}
                          strokeDasharray={phVal === 7 ? '3 3' : undefined}
                        />
                        <text x="26" y={y + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-500">
                          {phVal}
                        </text>
                      </g>
                    );
                  })}
                  {/* Axes */}
                  <line x1="34" y1="15" x2="34" y2="175" stroke="#475569" strokeWidth="1.5" />
                  <line x1="34" y1="175" x2="305" y2="175" stroke="#475569" strokeWidth="1.5" />

                  {/* Full Theoretical Titration Curve */}
                  {(() => {
                    const pts: string[] = [];
                    for (let v = 0; v <= 50; v += 0.5) {
                      const ph = computeTitrationPh(v, analyteType);
                      const x = 34 + (v / 50) * 265;
                      const y = 175 - (Math.max(0, Math.min(14, ph)) / 14) * 155;
                      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                    }
                    const curX = 34 + (titrantAddedMl / 50) * 265;
                    const curY = 175 - (Math.max(0, Math.min(14, currentPh)) / 14) * 155;
                    const eqPh = analyteType === 'weak-acid' ? 8.73 : 7.0;
                    const eqX = 34 + (25 / 50) * 265;
                    const eqY = 175 - (eqPh / 14) * 155;

                    return (
                      <>
                        <polyline
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.2"
                          points={pts.join(' ')}
                        />
                        {/* Equivalence Point Marker */}
                        <circle cx={eqX} cy={eqY} r="3.5" fill="#f59e0b" />
                        <text x={eqX + 6} y={eqY + 3} className="text-[9px] font-mono fill-amber-700 font-semibold">
                          Eq. Pt (pH {eqPh.toFixed(2)})
                        </text>

                        {/* Current Operating Point */}
                        <circle cx={curX} cy={curY} r="5.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                      </>
                    );
                  })()}

                  <text x="168" y="193" textAnchor="middle" className="text-[9px] font-mono fill-slate-600">
                    Volume of 0.100 M NaOH Titrant Added (0 → 50 mL)
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Titration Control Deck */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="text-xs font-mono text-slate-500">
                  Volumetric Acid-Base Analysis · 25.00 mL Analyte
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Burette Titrant Delivery Controls
                </h3>
              </div>

              {/* Analyte Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">
                  1. Select Flask Analyte (25.00 mL @ 0.100 M):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnalyteType('weak-acid')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors ${
                      analyteType === 'weak-acid'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    CH₃COOH (Weak Acid)
                    <span className="block text-[10px] font-mono text-slate-500">pKₐ = 4.76 · Eq pH 8.73</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyteType('strong-acid')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors ${
                      analyteType === 'strong-acid'
                        ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    HCl (Strong Acid)
                    <span className="block text-[10px] font-mono text-slate-500">Complete Dissociation · Eq pH 7.00</span>
                  </button>
                </div>
              </div>

              {/* Indicator Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">
                  2. Colorimetric Indicator:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      ['phenolphthalein', 'Phenolphthalein (pH 8.2–10.0)'],
                      ['bromothymol', 'Bromothymol Blue (pH 6.0–7.6)'],
                      ['methyl-red', 'Methyl Red (pH 4.4–6.2)'],
                    ] as const
                  ).map(([indKey, label]) => (
                    <button
                      key={indKey}
                      type="button"
                      onClick={() => setIndicator(indKey)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        indicator === indKey
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Burette Volume Slider & Precision Dropwise Buttons */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-slate-700">NaOH Titrant Volume:</span>
                  <span className="font-bold text-blue-600 tabular-nums">{titrantAddedMl.toFixed(2)} mL / 50.00 mL</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.05"
                  value={titrantAddedMl}
                  onChange={(e) => setTitrantAddedMl(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTitrantAddedMl((v) => Math.min(50, +(v + 5.0).toFixed(2)))}
                    className="py-2 px-2 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800"
                  >
                    +5.0 mL
                  </button>
                  <button
                    type="button"
                    onClick={() => setTitrantAddedMl((v) => Math.min(50, +(v + 1.0).toFixed(2)))}
                    className="py-2 px-2 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800"
                  >
                    +1.0 mL
                  </button>
                  <button
                    type="button"
                    onClick={() => setTitrantAddedMl((v) => Math.min(50, +(v + 0.05).toFixed(2)))}
                    className="py-2 px-2 text-xs font-mono font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-800"
                  >
                    +1 Drop (0.05 mL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTitrantAddedMl(12.5)}
                    className="py-2 px-2 text-xs font-mono font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900"
                  >
                    ½ Eq (12.5 mL)
                  </button>
                </div>
              </div>

              {/* Chemical Regime Annotation */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1">
                <div className="font-mono font-bold text-slate-900">
                  Current Regime:{' '}
                  {titrantAddedMl === 0
                    ? 'Initial Pure Acid Solution'
                    : Math.abs(titrantAddedMl - 12.5) < 0.3 && analyteType === 'weak-acid'
                    ? 'Half-Equivalence Point (pH = pKₐ = 4.76 Maximum Buffer Capacity)'
                    : titrantAddedMl < 24.95
                    ? analyteType === 'weak-acid'
                      ? 'Henderson-Hasselbalch Buffer Region ([HA] & [A⁻] Coexist)'
                      : 'Excess Hydronium [H₃O⁺] Before Equivalence'
                    : Math.abs(titrantAddedMl - 25.0) <= 0.06
                    ? '★ Stoichiometric Equivalence Point (Moles Acid = Moles NaOH)'
                    : 'Excess Strong Base [OH⁻] Regime'}
                </div>
                <div className="font-mono text-slate-600 tabular-nums">
                  [H₃O⁺] = {Math.pow(10, -currentPh).toExponential(2)} M · [OH⁻] ={' '}
                  {Math.pow(10, -(14 - currentPh)).toExponential(2)} M
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setTitrantAddedMl(25.0)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Jump to Equivalence Point (25.00 mL)
              </button>
              <button
                type="button"
                onClick={() => setTitrantAddedMl(0)}
                className="py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset Burette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
