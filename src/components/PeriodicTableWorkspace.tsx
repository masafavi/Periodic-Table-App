import React, { useMemo, useState } from 'react';
import {
  Search,
  Thermometer,
  Atom,
  BookOpen,
  Layers,
  ArrowLeftRight,
  RotateCcw,
} from 'lucide-react';
import {
  CATEGORY_META,
  ChemicalElement,
  ElementCategory,
  ELEMENTS,
  getPhaseAtTemperature,
} from '../data/elements';
import { SceneMode3D, ThreePeriodicAndAtom } from './ThreePeriodicAndAtom';

type HeatmapMode =
  | 'category'
  | 'phase'
  | 'electronegativity'
  | 'atomicRadius'
  | 'ionizationEnergy'
  | 'meltingPoint';

export const PeriodicTableWorkspace: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(
    ELEMENTS[25] // Iron (Fe, #26) or Carbon (#6) - let's default to Carbon (#6) or Iron (#26)
  );
  const [compareElement, setCompareElement] = useState<ChemicalElement | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ElementCategory | 'all'>('all');
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('category');
  const [temperatureK, setTemperatureK] = useState<number>(298);
  const [sceneMode3D, setSceneMode3D] = useState<SceneMode3D>('atom-bohr');

  const filteredNumbers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return new Set(
      ELEMENTS.filter((el) => {
        const matchesCategory = activeCategory === 'all' || el.category === activeCategory;
        const matchesQuery =
          !q ||
          el.name.toLowerCase().includes(q) ||
          el.symbol.toLowerCase().includes(q) ||
          String(el.number) === q;
        return matchesCategory && matchesQuery;
      }).map((e) => e.number)
    );
  }, [searchQuery, activeCategory]);

  const handleElementClick = (el: ChemicalElement) => {
    if (isComparing && compareElement === null && el.number !== selectedElement.number) {
      setCompareElement(el);
    } else if (isComparing && compareElement !== null) {
      setCompareElement(el);
    } else {
      setSelectedElement(el);
    }
  };

  const getHeatmapStyle = (el: ChemicalElement): { bgClass: string; borderClass: string; textClass: string; inlineBg?: string } => {
    if (heatmapMode === 'category') {
      const meta = CATEGORY_META[el.category];
      return { bgClass: meta.bg, borderClass: meta.border, textClass: meta.text };
    }

    if (heatmapMode === 'phase') {
      const phase = getPhaseAtTemperature(el, temperatureK);
      if (phase === 'Solid') {
        return { bgClass: 'bg-slate-100', borderClass: 'border-slate-300', textClass: 'text-slate-900' };
      }
      if (phase === 'Liquid') {
        return { bgClass: 'bg-sky-100', borderClass: 'border-sky-400', textClass: 'text-sky-950' };
      }
      if (phase === 'Gas') {
        return { bgClass: 'bg-amber-100', borderClass: 'border-amber-400', textClass: 'text-amber-950' };
      }
      return { bgClass: 'bg-slate-50', borderClass: 'border-slate-200', textClass: 'text-slate-400' };
    }

    let ratio: number | null = null;
    if (heatmapMode === 'electronegativity' && el.electronegativity !== null) {
      ratio = (el.electronegativity - 0.7) / (3.98 - 0.7);
    } else if (heatmapMode === 'atomicRadius' && el.atomicRadius !== null) {
      ratio = (el.atomicRadius - 31) / (348 - 31);
    } else if (heatmapMode === 'ionizationEnergy' && el.ionizationEnergy !== null) {
      ratio = (el.ionizationEnergy - 376) / (2372 - 376);
    } else if (heatmapMode === 'meltingPoint' && el.meltingPoint !== null) {
      ratio = el.meltingPoint / 3800;
    }

    if (ratio === null) {
      return { bgClass: 'bg-slate-50', borderClass: 'border-slate-200', textClass: 'text-slate-400' };
    }

    const clamped = Math.max(0, Math.min(1, ratio));
    if (clamped > 0.75) {
      return { bgClass: 'bg-blue-600', borderClass: 'border-blue-700', textClass: 'text-white' };
    }
    if (clamped > 0.5) {
      return { bgClass: 'bg-blue-400', borderClass: 'border-blue-500', textClass: 'text-slate-950' };
    }
    if (clamped > 0.25) {
      return { bgClass: 'bg-sky-200', borderClass: 'border-sky-300', textClass: 'text-slate-900' };
    }
    return { bgClass: 'bg-sky-50', borderClass: 'border-sky-200', textClass: 'text-slate-800' };
  };

  const currentPhase = getPhaseAtTemperature(selectedElement, temperatureK);
  const tempCelsius = (temperatureK - 273.15).toFixed(0);

  return (
    <div className="space-y-8">
      {/* Top Controls Bar: Quick Element Search, Heatmap Mode, and Temperature Phase Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search element by name, symbol, or Z (e.g. Au, 79)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Heatmap Mode Selector (Functional Segmented Buttons) */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                ['category', 'Chemical Group'],
                ['phase', 'Phase at Temp'],
                ['electronegativity', 'Electronegativity'],
                ['atomicRadius', 'Atomic Radius'],
                ['ionizationEnergy', 'Ionization Energy'],
                ['meltingPoint', 'Melting Point'],
              ] as [HeatmapMode, string][]
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setHeatmapMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  heatmapMode === mode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Compare Elements Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isComparing) {
                setIsComparing(false);
                setCompareElement(null);
              } else {
                setIsComparing(true);
                setCompareElement(ELEMENTS[78]); // Gold (#79) default comparison
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              isComparing
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{isComparing ? 'Exit Comparison' : 'Compare Two Elements'}</span>
          </button>
        </div>

        {/* Interactive Temperature Phase Scrubber + Category Filter Buttons */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
              <Thermometer className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold">Temperature:</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {temperatureK} K
              </span>
              <span className="text-slate-500 tabular-nums">({tempCelsius} °C)</span>
            </div>

            <input
              type="range"
              min="0"
              max="6000"
              step="10"
              value={temperatureK}
              onChange={(e) => {
                setTemperatureK(Number(e.target.value));
                if (heatmapMode === 'category') setHeatmapMode('phase');
              }}
              className="w-44 accent-blue-600 cursor-pointer"
            />

            <div className="flex items-center gap-1">
              {[
                { label: '0 K', k: 0 },
                { label: 'LN₂ (77 K)', k: 77 },
                { label: 'STP (298 K)', k: 298 },
                { label: 'Lava (1400 K)', k: 1400 },
                { label: 'Sun (5778 K)', k: 5778 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTemperatureK(preset.k)}
                  className={`px-2 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 ${
                    temperatureK === preset.k
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All (118)
            </button>
            {(Object.keys(CATEGORY_META) as ElementCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setActiveCategory((prev) => (prev === cat ? 'all' : cat))
                }
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {CATEGORY_META[cat].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 18-Column Interactive Periodic Table Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto">
        <div className="min-w-[1040px]">
          {/* Group Header Numbers (1 to 18) */}
          <div
            className="grid gap-1 mb-1 text-center font-mono text-[11px] text-slate-400"
            style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
          >
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i + 1} className="py-0.5">
                G{i + 1}
              </div>
            ))}
          </div>

          {/* 10-Row Periodic Grid */}
          <div
            className="grid gap-1 relative"
            style={{
              gridTemplateColumns: 'repeat(18, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(10, minmax(54px, auto))',
            }}
          >
            {/* Central Selected Element Callout Card nested in the open d-block gap (Rows 1-3, Cols 3-12) */}
            <div
              className="hidden lg:flex flex-col justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200"
              style={{ gridColumn: '3 / 13', gridRow: '1 / 4' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-slate-500">
                    Atomic Number #{selectedElement.number} · {CATEGORY_META[selectedElement.category].label} · {selectedElement.block}-block
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {selectedElement.name}{' '}
                    <span className="font-mono text-blue-600">({selectedElement.symbol})</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 max-w-xl">
                    {selectedElement.history}
                  </p>
                </div>
                <div className="text-right font-mono shrink-0">
                  <div className="text-xs text-slate-400">Standard Atomic Weight</div>
                  <div className="text-xl font-bold text-slate-900 tabular-nums">
                    {selectedElement.atomicMass} <span className="text-xs font-normal text-slate-500">u</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {selectedElement.electronConfig}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3 pt-2 border-t border-slate-200/80 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block">Electronegativity</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {selectedElement.electronegativity ?? 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Atomic Radius</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {selectedElement.atomicRadius ? `${selectedElement.atomicRadius} pm` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">1st Ionization</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {selectedElement.ionizationEnergy ? `${selectedElement.ionizationEnergy} kJ/mol` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Melt / Boil (K)</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {selectedElement.meltingPoint ?? '—'} / {selectedElement.boilingPoint ?? '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phase @ {temperatureK} K</span>
                  <span className="font-semibold text-blue-700 tabular-nums">
                    {currentPhase}
                  </span>
                </div>
              </div>
            </div>

            {/* Lanthanide / Actinide Row Labels in Col 1-2 of Rows 9 & 10 */}
            <div
              className="flex items-center justify-end pr-2 text-xs font-mono font-medium text-violet-700"
              style={{ gridColumn: '1 / 3', gridRow: 9 }}
            >
              57–71 Lanthanides →
            </div>
            <div
              className="flex items-center justify-end pr-2 text-xs font-mono font-medium text-fuchsia-700"
              style={{ gridColumn: '1 / 3', gridRow: 10 }}
            >
              89–103 Actinides →
            </div>

            {/* All 118 Element Cells */}
            {ELEMENTS.map((el) => {
              const isMatch = filteredNumbers.has(el.number);
              const isSelected = selectedElement.number === el.number;
              const isCompared = compareElement?.number === el.number;
              const style = getHeatmapStyle(el);
              const phase = getPhaseAtTemperature(el, temperatureK);

              return (
                <button
                  key={el.number}
                  type="button"
                  onClick={() => handleElementClick(el)}
                  style={{
                    gridColumn: el.gridCol,
                    gridRow: el.gridRow,
                  }}
                  className={`group relative flex flex-col justify-between p-1.5 rounded-md border text-left transition-transform duration-150 select-none ${
                    style.bgClass
                  } ${style.borderClass} ${style.textClass} ${
                    !isMatch ? 'opacity-20 scale-95' : 'hover:-translate-y-0.5 hover:shadow-sm'
                  } ${
                    isSelected
                      ? 'ring-2 ring-blue-600 ring-offset-1 z-10'
                      : isCompared
                      ? 'ring-2 ring-amber-500 ring-offset-1 z-10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full leading-none">
                    <span className="text-[10px] font-mono font-semibold opacity-80 tabular-nums">
                      {el.number}
                    </span>
                    <span className="text-[9px] font-mono opacity-65 tabular-nums">
                      {phase === 'Solid' ? 'S' : phase === 'Liquid' ? 'L' : phase === 'Gas' ? 'G' : '—'}
                    </span>
                  </div>

                  <div className="text-base font-bold tracking-tight leading-tight my-0.5">
                    {el.symbol}
                  </div>

                  <div className="text-[9px] font-medium truncate w-full opacity-85 leading-none">
                    {el.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optional Side-by-Side Element Comparison Drawer */}
      {isComparing && compareElement && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Atomic & Thermodynamic Comparison
              </h3>
              <p className="text-xs text-slate-500">
                Click any element in the periodic table above to update the second comparison slot.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsComparing(false);
                setCompareElement(null);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
            >
              Close Comparison
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-mono text-slate-500">
                  <th className="py-2.5 pr-4">Property</th>
                  <th className="py-2.5 px-4 text-blue-700 font-bold">
                    #{selectedElement.number} {selectedElement.name} ({selectedElement.symbol})
                  </th>
                  <th className="py-2.5 px-4 text-amber-700 font-bold">
                    #{compareElement.number} {compareElement.name} ({compareElement.symbol})
                  </th>
                  <th className="py-2.5 pl-4">Delta / Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs tabular-nums">
                <tr>
                  <td className="py-2.5 pr-4 font-sans font-medium text-slate-700">Atomic Mass</td>
                  <td className="py-2.5 px-4">{selectedElement.atomicMass} u</td>
                  <td className="py-2.5 px-4">{compareElement.atomicMass} u</td>
                  <td className="py-2.5 pl-4 text-slate-500">
                    Δ {(selectedElement.atomicMass - compareElement.atomicMass).toFixed(3)} u
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-sans font-medium text-slate-700">Electron Configuration</td>
                  <td className="py-2.5 px-4">{selectedElement.electronConfig}</td>
                  <td className="py-2.5 px-4">{compareElement.electronConfig}</td>
                  <td className="py-2.5 pl-4 text-slate-500">
                    {selectedElement.block}-block vs {compareElement.block}-block
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-sans font-medium text-slate-700">Electronegativity (Pauling)</td>
                  <td className="py-2.5 px-4">{selectedElement.electronegativity ?? 'N/A'}</td>
                  <td className="py-2.5 px-4">{compareElement.electronegativity ?? 'N/A'}</td>
                  <td className="py-2.5 pl-4 text-slate-500">
                    {selectedElement.electronegativity && compareElement.electronegativity
                      ? `ΔEN = ${Math.abs(selectedElement.electronegativity - compareElement.electronegativity).toFixed(2)} (${
                          Math.abs(selectedElement.electronegativity - compareElement.electronegativity) > 1.7
                            ? 'Predominantly Ionic'
                            : Math.abs(selectedElement.electronegativity - compareElement.electronegativity) > 0.4
                            ? 'Polar Covalent'
                            : 'Nonpolar Covalent / Metallic'
                        })`
                      : '—'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-sans font-medium text-slate-700">Atomic Radius</td>
                  <td className="py-2.5 px-4">{selectedElement.atomicRadius ? `${selectedElement.atomicRadius} pm` : 'N/A'}</td>
                  <td className="py-2.5 px-4">{compareElement.atomicRadius ? `${compareElement.atomicRadius} pm` : 'N/A'}</td>
                  <td className="py-2.5 pl-4 text-slate-500">
                    {selectedElement.atomicRadius && compareElement.atomicRadius
                      ? `${(selectedElement.atomicRadius - compareElement.atomicRadius)} pm`
                      : '—'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-sans font-medium text-slate-700">1st Ionization Energy</td>
                  <td className="py-2.5 px-4">{selectedElement.ionizationEnergy ? `${selectedElement.ionizationEnergy} kJ/mol` : 'N/A'}</td>
                  <td className="py-2.5 px-4">{compareElement.ionizationEnergy ? `${compareElement.ionizationEnergy} kJ/mol` : 'N/A'}</td>
                  <td className="py-2.5 pl-4 text-slate-500">
                    {selectedElement.ionizationEnergy && compareElement.ionizationEnergy
                      ? `Δ ${(selectedElement.ionizationEnergy - compareElement.ionizationEnergy)} kJ/mol`
                      : '—'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-sans font-medium text-slate-700">Melting / Boiling Point</td>
                  <td className="py-2.5 px-4">{selectedElement.meltingPoint ?? '—'} K / {selectedElement.boilingPoint ?? '—'} K</td>
                  <td className="py-2.5 px-4">{compareElement.meltingPoint ?? '—'} K / {compareElement.boilingPoint ?? '—'} K</td>
                  <td className="py-2.5 pl-4 text-slate-500">
                    Density: {selectedElement.density ?? '—'} vs {compareElement.density ?? '—'} g/cm³
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lower Split: 3D WebGL Spatial Visualizer (60% width) + Synchronized Atomic & Historical Inspector (40% width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 7 Columns: 3D Bohr / Orbital & 3D Periodic Table Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <ThreePeriodicAndAtom
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            sceneMode={sceneMode3D}
            onChangeSceneMode={setSceneMode3D}
          />
        </div>

        {/* Right 5 Columns: Comprehensive Atomic, Quantum & Historical Dossier */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Element Header & Unboxed Metadata */}
            <div className="border-b border-slate-100 pb-4">
              <div className="text-xs font-mono text-slate-500">
                Atomic Number {selectedElement.number} · Group {selectedElement.group || 'f-block'} · Period {selectedElement.period} · {CATEGORY_META[selectedElement.category].label}
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <h3 className="text-3xl font-bold text-slate-900">
                  {selectedElement.name}{' '}
                  <span className="font-mono text-blue-600">({selectedElement.symbol})</span>
                </h3>
                <span className="font-mono text-lg font-semibold text-slate-700 tabular-nums">
                  {selectedElement.atomicMass} u
                </span>
              </div>
              <div className="mt-2 text-xs font-mono text-slate-600">
                Oxidation States: <span className="text-slate-900 font-semibold">{selectedElement.oxidationStates}</span> · Standard Phase: <span className="text-slate-900 font-semibold">{selectedElement.standardState}</span>
              </div>
            </div>

            {/* Subatomic Particle & Shell Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-2.5">
                <Atom className="w-4 h-4 text-blue-600" />
                <span>Subatomic Composition & Bohr Electron Shells</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 rounded-lg p-3 font-mono text-center">
                <div>
                  <div className="text-xs text-slate-500">Protons (Z)</div>
                  <div className="text-lg font-bold text-rose-600 tabular-nums">
                    {selectedElement.number}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Neutrons (N≈)</div>
                  <div className="text-lg font-bold text-slate-700 tabular-nums">
                    {Math.max(0, Math.round(selectedElement.atomicMass) - selectedElement.number)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Electrons (e⁻)</div>
                  <div className="text-lg font-bold text-sky-600 tabular-nums">
                    {selectedElement.number}
                  </div>
                </div>
              </div>

              {/* Shell Distribution Bar */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto py-1">
                {selectedElement.shells.map((count, idx) => {
                  const shellNames = ['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)', 'O (n=5)', 'P (n=6)', 'Q (n=7)'];
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[60px] bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-center font-mono"
                    >
                      <div className="text-[10px] text-slate-400">{shellNames[idx]}</div>
                      <div className="text-xs font-bold text-slate-900 tabular-nums">{count} e⁻</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Physical & Thermodynamic Metrics */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-2.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Physical & Thermodynamic Constants</span>
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs border-t border-slate-100 pt-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Density (STP)</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {selectedElement.density !== null ? `${selectedElement.density} g/cm³` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Electronegativity</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {selectedElement.electronegativity !== null ? `${selectedElement.electronegativity} Pauling` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Melting Point</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {selectedElement.meltingPoint !== null ? `${selectedElement.meltingPoint} K` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Boiling Point</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {selectedElement.boilingPoint !== null ? `${selectedElement.boilingPoint} K` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Atomic Radius</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {selectedElement.atomicRadius !== null ? `${selectedElement.atomicRadius} pm` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">1st Ionization E.</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {selectedElement.ionizationEnergy !== null ? `${selectedElement.ionizationEnergy} kJ/mol` : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Discovery & Historical Context */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Historical Discovery & Scientific Applications</span>
              </h4>
              <div className="text-xs text-slate-500 font-mono mb-1.5">
                Discovered by {selectedElement.discoveredBy} · Year: {selectedElement.discoveryYear}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedElement.history}
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs font-semibold text-slate-800">Key Applications:</div>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {selectedElement.applications.map((app, i) => (
                    <li key={i}>{app}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Neighbor Quick-Step Navigation */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={selectedElement.number <= 1}
              onClick={() => {
                const prev = ELEMENTS[selectedElement.number - 2];
                if (prev) setSelectedElement(prev);
              }}
              className="px-3 py-1.5 text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-slate-800 transition-colors"
            >
              ← #{selectedElement.number - 1} {ELEMENTS[selectedElement.number - 2]?.symbol || ''}
            </button>
            <span className="text-xs font-mono text-slate-400">
              Element {selectedElement.number} of 118
            </span>
            <button
              type="button"
              disabled={selectedElement.number >= 118}
              onClick={() => {
                const next = ELEMENTS[selectedElement.number];
                if (next) setSelectedElement(next);
              }}
              className="px-3 py-1.5 text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg text-slate-800 transition-colors"
            >
              #{selectedElement.number + 1} {ELEMENTS[selectedElement.number]?.symbol || ''} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
