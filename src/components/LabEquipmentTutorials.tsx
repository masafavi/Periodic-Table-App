import React, { useState } from 'react';
import {
  Flame,
  Sun,
  FlaskConical,
  Scale,
  CheckSquare,
  Square,
  AlertOctagon,
  Award,
} from 'lucide-react';

type ApparatusId = 'uv-vis' | 'bunsen' | 'distillation' | 'balance';

interface Hotspot {
  id: string;
  title: string;
  role: string;
  errorToAvoid: string;
}

const APPARATUS_HOTSPOTS: Record<ApparatusId, Hotspot[]> = {
  'uv-vis': [
    {
      id: 'source',
      title: '1. Tungsten-Halogen / Deuterium Lamp',
      role: 'Emits continuous polychromatic radiation across UV (190–380 nm) and Visible (380–800 nm) wavelengths.',
      errorToAvoid: 'Never take measurements before allowing the lamp 10 minutes to reach thermal equilibrium.',
    },
    {
      id: 'monochromator',
      title: '2. Diffraction Grating Monochromator',
      role: 'Disperses polychromatic light and isolates a narrow wavelength band (λmax) via an exit slit.',
      errorToAvoid: 'Selecting a wavelength off the absorption peak (λmax) reduces sensitivity and violates Beer’s Law linearity.',
    },
    {
      id: 'cuvette',
      title: '3. Quartz / Optical Glass Cuvette (l = 1.00 cm)',
      role: 'Holds the blank reference or analyte solution with an exact optical pathlength l.',
      errorToAvoid: 'Touching the clear optical faces leaves skin oils that scatter photons; hold only by the frosted sides and wipe with lint-free Kimwipes.',
    },
    {
      id: 'detector',
      title: '4. Photodiode Array Detector',
      role: 'Measures transmitted intensity I relative to blank intensity I₀ and computes A = −log₁₀(I / I₀).',
      errorToAvoid: 'Absorbance values A > 2.0 (< 1% transmittance) suffer from stray-light nonlinearity—dilute the sample first.',
    },
  ],
  bunsen: [
    {
      id: 'collar',
      title: '1. Rotatable Air-Intake Collar',
      role: 'Regulates primary O₂ entrainment into the Venturi barrel before combustion.',
      errorToAvoid: 'Lighting the burner with the air collar wide open can cause the flame to "strike back" and burn inside the metal barrel.',
    },
    {
      id: 'inner-cone',
      title: '2. Tip of Inner Blue Cone (Hottest Zone ~1500 °C)',
      role: 'Region of stoichiometric premixed CH₄ + 2O₂ combustion; ideal position for crucible ignition and flame tests.',
      errorToAvoid: 'Placing glassware deep inside the cool unburned gas cone (300 °C) causes uneven thermal stress.',
    },
    {
      id: 'needle-valve',
      title: '3. Base Gas Needle Valve',
      role: 'Controls methane/natural gas flow rate and overall flame height.',
      errorToAvoid: 'Never leave a roaring blue flame unattended; turn the collar to the visible yellow safety flame when not actively heating.',
    },
  ],
  distillation: [
    {
      id: 'vigreux',
      title: '1. Vigreux Fractionating Column',
      role: 'Glass indentations provide high surface area for repeated vaporization-condensation cycles (theoretical plates).',
      errorToAvoid: 'Heating the pot too rapidly floods the column, destroying vapor-liquid equilibrium separation.',
    },
    {
      id: 'thermometer',
      title: '2. Still-Head Thermometer Bulb Position',
      role: 'Measures the exact condensation temperature of the vapor entering the condenser side-arm.',
      errorToAvoid: 'Positioning the bulb too high or too low gives inaccurate boiling point readings; align the bulb just below the side-arm.',
    },
    {
      id: 'condenser',
      title: '3. Liebig Counter-Current Water Condenser',
      role: 'Cools rising vapor into liquid distillate.',
      errorToAvoid: 'Water MUST enter at the lowest port and exit at the upper port (against gravity) so the jacket stays completely full without air pockets.',
    },
    {
      id: 'boiling-chips',
      title: '4. Boiling Stones / Stir Bar in Round-Bottom Pot',
      role: 'Provides nucleation sites to prevent superheating and violent bumping.',
      errorToAvoid: 'Never drop boiling chips into an already hot, near-boiling liquid—it will erupt instantaneously.',
    },
  ],
  balance: [
    {
      id: 'draft-shield',
      title: '1. Sliding Glass Draft Shield Doors',
      role: 'Eliminates room air currents and HVAC convection that cause milligram-scale fluctuations.',
      errorToAvoid: 'Never record a final mass with the draft shield doors open.',
    },
    {
      id: 'weigh-pan',
      title: '2. Electromagnetic Force Restoration Pan',
      role: 'Measures mass to ±0.0001 g (0.1 mg) precision by countering gravity with a calibrated solenoid current.',
      errorToAvoid: 'Never place chemicals directly on the metal pan; always tare a weighing boat or glass vial first.',
    },
    {
      id: 'level-bubble',
      title: '3. Spirit Level Bubble & Leveling Feet',
      role: 'Ensures the gravitational vector is strictly parallel to the load cell axis.',
      errorToAvoid: 'Weighing a warm crucible or beaker creates upward convective buoyant currents, making the mass read artificially low.',
    },
  ],
};

