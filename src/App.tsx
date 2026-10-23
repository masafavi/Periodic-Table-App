/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PeriodicTableWorkspace } from './components/PeriodicTableWorkspace';
import { MolecularStudio } from './components/MolecularStudio';
import { ReactionSimulator } from './components/ReactionSimulator';
import { HomeworkCalculators } from './components/HomeworkCalculators';
import { LabEquipmentTutorials } from './components/LabEquipmentTutorials';

type WorkspaceSection =
  | 'periodic-table'
  | 'molecular-studio'
  | 'reaction-lab'
  | 'calculators'
  | 'lab-equipment';

const FUNDAMENTAL_CONSTANTS = [
  { name: 'Avogadro Constant (Nₐ)', value: '6.02214076 × 10²³ mol⁻¹' },
  { name: 'Molar Gas Constant (R)', value: '8.314462 J/(mol·K) · 0.082057 L·atm/(mol·K)' },
  { name: 'Planck Constant (h)', value: '6.62607015 × 10⁻³⁴ J·s' },
  { name: 'Speed of Light in Vacuum (c)', value: '2.99792458 × 10⁸ m/s' },
  { name: 'Faraday Constant (F)', value: '96,485.332 C/mol' },
  { name: 'Boltzmann Constant (k_B)', value: '1.380649 × 10⁻²³ J/K' },
  { name: 'Elementary Charge (e)', value: '1.602176634 × 10⁻¹⁹ C' },
  { name: 'Standard Molar Volume (STP, 0 °C, 1 atm)', value: '22.414 L/mol' },
  { name: 'Water Autoionization (K_w @ 25 °C)', value: '1.00 × 10⁻¹⁴' },
];

const POLYATOMIC_IONS = [
  { formula: 'NH₄⁺', name: 'Ammonium', charge: '+1' },
  { formula: 'H₃O⁺', name: 'Hydronium', charge: '+1' },
  { formula: 'CH₃COO⁻', name: 'Acetate', charge: '−1' },
  { formula: 'CN⁻', name: 'Cyanide', charge: '−1' },
  { formula: 'OH⁻', name: 'Hydroxide', charge: '−1' },
  { formula: 'NO₃⁻', name: 'Nitrate', charge: '−1' },
  { formula: 'NO₂⁻', name: 'Nitrite', charge: '−1' },
  { formula: 'MnO₄⁻', name: 'Permanganate', charge: '−1' },
  { formula: 'HCO₃⁻', name: 'Hydrogen carbonate (Bicarbonate)', charge: '−1' },
  { formula: 'ClO₄⁻', name: 'Perchlorate', charge: '−1' },
  { formula: 'CO₃²⁻', name: 'Carbonate', charge: '−2' },
  { formula: 'CrO₄²⁻', name: 'Chromate', charge: '−2' },
  { formula: 'Cr₂O₇²⁻', name: 'Dichromate', charge: '−2' },
  { formula: 'SO₄²⁻', name: 'Sulfate', charge: '−2' },
  { formula: 'SO₃²⁻', name: 'Sulfite', charge: '−2' },
  { formula: 'PO₄³⁻', name: 'Phosphate', charge: '−3' },
];

const SOLUBILITY_RULES = [
  '1. All common salts of Group 1 cations (Li⁺, Na⁺, K⁺, Cs⁺) and ammonium (NH₄⁺) are soluble in water.',
  '2. All common nitrates (NO₃⁻), acetates (CH₃COO⁻), chlorates (ClO₃⁻), and perchlorates (ClO₄⁻) are soluble.',
  '3. Binary halides (Cl⁻, Br⁻, I⁻) are soluble EXCEPT with Ag⁺, Pb²⁺, and Hg₂²⁺.',
  '4. Sulfates (SO₄²⁻) are soluble EXCEPT with Ba²⁺, Sr²⁺, Pb²⁺, Ca²⁺, and Ag⁺.',
  '5. Carbonates (CO₃²⁻), phosphates (PO₄³⁻), sulfides (S²⁻), and hydroxides (OH⁻) are insoluble EXCEPT with Group 1 cations, NH₄⁺, and Ba²⁺/Sr²⁺/Ca²⁺ (slightly soluble hydroxides).',
];

export default function App() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('periodic-table');
  const [showRefModal, setShowRefModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single Text Wordmark */}
        <a
          href="#periodic-table"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('periodic-table');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          ChemSphere 3D
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
          {(
            [
              ['periodic-table', 'Periodic Table'],
              ['molecular-studio', 'Molecular Studio'],
              ['reaction-lab', 'Reaction Lab'],
              ['calculators', 'Calculators'],
              ['lab-equipment', 'Lab Equipment'],
            ] as [WorkspaceSection, string][]
          ).map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(id);
              }}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === id
                  ? 'text-blue-600 border-blue-600 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setShowRefModal(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Reference Sheet
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Presence) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {activeSection === 'periodic-table' && <PeriodicTableWorkspace />}
        {activeSection === 'molecular-studio' && <MolecularStudio />}
        {activeSection === 'reaction-lab' && <ReactionSimulator />}
        {activeSection === 'calculators' && <HomeworkCalculators />}
        {activeSection === 'lab-equipment' && <LabEquipmentTutorials />}
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            ChemSphere 3D — Interactive Atomic, Molecular & Analytical Chemistry Workbench · IUPAC 2026 Standard Atomic Weights
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('periodic-table')}
              className="hover:text-slate-900 transition-colors"
            >
              Periodic Table
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveSection('molecular-studio')}
              className="hover:text-slate-900 transition-colors"
            >
              PubChem 3D Studio
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveSection('calculators')}
              className="hover:text-slate-900 transition-colors"
            >
              Homework Solvers
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setShowRefModal(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Constants & Polyatomic Ions
            </button>
          </div>
        </div>
      </footer>

      {/* Chemistry Reference Sheet Modal */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  AP / University Chemistry Reference Sheet
                </h2>
                <p className="text-xs text-slate-500">
                  CODATA physical constants, common polyatomic ions, and aqueous solubility rules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRefModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical Constants */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Fundamental Physical Constants
                  </h3>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                    {FUNDAMENTAL_CONSTANTS.map((c, idx) => (
                      <div key={idx} className="px-3.5 py-2 flex justify-between gap-2">
                        <span className="text-slate-600">{c.name}</span>
                        <span className="font-mono font-semibold text-slate-900 text-right tabular-nums">
                          {c.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Polyatomic Ions */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900">
                    Common Polyatomic Ions
                  </h3>
                  <div className="border border-slate-200 rounded-xl max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {POLYATOMIC_IONS.map((ion, idx) => (
                      <div key={idx} className="px-3.5 py-2 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-blue-700 mr-2">
                            {ion.formula}
                          </span>
                          <span className="text-slate-700">{ion.name}</span>
                        </div>
                        <span className="font-mono text-slate-500 tabular-nums">
                          Charge: {ion.charge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aqueous Solubility Rules */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Aqueous Ionic Solubility Guidelines (25 °C)
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs text-slate-700">
                  {SOLUBILITY_RULES.map((rule, idx) => (
                    <div key={idx}>{rule}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
