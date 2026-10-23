import React, { useMemo, useState } from 'react';
import {
  Calculator,
  Scale,
  Wind,
  Beaker,
  Droplet,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ELEMENT_BY_SYMBOL } from '../data/elements';

type CalcTool =
  | 'molar-mass'
  | 'stoichiometry'
  | 'gas-law'
  | 'molarity-dilution'
  | 'ph-buffer'
  | 'thermochemistry';

/**
 * Parses a chemical formula (including parentheses and hydrate dots/asterisks like CuSO4*5H2O or Ca3(PO4)2)
 * into a map of { ElementSymbol: count }
 */
export function parseChemicalFormula(formulaStr: string): Record<string, number> {
  const clean = formulaStr.replace(/\s+/g, '').replace(/·/g, '*');
  if (!clean) return {};

  const parts = clean.split('*');
  const totalCounts: Record<string, number> = {};

  for (const part of parts) {
    if (!part) continue;
    const matchCoeff = part.match(/^(\d+)(.*)$/);
    let multiplier = 1;
    let body = part;
    if (matchCoeff && matchCoeff[2]) {
      multiplier = parseInt(matchCoeff[1], 10);
      body = matchCoeff[2];
    }

    const stack: Record<string, number>[] = [{}];
    let i = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === '(' || ch === '[') {
        stack.push({});
        i++;
      } else if (ch === ')' || ch === ']') {
        i++;
        let numStr = '';
        while (i < body.length && /\d/.test(body[i])) {
          numStr += body[i];
          i++;
        }
        const groupMult = numStr ? parseInt(numStr, 10) : 1;
        const popped = stack.pop() || {};
        const top = stack[stack.length - 1];
        for (const [el, cnt] of Object.entries(popped)) {
          top[el] = (top[el] || 0) + cnt * groupMult;
        }
      } else if (/[A-Z]/.test(ch)) {
        let sym = ch;
        i++;
        while (i < body.length && /[a-z]/.test(body[i])) {
          sym += body[i];
          i++;
        }
        let numStr = '';
        while (i < body.length && /\d/.test(body[i])) {
          numStr += body[i];
          i++;
        }
        const count = numStr ? parseInt(numStr, 10) : 1;
        if (!ELEMENT_BY_SYMBOL[sym]) {
          throw new Error(`Unrecognized element symbol "${sym}"`);
        }
        const top = stack[stack.length - 1];
        top[sym] = (top[sym] || 0) + count;
      } else {
        throw new Error(`Unexpected character "${ch}" in formula`);
      }
    }

    if (stack.length !== 1) {
      throw new Error('Mismatched parentheses in formula');
    }

    for (const [el, cnt] of Object.entries(stack[0])) {
      totalCounts[el] = (totalCounts[el] || 0) + cnt * multiplier;
    }
  }

  return totalCounts;
}