const QUIZ_QUESTIONS = [
  {
    q: 'When setting up a Liebig condenser for distillation, where should the cold tap water tubing be connected?',
    options: [
      'Into the lower port and out of the upper port (counter-current)',
      'Into the upper port and out of the lower port (co-current)',
      'Into both ports simultaneously with a Y-splitter',
    ],
    answer: 0,
    explanation: 'Connecting cooling water to the lower port forces water upward against gravity, ensuring the entire outer glass jacket remains 100% filled with cold water.',
  },
  {
    q: 'In UV-Vis spectrophotometry (A = ε·l·c), why must you wipe the clear sides of a cuvette and avoid readings above A = 2.0?',
    options: [
      'Above A = 2.0, more than 99% of light is absorbed (T < 1%), causing stray light detector error',
      'Above A = 2.0, the quartz cuvette melts from UV photon heating',
      'Fingerprints increase the pathlength l by 50%',
    ],
    answer: 0,
    explanation: 'Since A = −log₁₀(T), an absorbance of 2.0 means only 1% of incident light reaches the detector (and 0.1% at A = 3.0), where stray light causes severe deviation from Beer-Lambert linearity.',
  },
  {
    q: 'Why does a hot crucible weigh less on an analytical balance than after it cools to room temperature in a desiccator?',
    options: [
      'Upward thermal air convection currents buoy the pan upward',
      'Gravity decreases at higher temperatures',
      'Protons evaporate from the porcelain above 100 °C',
    ],
    answer: 0,
    explanation: 'A warm object heats the air inside the draft shield, creating an upward convective draft that lifts the balance pan and produces an artificially low mass reading.',
  },
];