export function computeFormulaMolarMass(formulaStr: string): number {
  const map = parseChemicalFormula(formulaStr);
  let sum = 0;
  for (const [sym, cnt] of Object.entries(map)) {
    const el = ELEMENT_BY_SYMBOL[sym];
    if (el) sum += el.atomicMass * cnt;
  }
  return sum;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y > 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Balances a chemical equation string like "C3H8 + O2 -> CO2 + H2O"
 */
function balanceEquation(eqInput: string): {
  reactants: { formula: string; coeff: number; molarMass: number }[];
  products: { formula: string; coeff: number; molarMass: number }[];
} {
  const normalized = eqInput.replace(/==>|=>|->|=|⇌/g, '->');
  const sides = normalized.split('->');
  if (sides.length !== 2) {
    throw new Error('Use "->" between reactants and products (e.g., Fe + O2 -> Fe2O3).');
  }

  const rFormulas = sides[0]
    .split('+')
    .map((s) => s.trim().replace(/^\d+\s*/, ''))
    .filter(Boolean);
  const pFormulas = sides[1]
    .split('+')
    .map((s) => s.trim().replace(/^\d+\s*/, ''))
    .filter(Boolean);

  if (rFormulas.length === 0 || pFormulas.length === 0) {
    throw new Error('Specify at least one reactant and one product.');
  }

  const allFormulas = [...rFormulas, ...pFormulas];
  const parsedList = allFormulas.map((f) => parseChemicalFormula(f));
  const elementSet = new Set<string>();
  parsedList.forEach((m) => Object.keys(m).forEach((k) => elementSet.add(k)));
  const elements = Array.from(elementSet);

  const nCols = allFormulas.length;
  const nRows = elements.length;

  // Brute-force small integer search for up to 5 species, or Gaussian elimination
  const matrix: number[][] = elements.map((el) =>
    allFormulas.map((_, colIdx) => {
      const cnt = parsedList[colIdx][el] || 0;
      return colIdx < rFormulas.length ? cnt : -cnt;
    })
  );

  // Gaussian elimination over rationals (scaled floats)
  const aug = matrix.map((r) => [...r]);
  let pivotRow = 0;
  const pivotCols: number[] = [];

  for (let col = 0; col < nCols - 1 && pivotRow < nRows; col++) {
    let maxRow = pivotRow;
    for (let r = pivotRow + 1; r < nRows; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) {
        maxRow = r;
      }
    }
    if (Math.abs(aug[maxRow][col]) < 1e-9) continue;
    [aug[pivotRow], aug[maxRow]] = [aug[maxRow], aug[pivotRow]];
    pivotCols.push(col);

    const pv = aug[pivotRow][col];
    for (let c = col; c < nCols; c++) aug[pivotRow][c] /= pv;

    for (let r = 0; r < nRows; r++) {
      if (r !== pivotRow && Math.abs(aug[r][col]) > 1e-9) {
        const factor = aug[r][col];
        for (let c = col; c < nCols; c++) {
          aug[r][c] -= factor * aug[pivotRow][c];
        }
      }
    }
    pivotRow++;
  }

  // Set last variable to free parameter = 1..24 and find smallest all-positive integer solution
  const rawSol = new Array(nCols).fill(1);
  for (let i = pivotCols.length - 1; i >= 0; i--) {
    const pCol = pivotCols[i];
    rawSol[pCol] = -aug[i][nCols - 1];
  }

  let bestCoeffs: number[] | null = null;
  for (let scale = 1; scale <= 60; scale++) {
    const candidate = rawSol.map((v) => Math.round(v * scale));
    if (candidate.some((c) => c <= 0)) continue;
    // Verify exact conservation of atoms
    const valid = elements.every((_, rIdx) => {
      let rowSum = 0;
      for (let cIdx = 0; cIdx < nCols; cIdx++) {
        rowSum += matrix[rIdx][cIdx] * candidate[cIdx];
      }
      return rowSum === 0;
    });
    if (valid) {
      const common = candidate.reduce((acc, v) => gcd(acc, v), candidate[0]);
      bestCoeffs = candidate.map((c) => c / common);
      break;
    }
  }

  if (!bestCoeffs) {
    throw new Error('Could not balance equation; verify all formulas and elements.');
  }

  return {
    reactants: rFormulas.map((f, i) => ({
      formula: f,
      coeff: bestCoeffs![i],
      molarMass: computeFormulaMolarMass(f),
    })),
    products: pFormulas.map((f, i) => ({
      formula: f,
      coeff: bestCoeffs![rFormulas.length + i],
      molarMass: computeFormulaMolarMass(f),
    })),
  };
}

export const HomeworkCalculators: React.FC = () => {
  const [activeTool, setActiveTool] = useState<CalcTool>('molar-mass');

  // 1. Molar Mass State
  const [formulaInput, setFormulaInput] = useState('CuSO4*5H2O');
  const [sampleMassGrams, setSampleMassGrams] = useState<number>(25.0);

  // 2. Equation Balancer & Stoichiometry State
  const [eqString, setEqString] = useState('C3H8 + O2 -> CO2 + H2O');
  const [massReactant1, setMassReactant1] = useState<number>(44.1);
  const [massReactant2, setMassReactant2] = useState<number>(128.0);
  const [actualYieldGrams, setActualYieldGrams] = useState<number>(98.5);

  // 3. Ideal Gas Law State
  const [gasTarget, setGasTarget] = useState<'P' | 'V' | 'n' | 'T'>('P');
  const [gasP, setGasP] = useState<number>(1.0);
  const [gasPUnit, setGasPUnit] = useState<'atm' | 'kPa' | 'mmHg'>('atm');
  const [gasV, setGasV] = useState<number>(22.414);
  const [gasVUnit, setGasVUnit] = useState<'L' | 'mL'>('L');
  const [gasN, setGasN] = useState<number>(1.0);
  const [gasT, setGasT] = useState<number>(273.15);
  const [gasTUnit, setGasTUnit] = useState<'K' | 'C'>('K');

  // 4. Molarity & Dilution State
  const [soluteMassG, setSoluteMassG] = useState<number>(5.844);
  const [soluteMolarMass, setSoluteMolarMass] = useState<number>(58.44);
  const [solutionVolumeMl, setSolutionVolumeMl] = useState<number>(500);
  const [dilM1, setDilM1] = useState<number>(2.0);
  const [dilM2, setDilM2] = useState<number>(0.15);
  const [dilV2Ml, setDilV2Ml] = useState<number>(250);

  // 5. pH & Buffer State
  const [inputPh, setInputPh] = useState<number>(4.76);
  const [bufferPka, setBufferPka] = useState<number>(4.76);
  const [bufferAcidM, setBufferAcidM] = useState<number>(0.10);
  const [bufferBaseM, setBufferBaseM] = useState<number>(0.15);

  // 6. Thermochemistry State
  const [deltaH, setDeltaH] = useState<number>(-92.4); // kJ/mol
  const [deltaS, setDeltaS] = useState<number>(-198.8); // J/(mol·K)
  const [thermoTempK, setThermoTempK] = useState<number>(298.15);

  // Computed Molar Mass Result
  const molarMassResult = useMemo(() => {
    try {
      const counts = parseChemicalFormula(formulaInput);
      const rows = Object.entries(counts).map(([sym, count]) => {
        const el = ELEMENT_BY_SYMBOL[sym]!;
        const subtotal = el.atomicMass * count;
        return { sym, name: el.name, count, atomicMass: el.atomicMass, subtotal };
      });
      const totalMass = rows.reduce((s, r) => s + r.subtotal, 0);
      const moles = totalMass > 0 ? sampleMassGrams / totalMass : 0;
      const molecules = moles * 6.02214076e23;
      return { rows, totalMass, moles, molecules, error: null };
    } catch (e: any) {
      return { rows: [], totalMass: 0, moles: 0, molecules: 0, error: e?.message || 'Invalid formula' };
    }
  }, [formulaInput, sampleMassGrams]);

  // Computed Stoichiometry Result
  const stoichResult = useMemo(() => {
    try {
      const balanced = balanceEquation(eqString);
      const r1 = balanced.reactants[0];
      const r2 = balanced.reactants[1];
      const p1 = balanced.products[0];

      const mol1 = r1 ? massReactant1 / r1.molarMass : 0;
      const mol2 = r2 ? massReactant2 / r2.molarMass : 0;

      let limitingName = r1?.formula || '';
      let reactionExtent = r1 ? mol1 / r1.coeff : 0;
      let excessFormula = r2?.formula || null;
      let excessRemainingGrams = 0;

      if (r1 && r2) {
        const ext1 = mol1 / r1.coeff;
        const ext2 = mol2 / r2.coeff;
        if (ext1 <= ext2) {
          limitingName = r1.formula;
          reactionExtent = ext1;
          excessFormula = r2.formula;
          const mol2Used = ext1 * r2.coeff;
          excessRemainingGrams = Math.max(0, (mol2 - mol2Used) * r2.molarMass);
        } else {
          limitingName = r2.formula;
          reactionExtent = ext2;
          excessFormula = r1.formula;
          const mol1Used = ext2 * r1.coeff;
          excessRemainingGrams = Math.max(0, (mol1 - mol1Used) * r1.molarMass);
        }
      }

      const theoMolesP1 = p1 ? reactionExtent * p1.coeff : 0;
      const theoGramsP1 = p1 ? theoMolesP1 * p1.molarMass : 0;
      const pctYield = theoGramsP1 > 0 ? (actualYieldGrams / theoGramsP1) * 100 : 0;

      return {
        balanced,
        mol1,
        mol2,
        limitingName,
        excessFormula,
        excessRemainingGrams,
        theoMolesP1,
        theoGramsP1,
        pctYield,
        error: null,
      };
    } catch (e: any) {
      return {
        balanced: null,
        mol1: 0,
        mol2: 0,
        limitingName: '',
        excessFormula: null,
        excessRemainingGrams: 0,
        theoMolesP1: 0,
        theoGramsP1: 0,
        pctYield: 0,
        error: e?.message || 'Unable to balance equation',
      };
    }
  }, [eqString, massReactant1, massReactant2, actualYieldGrams]);

  // Ideal Gas Law Calculation
  const gasSolution = useMemo(() => {
    const R = 0.082057; // L·atm/(mol·K)
    const pAtm =
      gasPUnit === 'atm' ? gasP : gasPUnit === 'kPa' ? gasP / 101.325 : gasP / 760;
    const vLiters = gasVUnit === 'L' ? gasV : gasV / 1000;
    const tKelvin = gasTUnit === 'K' ? gasT : gasT + 273.15;

    if (gasTarget === 'P') {
      const pSolvedAtm = (gasN * R * tKelvin) / Math.max(1e-6, vLiters);
      return {
        symbol: 'P',
        valueMain: `${pSolvedAtm.toFixed(4)} atm`,
        valueAlt: `${(pSolvedAtm * 101.325).toFixed(2)} kPa · ${(pSolvedAtm * 760).toFixed(1)} mmHg`,
        stepFormula: `P = (n · R · T) / V = (${gasN} mol × 0.082057 L·atm/(mol·K) × ${tKelvin.toFixed(2)} K) / ${vLiters.toFixed(4)} L`,
      };
    }
    if (gasTarget === 'V') {
      const vSolvedL = (gasN * R * tKelvin) / Math.max(1e-6, pAtm);
      return {
        symbol: 'V',
        valueMain: `${vSolvedL.toFixed(4)} L`,
        valueAlt: `${(vSolvedL * 1000).toFixed(1)} mL`,
        stepFormula: `V = (n · R · T) / P = (${gasN} mol × 0.082057 L·atm/(mol·K) × ${tKelvin.toFixed(2)} K) / ${pAtm.toFixed(4)} atm`,
      };
    }
    if (gasTarget === 'n') {
      const nSolved = (pAtm * vLiters) / Math.max(1e-6, R * tKelvin);
      return {
        symbol: 'n',
        valueMain: `${nSolved.toFixed(4)} mol`,
        valueAlt: `${(nSolved * 6.022e23).toExponential(3)} molecules`,
        stepFormula: `n = (P · V) / (R · T) = (${pAtm.toFixed(4)} atm × ${vLiters.toFixed(4)} L) / (0.082057 × ${tKelvin.toFixed(2)} K)`,
      };
    }
    const tSolvedK = (pAtm * vLiters) / Math.max(1e-6, gasN * R);
    return {
      symbol: 'T',
      valueMain: `${tSolvedK.toFixed(2)} K`,
      valueAlt: `${(tSolvedK - 273.15).toFixed(2)} °C`,
      stepFormula: `T = (P · V) / (n · R) = (${pAtm.toFixed(4)} atm × ${vLiters.toFixed(4)} L) / (${gasN} mol × 0.082057)`,
    };
  }, [gasTarget, gasP, gasPUnit, gasV, gasVUnit, gasN, gasT, gasTUnit]);

  return (
    <div className="space-y-6">
      {/* Header & 6-Calculator Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Step-by-Step Chemistry Homework Calculators
          </h2>
          <p className="text-xs text-slate-500">
            Shows complete algebraic substitutions, dimensional analysis, and stoichiometric steps for coursework verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {(
            [
              ['molar-mass', '1. Molar Mass & % Composition', Scale],
              ['stoichiometry', '2. Equation Balancer & Limiting Reagent', Calculator],
              ['gas-law', '3. Ideal Gas Law (PV = nRT)', Wind],
              ['molarity-dilution', '4. Molarity & Solution Dilution', Beaker],
              ['ph-buffer', '5. pH, pOH & Buffer Solver', Droplet],
              ['thermochemistry', '6. Gibbs Free Energy (ΔG) & Keq', Flame],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTool(id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTool === id
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

      {/* TOOL 1: MOLAR MASS & ELEMENTAL COMPOSITION */}
      {activeTool === 'molar-mass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chemical Formula & Sample Mass Input
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports nested parentheses and crystal hydrates (use * or · for hydrates).
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Chemical Formula (Case-Sensitive):
                </label>
                <input
                  type="text"
                  value={formulaInput}
                  onChange={(e) => setFormulaInput(e.target.value)}
                  placeholder="e.g. CuSO4*5H2O or Ca3(PO4)2"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['CuSO4*5H2O', 'C6H12O6', 'Ca3(PO4)2', 'Fe2(SO4)3', 'KMnO4', 'C8H10N4O2'].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormulaInput(preset)}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    >
                      {preset}
                    </button>
                  )
                )}
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Given Sample Mass (grams):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={sampleMassGrams}
                  onChange={(e) => setSampleMassGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {molarMassResult.error ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-mono">
                {molarMassResult.error}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-mono">
                <div>
                  <span className="text-xs text-slate-500 block">Total Molar Mass (M)</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {molarMassResult.totalMass.toFixed(4)}{' '}
                    <span className="text-xs font-normal text-slate-500">g/mol</span>
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
                  <div className="text-slate-500">Dimensional Analysis for {sampleMassGrams} g:</div>
                  <div className="text-slate-900 font-semibold tabular-nums">
                    n = {sampleMassGrams} g ÷ {molarMassResult.totalMass.toFixed(3)} g/mol ={' '}
                    <span className="text-blue-600">{molarMassResult.moles.toFixed(5)} mol</span>
                  </div>
                  <div className="text-slate-700 tabular-nums">
                    N = n × Nₐ = <span className="text-emerald-700 font-semibold">{molarMassResult.molecules.toExponential(4)}</span> formula units
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Step-by-Step Elemental Mass Percent Breakdown
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Element</th>
                    <th className="py-2.5 px-3">Atoms</th>
                    <th className="py-2.5 px-3">Atomic Weight</th>
                    <th className="py-2.5 px-3">Subtotal (g/mol)</th>
                    <th className="py-2.5 px-3">Mass Percent (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {molarMassResult.rows.map((r) => {
                    const pct =
                      molarMassResult.totalMass > 0
                        ? (r.subtotal / molarMassResult.totalMass) * 100
                        : 0;
                    return (
                      <tr key={r.sym}>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                          {r.name} ({r.sym})
                        </td>
                        <td className="py-2.5 px-3">{r.count}</td>
                        <td className="py-2.5 px-3">{r.atomicMass.toFixed(4)}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {r.subtotal.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-14 font-bold text-blue-700">{pct.toFixed(2)}%</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: CHEMICAL EQUATION BALANCER & STOICHIOMETRY LIMITING REAGENT */}
      {activeTool === 'stoichiometry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Unbalanced Reaction & Reactant Masses
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Reaction Equation (Reactants -&gt; Products):
              </label>
              <input
                type="text"
                value={eqString}
                onChange={(e) => setEqString(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                'C3H8 + O2 -> CO2 + H2O',
                'Fe + O2 -> Fe2O3',
                'Al + HCl -> AlCl3 + H2',
                'N2 + H2 -> NH3',
                'CH4 + O2 -> CO2 + H2O',
              ].map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => setEqString(eq)}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                >
                  {eq}
                </button>
              ))}
            </div>

            {stoichResult.balanced && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {stoichResult.balanced.reactants[0] && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mass of {stoichResult.balanced.reactants[0].formula} (g):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={massReactant1}
                      onChange={(e) => setMassReactant1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
                {stoichResult.balanced.reactants[1] && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Mass of {stoichResult.balanced.reactants[1].formula} (g):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={massReactant2}
                      onChange={(e) => setMassReactant2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Actual Experimental Yield of 1st Product (g, for % Yield):
              </label>
              <input
                type="number"
                step="0.5"
                value={actualYieldGrams}
                onChange={(e) => setActualYieldGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            {stoichResult.error || !stoichResult.balanced ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-700">
                {stoichResult.error}
              </div>
            ) : (
              <>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs font-mono text-slate-500 mb-1">
                    Balanced Stoichiometric Equation:
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {stoichResult.balanced.reactants
                      .map((r) => `${r.coeff > 1 ? r.coeff : ''}${r.formula}`)
                      .join(' + ')}{' '}
                    →{' '}
                    {stoichResult.balanced.products
                      .map((p) => `${p.coeff > 1 ? p.coeff : ''}${p.formula}`)
                      .join(' + ')}
                  </div>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="font-sans font-semibold text-slate-900">
                      Step 1: Convert Input Reactant Masses to Moles (n = m / M)
                    </div>
                    {stoichResult.balanced.reactants[0] && (
                      <div>
                        n({stoichResult.balanced.reactants[0].formula}) = {massReactant1} g ÷{' '}
                        {stoichResult.balanced.reactants[0].molarMass.toFixed(3)} g/mol ={' '}
                        <strong className="text-blue-700">{stoichResult.mol1.toFixed(4)} mol</strong>
                      </div>
                    )}
                    {stoichResult.balanced.reactants[1] && (
                      <div>
                        n({stoichResult.balanced.reactants[1].formula}) = {massReactant2} g ÷{' '}
                        {stoichResult.balanced.reactants[1].molarMass.toFixed(3)} g/mol ={' '}
                        <strong className="text-blue-700">{stoichResult.mol2.toFixed(4)} mol</strong>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="font-sans font-semibold text-slate-900">
                      Step 2: Identify Limiting Reagent & Excess Reactant
                    </div>
                    <div>
                      Limiting Reagent:{' '}
                      <strong className="text-rose-600">{stoichResult.limitingName}</strong> (determines maximum reaction extent)
                    </div>
                    {stoichResult.excessFormula && (
                      <div>
                        Excess Reactant Remaining ({stoichResult.excessFormula}):{' '}
                        <strong className="text-slate-900">
                          {stoichResult.excessRemainingGrams.toFixed(3)} g unreacted
                        </strong>
                      </div>
                    )}
                  </div>

                  {stoichResult.balanced.products[0] && (
                    <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1.5">
                      <div className="font-sans font-semibold text-slate-900">
                        Step 3: Theoretical Yield & Percent Yield of{' '}
                        {stoichResult.balanced.products[0].formula}
                      </div>
                      <div>
                        Theoretical Yield = {stoichResult.theoMolesP1.toFixed(4)} mol ×{' '}
                        {stoichResult.balanced.products[0].molarMass.toFixed(3)} g/mol ={' '}
                        <strong className="text-blue-700 text-sm">
                          {stoichResult.theoGramsP1.toFixed(3)} g
                        </strong>
                      </div>
                      <div>
                        Percent Yield = ({actualYieldGrams} g ÷ {stoichResult.theoGramsP1.toFixed(3)} g) × 100% ={' '}
                        <strong className="text-emerald-700 text-sm">
                          {stoichResult.pctYield.toFixed(2)}%
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOOL 3: IDEAL GAS LAW (PV = nRT) */}
      {activeTool === 'gas-law' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Select Target Variable to Solve in PV = nRT
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  ['P', 'Pressure (P)'],
                  ['V', 'Volume (V)'],
                  ['n', 'Moles (n)'],
                  ['T', 'Temp (T)'],
                ] as const
              ).map(([vKey, label]) => (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => setGasTarget(vKey)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors ${
                    gasTarget === vKey
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              {gasTarget !== 'P' && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Pressure (P):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={gasP}
                      onChange={(e) => setGasP(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Unit:</label>
                    <select
                      value={gasPUnit}
                      onChange={(e) => setGasPUnit(e.target.value as any)}
                      className="w-full px-2 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="atm">atm</option>
                      <option value="kPa">kPa</option>
                      <option value="mmHg">mmHg</option>
                    </select>
                  </div>
                </div>
              )}

              {gasTarget !== 'V' && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Volume (V):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={gasV}
                      onChange={(e) => setGasV(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Unit:</label>
                    <select
                      value={gasVUnit}
                      onChange={(e) => setGasVUnit(e.target.value as any)}
                      className="w-full px-2 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="L">Liters (L)</option>
                      <option value="mL">mL</option>
                    </select>
                  </div>
                </div>
              )}

              {gasTarget !== 'n' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Amount of Gas (n, moles):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gasN}
                    onChange={(e) => setGasN(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              )}

              {gasTarget !== 'T' && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Temperature (T):</label>
                    <input
                      type="number"
                      step="1"
                      value={gasT}
                      onChange={(e) => setGasT(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Unit:</label>
                    <select
                      value={gasTUnit}
                      onChange={(e) => setGasTUnit(e.target.value as any)}
                      className="w-full px-2 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="K">Kelvin (K)</option>
                      <option value="C">Celsius (°C)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="text-xs font-mono text-slate-500">
                Universal Gas Constant R = 0.082057 L·atm/(mol·K) = 8.3145 J/(mol·K)
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono space-y-2">
                <div className="text-xs text-slate-500">Solved Value ({gasSolution.symbol}):</div>
                <div className="text-3xl font-bold text-blue-600 tabular-nums">
                  {gasSolution.valueMain}
                </div>
                <div className="text-xs text-slate-600 tabular-nums">
                  Equivalent Units: {gasSolution.valueAlt}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono space-y-2">
                <div className="font-sans font-semibold text-slate-900">
                  Step-by-Step Algebraic Rearrangement:
                </div>
                <div className="text-slate-700 break-all">{gasSolution.stepFormula}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 4: MOLARITY & SOLUTION DILUTION (M1V1 = M2V2) */}
      {activeTool === 'molarity-dilution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solution Preparation from Solid Mass */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Part A: Molarity from Solid Solute (M = n / V)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Solute Mass (g):</label>
                <input
                  type="number"
                  step="0.1"
                  value={soluteMassG}
                  onChange={(e) => setSoluteMassG(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Molar Mass (g/mol):</label>
                <input
                  type="number"
                  step="0.1"
                  value={soluteMolarMass}
                  onChange={(e) => setSoluteMolarMass(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Volume (mL):</label>
                <input
                  type="number"
                  step="10"
                  value={solutionVolumeMl}
                  onChange={(e) => setSolutionVolumeMl(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            {(() => {
              const moles = soluteMassG / Math.max(1e-6, soluteMolarMass);
              const liters = solutionVolumeMl / 1000;
              const molarity = moles / Math.max(1e-6, liters);
              return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-1.5">
                  <div>
                    1. Moles of Solute: n = {soluteMassG} g ÷ {soluteMolarMass} g/mol ={' '}
                    <strong>{moles.toFixed(4)} mol</strong>
                  </div>
                  <div>
                    2. Molarity: M = {moles.toFixed(4)} mol ÷ {liters.toFixed(3)} L ={' '}
                    <strong className="text-lg text-blue-600">{molarity.toFixed(4)} M (mol/L)</strong>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Stock Solution Dilution (M1V1 = M2V2) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Part B: Stock Solution Dilution (M₁V₁ = M₂V₂)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Stock M₁ (M):</label>
                <input
                  type="number"
                  step="0.1"
                  value={dilM1}
                  onChange={(e) => setDilM1(parseFloat(e.target.value) || 0.1)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target M₂ (M):</label>
                <input
                  type="number"
                  step="0.05"
                  value={dilM2}
                  onChange={(e) => setDilM2(parseFloat(e.target.value) || 0.05)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target V₂ (mL):</label>
                <input
                  type="number"
                  step="25"
                  value={dilV2Ml}
                  onChange={(e) => setDilV2Ml(parseFloat(e.target.value) || 100)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            {(() => {
              const v1Ml = (dilM2 * dilV2Ml) / Math.max(1e-6, dilM1);
              const waterMl = Math.max(0, dilV2Ml - v1Ml);
              return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-1.5">
                  <div>
                    Required Stock Volume V₁ = (M₂ × V₂) / M₁ = ({dilM2} M × {dilV2Ml} mL) / {dilM1} M ={' '}
                    <strong className="text-lg text-blue-600">{v1Ml.toFixed(2)} mL</strong>
                  </div>
                  <div className="text-slate-600">
                    Lab Procedure: Pipette <strong>{v1Ml.toFixed(2)} mL</strong> of {dilM1} M stock and dilute with{' '}
                    <strong>{waterMl.toFixed(2)} mL</strong> DI water to reach {dilV2Ml} mL total volume.
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TOOL 5: pH, pOH & HENDERSON-HASSELBALCH BUFFER SOLVER */}
      {activeTool === 'ph-buffer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Aqueous pH / pOH / [H₃O⁺] / [OH⁻] Interconverter (25 °C)
            </h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Solution pH (0.00 – 14.00):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={inputPh}
                onChange={(e) => setInputPh(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {(() => {
              const poh = 14.0 - inputPh;
              const hPlus = Math.pow(10, -inputPh);
              const ohMinus = Math.pow(10, -poh);
              return (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs tabular-nums">
                  <div>
                    <span className="text-slate-400 block">pH = −log₁₀[H₃O⁺]</span>
                    <span className="text-lg font-bold text-slate-900">{inputPh.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">pOH = 14.00 − pH</span>
                    <span className="text-lg font-bold text-slate-900">{poh.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">[H₃O⁺] = 10⁻ᵖᴴ</span>
                    <span className="text-sm font-bold text-rose-600">{hPlus.toExponential(3)} M</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">[OH⁻] = 10⁻ᵖᴼᴴ</span>
                    <span className="text-sm font-bold text-blue-600">{ohMinus.toExponential(3)} M</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Henderson-Hasselbalch Buffer Equation Solver
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Acid pKₐ:</label>
                <input
                  type="number"
                  step="0.05"
                  value={bufferPka}
                  onChange={(e) => setBufferPka(parseFloat(e.target.value) || 4.76)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Weak Acid [HA] (M):</label>
                <input
                  type="number"
                  step="0.05"
                  value={bufferAcidM}
                  onChange={(e) => setBufferAcidM(parseFloat(e.target.value) || 0.1)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Conj. Base [A⁻] (M):</label>
                <input
                  type="number"
                  step="0.05"
                  value={bufferBaseM}
                  onChange={(e) => setBufferBaseM(parseFloat(e.target.value) || 0.1)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {(() => {
              const ratio = bufferBaseM / Math.max(1e-6, bufferAcidM);
              const logRatio = Math.log10(Math.max(1e-6, ratio));
              const bufPh = bufferPka + logRatio;
              return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-1.5">
                  <div>
                    pH = pKₐ + log₁₀([A⁻] / [HA]) = {bufferPka} + log₁₀({bufferBaseM} / {bufferAcidM})
                  </div>
                  <div>
                    Resulting Buffer pH ={' '}
                    <strong className="text-lg text-blue-600">{bufPh.toFixed(3)}</strong> (Effective Buffer Range:{' '}
                    {(bufferPka - 1).toFixed(2)} – {(bufferPka + 1).toFixed(2)})
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TOOL 6: THERMOCHEMISTRY & GIBBS FREE ENERGY (ΔG = ΔH - TΔS) */}
      {activeTool === 'thermochemistry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Enthalpy (ΔH°), Entropy (ΔS°) & Temperature
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Enthalpy Change ΔH° (kJ/mol):
                </label>
                <input
                  type="number"
                  step="1"
                  value={deltaH}
                  onChange={(e) => setDeltaH(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Entropy Change ΔS° (J/(mol·K) — note Joules!):
                </label>
                <input
                  type="number"
                  step="1"
                  value={deltaS}
                  onChange={(e) => setDeltaS(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Temperature T (Kelvin):
                </label>
                <input
                  type="number"
                  step="10"
                  value={thermoTempK}
                  onChange={(e) => setThermoTempK(parseFloat(e.target.value) || 298.15)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            {(() => {
              const deltaSkJ = deltaS / 1000;
              const deltaG = deltaH - thermoTempK * deltaSkJ;
              const RkJ = 0.0083145;
              const lnK = -deltaG / (RkJ * Math.max(1, thermoTempK));
              const Keq = Math.exp(Math.max(-100, Math.min(100, lnK)));
              const tCrossover =
                deltaSkJ !== 0 && deltaH * deltaSkJ > 0 ? deltaH / deltaSkJ : null;

              return (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2">
                    <div className="text-slate-500">Gibbs Free Energy ΔG° = ΔH° − T·ΔS°</div>
                    <div className="text-3xl font-bold text-slate-900 tabular-nums">
                      ΔG° = {deltaG.toFixed(2)} kJ/mol
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        deltaG < 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {deltaG < 0
                        ? '● Spontaneous Forward Reaction (Exergonic, ΔG < 0, K > 1)'
                        : '▲ Non-Spontaneous Forward Reaction (Endergonic, ΔG > 0, K < 1)'}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="font-sans font-semibold text-slate-900">
                      Step-by-Step Thermodynamic Substitution:
                    </div>
                    <div>
                      1. Convert ΔS° to kJ/(mol·K): {deltaS} J/(mol·K) ÷ 1000 = {deltaSkJ.toFixed(4)} kJ/(mol·K)
                    </div>
                    <div>
                      2. ΔG° = ({deltaH} kJ/mol) − ({thermoTempK} K × {deltaSkJ.toFixed(4)} kJ/(mol·K)) ={' '}
                      <strong>{deltaG.toFixed(2)} kJ/mol</strong>
                    </div>
                    <div>
                      3. Equilibrium Constant: K = exp(−ΔG° / RT) ={' '}
                      <strong className="text-blue-700">{Keq.toExponential(3)}</strong>
                    </div>
                    {tCrossover !== null && (
                      <div>
                        4. Crossover Temperature (ΔG° = 0): T = ΔH° / ΔS° ={' '}
                        <strong className="text-amber-700">{tCrossover.toFixed(1)} K</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