export const LabEquipmentTutorials: React.FC = () => {
  const [activeApparatus, setActiveApparatus] = useState<ApparatusId>('uv-vis');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>('cuvette');

  // 1. UV-Vis Beer-Lambert Simulator State
  const [wavelengthNm, setWavelengthNm] = useState<number>(525); // KMnO4 λmax ~525 nm
  const [concentrationMm, setConcentrationMm] = useState<number>(0.35);
  const [pathlengthCm, setPathlengthCm] = useState<number>(1.0);

  // 2. Bunsen Burner Air Collar State (0 = closed yellow safety flame, 100 = roaring blue oxidizing flame)
  const [airCollarPct, setAirCollarPct] = useState<number>(85);
  const [gasFlowPct, setGasFlowPct] = useState<number>(75);

  // 3. Fractional Distillation State
  const [potTempC, setPotTempC] = useState<number>(82);
  const [condenserWaterOn, setCondenserWaterOn] = useState<boolean>(true);

  // 4. Analytical Balance State
  const [doorsClosed, setDoorsClosed] = useState<boolean>(true);
  const [tareOffsetG, setTareOffsetG] = useState<number>(0);
  const [boatOnPan, setBoatOnPan] = useState<boolean>(true);
  const [sampleMassAddedG, setSampleMassAddedG] = useState<number>(1.4826);

  // SOP Checklist State
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({
    'step-1': true,
  });

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Beer-Lambert calculations for KMnO4 (peak at 525 nm, ε_max = 2400 M⁻¹cm⁻¹)
  const epsilonAtLambda = Math.round(
    2400 * Math.exp(-Math.pow((wavelengthNm - 525) / 48, 2)) + 120
  );
  const absorbance = epsilonAtLambda * pathlengthCm * (concentrationMm / 1000);
  const transmittancePct = Math.pow(10, -absorbance) * 100;

  const hotspots = APPARATUS_HOTSPOTS[activeApparatus];
  const currentHotspot = hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];

  return (
    <div className="space-y-6">
      {/* Apparatus Selector Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Interactive Laboratory Equipment & Calibration Sandbox
            </h2>
            <p className="text-xs text-slate-500">
              Operate virtual laboratory instruments, inspect anatomical hotspots, and verify standard operating procedures (SOPs).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(
              [
                ['uv-vis', 'UV-Vis Spectrophotometer', Sun],
                ['bunsen', 'Bunsen Burner Flame Zones', Flame],
                ['distillation', 'Fractional Distillation Rig', FlaskConical],
                ['balance', 'Analytical Balance (0.1 mg)', Scale],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveApparatus(id);
                  setSelectedHotspotId(APPARATUS_HOTSPOTS[id][0].id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeApparatus === id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-blue-600" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Zone Sandbox: Interactive Apparatus Stage (Left 7 cols) + Controls & Hotspot Inspector (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: Interactive Instrument Stage */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          {activeApparatus === 'uv-vis' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500">
                    Beer-Lambert Law Optical Bench · KMnO₄ Analyte (λmax = 525 nm)
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    A = ε(λ) · l · c = −log₁₀(I / I₀)
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Absorbance / %T</div>
                  <div className="text-xl font-bold text-blue-600 tabular-nums">
                    A = {absorbance.toFixed(3)} <span className="text-xs text-slate-500">({transmittancePct.toFixed(1)}% T)</span>
                  </div>
                </div>
              </div>

              {/* Optical Path SVG Diagram */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
                <svg viewBox="0 0 540 210" className="w-full h-52">
                  {/* 1. Light Source */}
                  <g
                    onClick={() => setSelectedHotspotId('source')}
                    className="cursor-pointer"
                  >
                    <rect x="20" y="68" width="64" height="74" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="52" cy="105" r="16" fill="#fbbf24" />
                    <text x="52" y="160" textAnchor="middle" className="text-[10px] font-mono fill-slate-300">
                      1. Lamp Source
                    </text>
                  </g>

                  {/* Polychromatic beam */}
                  <polygon points="84,98 158,82 158,128 84,112" fill="rgba(251, 191, 36, 0.28)" />

                  {/* 2. Monochromator Grating */}
                  <g
                    onClick={() => setSelectedHotspotId('monochromator')}
                    className="cursor-pointer"
                  >
                    <polygon points="158,62 206,78 206,132 158,148" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x="182" y="166" textAnchor="middle" className="text-[10px] font-mono fill-slate-300">
                      2. Monochromator ({wavelengthNm} nm)
                    </text>
                  </g>

                  {/* Incident Monochromatic Beam I₀ */}
                  <rect
                    x="206"
                    y="96"
                    width="96"
                    height="18"
                    fill={
                      wavelengthNm < 490
                        ? 'rgba(56, 189, 248, 0.75)'
                        : wavelengthNm < 565
                        ? 'rgba(16, 185, 129, 0.75)'
                        : wavelengthNm < 600
                        ? 'rgba(250, 204, 21, 0.75)'
                        : 'rgba(244, 63, 94, 0.75)'
                    }
                  />
                  <text x="254" y="88" textAnchor="middle" className="text-[10px] font-mono fill-sky-300">
                    I₀ (100%)
                  </text>

                  {/* 3. Sample Cuvette */}
                  <g
                    onClick={() => setSelectedHotspotId('cuvette')}
                    className="cursor-pointer"
                  >
                    <rect
                      x="302"
                      y="52"
                      width={28 + pathlengthCm * 16}
                      height="96"
                      rx="3"
                      fill={`rgba(192, 38, 211, ${Math.min(0.88, concentrationMm * 1.1)})`}
                      stroke="#e2e8f0"
                      strokeWidth="2"
                    />
                    <text
                      x={302 + (28 + pathlengthCm * 16) / 2}
                      y="168"
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-300"
                    >
                      3. Cuvette (l={pathlengthCm.toFixed(1)} cm)
                    </text>
                  </g>

                  {/* Transmitted Beam I */}
                  {(() => {
                    const startX = 302 + 28 + pathlengthCm * 16;
                    const opacity = Math.max(0.08, (transmittancePct / 100) * 0.8);
                    return (
                      <>
                        <rect
                          x={startX}
                          y="98"
                          width={435 - startX}
                          height="14"
                          fill={`rgba(16, 185, 129, ${opacity})`}
                        />
                        <text
                          x={(startX + 435) / 2}
                          y="88"
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-emerald-300"
                        >
                          I ({transmittancePct.toFixed(1)}%)
                        </text>
                      </>
                    );
                  })()}

                  {/* 4. Photodiode Detector */}
                  <g
                    onClick={() => setSelectedHotspotId('detector')}
                    className="cursor-pointer"
                  >
                    <rect x="435" y="64" width="80" height="82" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                    <text x="475" y="96" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">
                      ABSORBANCE
                    </text>
                    <text x="475" y="118" textAnchor="middle" className="text-sm font-mono font-bold fill-emerald-400">
                      {absorbance.toFixed(3)}
                    </text>
                    <text x="475" y="166" textAnchor="middle" className="text-[10px] font-mono fill-slate-300">
                      4. Photodiode
                    </text>
                  </g>
                </svg>
              </div>

              {/* Parameter Controls for UV-Vis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-600">Wavelength (λ)</span>
                    <span className="font-bold text-slate-900 tabular-nums">{wavelengthNm} nm</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="680"
                    step="5"
                    value={wavelengthNm}
                    onChange={(e) => setWavelengthNm(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    ε(λ) = {epsilonAtLambda} M⁻¹cm⁻¹
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-600">Concentration (c)</span>
                    <span className="font-bold text-fuchsia-700 tabular-nums">{concentrationMm.toFixed(2)} mM</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.00"
                    step="0.05"
                    value={concentrationMm}
                    onChange={(e) => setConcentrationMm(parseFloat(e.target.value))}
                    className="w-full accent-fuchsia-600"
                  />
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Linear range: 0.05 – 0.80 mM
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-600">Pathlength (l)</span>
                    <span className="font-bold text-slate-900 tabular-nums">{pathlengthCm.toFixed(1)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.5"
                    value={pathlengthCm}
                    onChange={(e) => setPathlengthCm(parseFloat(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Standard cuvette = 1.0 cm
                  </div>
                </div>
              </div>
            </>
          )}

          {activeApparatus === 'bunsen' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500">
                    Premixed Methane-Air Combustion · Venturi Entrainment
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Bunsen Burner Air Collar & Thermal Zones
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Inner Cone Tip Temp</div>
                  <div className="text-xl font-bold text-amber-600 tabular-nums">
                    {Math.round(550 + (airCollarPct / 100) * 980)} °C
                  </div>
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 flex items-center justify-center">
                <svg viewBox="0 0 380 240" className="w-full h-56">
                  {/* Outer Flame Envelope */}
                  {(() => {
                    const hScale = 0.65 + (gasFlowPct / 100) * 0.45;
                    const isBlue = airCollarPct > 40;
                    return (
                      <g transform={`translate(190, 145) scale(1, ${hScale})`}>
                        {/* Outer oxidizing / luminous cone */}
                        <path
                          d="M 0 -125 C 36 -75, 42 -25, 16 0 L -16 0 C -42 -25, -36 -75, 0 -125 Z"
                          fill={
                            isBlue
                              ? `rgba(56, 189, 248, ${0.35 + (airCollarPct / 100) * 0.35})`
                              : 'rgba(250, 204, 21, 0.85)'
                          }
                        />
                        {/* Inner bright blue reaction cone when air collar open */}
                        {airCollarPct > 20 && (
                          <path
                            d={`M 0 ${-45 - (airCollarPct / 100) * 35} C 16 -25, 18 -8, 12 0 L -12 0 C -18 -8, -16 -25, 0 ${-45 - (airCollarPct / 100) * 35} Z`}
                            fill="rgba(59, 130, 246, 0.9)"
                            onClick={() => setSelectedHotspotId('inner-cone')}
                            className="cursor-pointer"
                          />
                        )}
                      </g>
                    );
                  })()}

                  {/* Burner Barrel */}
                  <rect x="174" y="145" width="32" height="65" fill="#64748b" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Air Collar with variable window */}
                  <g
                    onClick={() => setSelectedHotspotId('collar')}
                    className="cursor-pointer"
                  >
                    <rect x="168" y="192" width="44" height="18" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                    <rect
                      x="182"
                      y="195"
                      width={Math.max(2, (airCollarPct / 100) * 16)}
                      height="12"
                      fill="#0f172a"
                    />
                  </g>
                  {/* Base & Needle Valve */}
                  <rect
                    x="140"
                    y="218"
                    width="100"
                    height="14"
                    rx="4"
                    fill="#334155"
                    onClick={() => setSelectedHotspotId('needle-valve')}
                    className="cursor-pointer"
                  />

                  {/* Labels */}
                  <text x="235" y="75" className="text-[10px] font-mono fill-sky-300">
                    ← Inner Cone Tip ({Math.round(550 + (airCollarPct / 100) * 980)} °C)
                  </text>
                  <text x="235" y="204" className="text-[10px] font-mono fill-slate-300">
                    ← Air Intake Collar ({airCollarPct}% Open)
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700">Air Intake Collar (O₂ Mix)</span>
                    <span className="font-bold text-blue-600 tabular-nums">{airCollarPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={airCollarPct}
                    onChange={(e) => setAirCollarPct(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {airCollarPct < 30
                      ? 'Luminous yellow safety flame (incomplete combustion)'
                      : 'Non-luminous roaring blue flame (complete combustion)'}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700">Methane Needle Valve</span>
                    <span className="font-bold text-slate-900 tabular-nums">{gasFlowPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={gasFlowPct}
                    onChange={(e) => setGasFlowPct(Number(e.target.value))}
                    className="w-full accent-slate-800"
                  />
                </div>
              </div>
            </>
          )}

          {activeApparatus === 'distillation' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500">
                    Ethanol (bp 78.37 °C) / Water (bp 100.0 °C) Separation
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Fractional Distillation Apparatus & Condenser Flow
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Still-Head Vapor Temp</div>
                  <div className="text-xl font-bold text-blue-600 tabular-nums">
                    {potTempC < 78 ? `${potTempC}.0 °C (Sub-Boiling)` : potTempC < 96 ? '78.4 °C (Ethanol Fraction)' : '100.0 °C (Water Fraction)'}
                  </div>
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 flex items-center justify-center">
                <svg viewBox="0 0 480 230" className="w-full h-56">
                  {/* Round Bottom Boiling Pot */}
                  <circle
                    cx="110"
                    cy="172"
                    r="36"
                    fill="rgba(56, 189, 248, 0.25)"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    onClick={() => setSelectedHotspotId('boiling-chips')}
                    className="cursor-pointer"
                  />
                  {/* Vigreux Column */}
                  <rect
                    x="100"
                    y="62"
                    width="20"
                    height="76"
                    fill="rgba(148, 163, 184, 0.18)"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    onClick={() => setSelectedHotspotId('vigreux')}
                    className="cursor-pointer"
                  />
                  {/* Thermometer at Still-Head */}
                  <rect
                    x="107"
                    y="22"
                    width="6"
                    height="52"
                    fill="#f43f5e"
                    onClick={() => setSelectedHotspotId('thermometer')}
                    className="cursor-pointer"
                  />
                  {/* Sloped Liebig Condenser */}
                  <g
                    transform="translate(120, 68) rotate(24)"
                    onClick={() => setSelectedHotspotId('condenser')}
                    className="cursor-pointer"
                  >
                    <rect
                      x="0"
                      y="-12"
                      width="195"
                      height="24"
                      rx="4"
                      fill={condenserWaterOn ? 'rgba(14, 165, 233, 0.35)' : 'rgba(239, 68, 68, 0.25)'}
                      stroke="#cbd5e1"
                      strokeWidth="1.8"
                    />
                    <line x1="0" y1="0" x2="195" y2="0" stroke="#38bdf8" strokeWidth="4" />
                  </g>
                  {/* Receiving Flask */}
                  <circle
                    cx="318"
                    cy="176"
                    r="28"
                    fill={potTempC >= 78 ? 'rgba(16, 185, 129, 0.35)' : 'none'}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  />
                  <text x="110" y="222" textAnchor="middle" className="text-[10px] font-mono fill-slate-300">
                    Pot ({potTempC} °C)
                  </text>
                  <text x="235" y="62" className="text-[10px] font-mono fill-sky-300">
                    Liebig Condenser (Water {condenserWaterOn ? 'ON ↑' : 'OFF — HAZARD!'})
                  </text>
                  <text x="318" y="222" textAnchor="middle" className="text-[10px] font-mono fill-emerald-300">
                    Distillate Receiver
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-700">Heating Mantle Temp</span>
                    <span className="font-bold text-amber-600 tabular-nums">{potTempC} °C</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="105"
                    step="1"
                    value={potTempC}
                    onChange={(e) => setPotTempC(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Condenser Cooling Water</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Counter-current (Bottom In → Top Out)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCondenserWaterOn((w) => !w)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                      condenserWaterOn ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {condenserWaterOn ? 'Flow Active' : 'Water Off'}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeApparatus === 'balance' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500">
                    Quantitative Gravimetric Analysis · ±0.0001 g Readability
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Analytical Balance Operation & Tare Simulator
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Draft Shield Status</div>
                  <div className={`text-xs font-bold ${doorsClosed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {doorsClosed ? '● Sealed (Stable Reading)' : '▲ Doors Open (±0.0018 g Drift)'}
                  </div>
                </div>
              </div>

              {(() => {
                const boatMass = boatOnPan ? 0.8542 : 0;
                const drift = doorsClosed ? 0 : 0.0014;
                const rawMass = boatMass + sampleMassAddedG + drift;
                const displayedMass = rawMass - tareOffsetG;

                return (
                  <>
                    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                      {/* Digital LCD Readout */}
                      <div className="w-full max-w-md bg-slate-950 border-2 border-slate-700 rounded-xl px-6 py-4 flex items-baseline justify-between font-mono">
                        <span className="text-xs text-emerald-400">
                          {doorsClosed ? 'STABLE [o]' : 'UNSTABLE [~]'}
                        </span>
                        <span className="text-4xl font-bold text-emerald-400 tabular-nums">
                          {displayedMass.toFixed(4)} <span className="text-lg">g</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setTareOffsetG(boatMass + sampleMassAddedG)}
                          className="px-4 py-2 text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                          →0/T← TARE / ZERO
                        </button>
                        <button
                          type="button"
                          onClick={() => setDoorsClosed((d) => !d)}
                          className="px-4 py-2 text-xs font-mono font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg"
                        >
                          {doorsClosed ? 'Open Draft Doors' : 'Close Draft Doors'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBoatOnPan(true);
                            setTareOffsetG(0.8542);
                          }}
                          className="px-4 py-2 text-xs font-mono font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg"
                        >
                          Place Boat & Tare (0.8542 g)
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-slate-700">Reagent Mass Transferred by Spatula:</span>
                        <span className="font-bold text-blue-600 tabular-nums">{sampleMassAddedG.toFixed(4)} g</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5.0"
                        step="0.0125"
                        value={sampleMassAddedG}
                        onChange={(e) => setSampleMassAddedG(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>

        {/* Right 5 Columns: Anatomical Hotspot Inspector & SOP Checklist */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-slate-500">
                Component Anatomy & Error Prevention
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Click any component below to inspect its function:
              </h3>
            </div>

            {/* Hotspot Selector Buttons */}
            <div className="space-y-1.5">
              {hotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setSelectedHotspotId(h.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors ${
                    currentHotspot.id === h.id
                      ? 'bg-blue-50 border-blue-600 text-blue-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {h.title}
                </button>
              ))}
            </div>

            {/* Selected Hotspot Detail Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="font-bold text-slate-900 text-sm">{currentHotspot.title}</div>
              <p className="text-slate-700 leading-relaxed">{currentHotspot.role}</p>
              <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2 text-rose-700">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Critical Student Error to Avoid: </span>
                  {currentHotspot.errorToAvoid}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Pre-Lab SOP Verification Checklist */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-xs font-semibold text-slate-900">
              Standard Operating Procedure (SOP) Pre-Flight Checklist:
            </div>
            {[
              { id: 'step-1', text: 'Splash goggles, lab coat, and nitrile gloves donned' },
              { id: 'step-2', text: 'Zero/blank calibration verified prior to sample loading' },
              { id: 'step-3', text: 'All glass joints and thermal limits inspected for cracks' },
            ].map((st) => {
              const checked = !!checkedSteps[st.id];
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() =>
                    setCheckedSteps((prev) => ({ ...prev, [st.id]: !prev[st.id] }))
                  }
                  className="w-full flex items-center gap-2.5 text-left text-xs text-slate-700 hover:text-slate-900 py-1"
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={checked ? 'line-through text-slate-400' : ''}>{st.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Interactive Lab Technique Mastery Check */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Interactive Laboratory Technique & Safety Diagnostic
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {QUIZ_QUESTIONS.map((item, qIdx) => {
            const chosen = quizAnswers[qIdx];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === item.answer;

            return (
              <div
                key={qIdx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    Q{qIdx + 1}. {item.q}
                  </div>
                  <div className="space-y-1.5">
                    {item.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() =>
                          setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                          chosen === oIdx
                            ? oIdx === item.answer
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold'
                              : 'bg-rose-50 border-rose-600 text-rose-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {isAnswered && (
                  <div
                    className={`text-[11px] pt-2 border-t ${
                      isCorrect
                        ? 'border-emerald-200 text-emerald-800'
                        : 'border-rose-200 text-rose-800'
                    }`}
                  >
                    <strong>{isCorrect ? '✓ Correct: ' : '✕ Review: '}</strong>
                    {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
