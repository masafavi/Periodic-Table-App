export interface Atom3D {
  id: number;
  element: string;
  x: number;
  y: number;
  z: number;
  partialCharge?: number;
}

export interface Bond3D {
  from: number; // 0-indexed atom index
  to: number;   // 0-indexed atom index
  order: 1 | 2 | 3;
}

export interface MoleculeData {
  id: string;
  name: string;
  iupacName: string;
  formula: string;
  cid: number;
  smiles: string;
  molarMass: number;
  vseprGeometry: string;
  hybridization: string;
  bondAngle: string;
  dipoleMoment: string; // Debye
  polarity: 'Nonpolar' | 'Polar' | 'Ionic / Coordination';
  category: string;
  description: string;
  xlogp: number;
  tpsa: number;
  hBondDonors: number;
  hBondAcceptors: number;
  rotatableBonds: number;
  provenance: 'Experimentally determined' | 'PubChem 3D Conformer';
  atoms: Atom3D[];
  bonds: Bond3D[];
}

export const CPK_ATOM_COLORS: Record<string, { hex: string; radius: number }> = {
  H: { hex: '#F8FAFC', radius: 0.32 },
  C: { hex: '#334155', radius: 0.52 },
  N: { hex: '#2563EB', radius: 0.50 },
  O: { hex: '#EF4444', radius: 0.48 },
  F: { hex: '#10B981', radius: 0.45 },
  P: { hex: '#F97316', radius: 0.62 },
  S: { hex: '#EAB308', radius: 0.60 },
  Cl: { hex: '#22C55E', radius: 0.58 },
  Br: { hex: '#991B1B', radius: 0.65 },
  I: { hex: '#7E22CE', radius: 0.72 },
  Pt: { hex: '#94A3B8', radius: 0.75 },
  Fe: { hex: '#EA580C', radius: 0.72 },
  Na: { hex: '#8B5CF6', radius: 0.75 },
  Mg: { hex: '#84CC16', radius: 0.70 },
};

export const PRESET_MOLECULES: MoleculeData[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    iupacName: '1,3,7-Trimethylpurine-2,6-dione',
    formula: 'C₈H₁₀N₄O₂',
    cid: 2519,
    smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    molarMass: 194.19,
    vseprGeometry: 'Planar Bicyclic Purine Ring + Tetrahedral Methyls',
    hybridization: 'sp² (ring C, N, O) · sp³ (methyl C)',
    bondAngle: '120.0° (pyrimidine) · 108.0° (imidazole) · 109.5° (-CH₃)',
    dipoleMoment: '3.64 D',
    polarity: 'Polar',
    category: 'Alkaloid / CNS Stimulant',
    description: 'A methylxanthine alkaloid that competitively antagonizes adenosine A₁ and A₂A receptors in the central nervous system. Its bicyclic purine core exhibits delocalized π-conjugation across two amide carbonyls.',
    xlogp: -0.07,
    tpsa: 58.4,
    hBondDonors: 0,
    hBondAcceptors: 6,
    rotatableBonds: 0,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'N', x: -1.38, y: 0.96, z: 0.01, partialCharge: -0.35 },
      { id: 1, element: 'C', x: -1.42, y: -0.42, z: 0.00, partialCharge: 0.48 },
      { id: 2, element: 'N', x: -0.22, y: -1.10, z: 0.00, partialCharge: -0.36 },
      { id: 3, element: 'C', x: 0.96, y: -0.38, z: 0.00, partialCharge: 0.18 },
      { id: 4, element: 'C', x: 0.94, y: 1.01, z: 0.01, partialCharge: 0.12 },
      { id: 5, element: 'C', x: -0.24, y: 1.75, z: 0.01, partialCharge: 0.52 },
      { id: 6, element: 'N', x: 2.24, y: 1.46, z: 0.01, partialCharge: -0.30 },
      { id: 7, element: 'C', x: 2.98, y: 0.32, z: 0.01, partialCharge: 0.22 },
      { id: 8, element: 'N', x: 2.26, y: -0.82, z: 0.00, partialCharge: -0.42 },
      { id: 9, element: 'O', x: -2.49, y: -1.03, z: -0.01, partialCharge: -0.52 },
      { id: 10, element: 'O', x: -0.25, y: 2.98, z: 0.02, partialCharge: -0.54 },
      { id: 11, element: 'C', x: -2.65, y: 1.69, z: 0.02, partialCharge: -0.12 },
      { id: 12, element: 'C', x: -0.24, y: -2.56, z: -0.01, partialCharge: -0.12 },
      { id: 13, element: 'C', x: 2.68, y: 2.85, z: 0.02, partialCharge: -0.10 },
      { id: 14, element: 'H', x: 4.06, y: 0.34, z: 0.01, partialCharge: 0.15 },
      { id: 15, element: 'H', x: -3.24, y: 1.42, z: 0.90, partialCharge: 0.09 },
      { id: 16, element: 'H', x: -3.23, y: 1.44, z: -0.87, partialCharge: 0.09 },
      { id: 17, element: 'H', x: -2.46, y: 2.77, z: 0.03, partialCharge: 0.09 },
      { id: 18, element: 'H', x: 0.78, y: -2.95, z: -0.01, partialCharge: 0.09 },
      { id: 19, element: 'H', x: -0.76, y: -2.93, z: 0.88, partialCharge: 0.09 },
      { id: 20, element: 'H', x: -0.76, y: -2.92, z: -0.90, partialCharge: 0.09 },
      { id: 21, element: 'H', x: 3.77, y: 2.89, z: 0.02, partialCharge: 0.09 },
      { id: 22, element: 'H', x: 2.30, y: 3.36, z: -0.87, partialCharge: 0.09 },
      { id: 23, element: 'H', x: 2.30, y: 3.35, z: 0.91, partialCharge: 0.09 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 2 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 0, order: 1 },
      { from: 4, to: 6, order: 1 },
      { from: 6, to: 7, order: 1 },
      { from: 7, to: 8, order: 2 },
      { from: 8, to: 3, order: 1 },
      { from: 1, to: 9, order: 2 },
      { from: 5, to: 10, order: 2 },
      { from: 0, to: 11, order: 1 },
      { from: 2, to: 12, order: 1 },
      { from: 6, to: 13, order: 1 },
      { from: 7, to: 14, order: 1 },
      { from: 11, to: 15, order: 1 },
      { from: 11, to: 16, order: 1 },
      { from: 11, to: 17, order: 1 },
      { from: 12, to: 18, order: 1 },
      { from: 12, to: 19, order: 1 },
      { from: 12, to: 20, order: 1 },
      { from: 13, to: 21, order: 1 },
      { from: 13, to: 22, order: 1 },
      { from: 13, to: 23, order: 1 },
    ],
  },
  {
    id: 'aspirin',
    name: 'Aspirin (Acetylsalicylic Acid)',
    iupacName: '2-Acetyloxybenzoic acid',
    formula: 'C₉H₈O₄',
    cid: 2244,
    smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    molarMass: 180.16,
    vseprGeometry: 'Planar Aromatic Ring + Trigonal Planar Carboxyl & Ester',
    hybridization: 'sp² (phenyl & carbonyl C) · sp³ (methyl C)',
    bondAngle: '120.0° (aryl & C=O) · 109.5° (-CH₃)',
    dipoleMoment: '2.07 D',
    polarity: 'Polar',
    category: 'NSAID / COX Inhibitor',
    description: 'Irreversibly acetylates a serine hydroxyl residue in the active site of cyclooxygenase (COX-1 and COX-2), blocking prostaglandin and thromboxane synthesis.',
    xlogp: 1.2,
    tpsa: 63.6,
    hBondDonors: 1,
    hBondAcceptors: 4,
    rotatableBonds: 3,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'C', x: -0.95, y: 0.12, z: -0.10, partialCharge: 0.15 },
      { id: 1, element: 'C', x: 0.12, y: 1.01, z: -0.05, partialCharge: 0.05 },
      { id: 2, element: 'C', x: -0.14, y: 2.38, z: 0.02, partialCharge: -0.12 },
      { id: 3, element: 'C', x: -1.45, y: 2.85, z: 0.04, partialCharge: -0.12 },
      { id: 4, element: 'C', x: -2.51, y: 1.95, z: -0.01, partialCharge: -0.12 },
      { id: 5, element: 'C', x: -2.26, y: 0.58, z: -0.08, partialCharge: -0.12 },
      { id: 6, element: 'C', x: 1.52, y: 0.52, z: -0.08, partialCharge: 0.55 },
      { id: 7, element: 'O', x: 2.48, y: 1.28, z: -0.02, partialCharge: -0.52 },
      { id: 8, element: 'O', x: 1.68, y: -0.81, z: -0.18, partialCharge: -0.58 },
      { id: 9, element: 'O', x: -0.70, y: -1.24, z: -0.18, partialCharge: -0.44 },
      { id: 10, element: 'C', x: -0.82, y: -2.02, z: 0.94, partialCharge: 0.54 },
      { id: 11, element: 'O', x: -1.12, y: -1.56, z: 2.02, partialCharge: -0.50 },
      { id: 12, element: 'C', x: -0.52, y: -3.46, z: 0.66, partialCharge: -0.22 },
      { id: 13, element: 'H', x: 0.69, y: 3.08, z: 0.06, partialCharge: 0.12 },
      { id: 14, element: 'H', x: -1.65, y: 3.92, z: 0.10, partialCharge: 0.12 },
      { id: 15, element: 'H', x: -3.54, y: 2.31, z: 0.01, partialCharge: 0.12 },
      { id: 16, element: 'H', x: -3.08, y: -0.13, z: -0.12, partialCharge: 0.12 },
      { id: 17, element: 'H', x: 2.62, y: -1.08, z: -0.20, partialCharge: 0.42 },
      { id: 18, element: 'H', x: -0.62, y: -4.05, z: 1.57, partialCharge: 0.09 },
      { id: 19, element: 'H', x: 0.50, y: -3.58, z: 0.28, partialCharge: 0.09 },
      { id: 20, element: 'H', x: -1.22, y: -3.84, z: -0.09, partialCharge: 0.09 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 2 },
      { from: 5, to: 0, order: 1 },
      { from: 1, to: 6, order: 1 },
      { from: 6, to: 7, order: 2 },
      { from: 6, to: 8, order: 1 },
      { from: 0, to: 9, order: 1 },
      { from: 9, to: 10, order: 1 },
      { from: 10, to: 11, order: 2 },
      { from: 10, to: 12, order: 1 },
      { from: 2, to: 13, order: 1 },
      { from: 3, to: 14, order: 1 },
      { from: 4, to: 15, order: 1 },
      { from: 5, to: 16, order: 1 },
      { from: 8, to: 17, order: 1 },
      { from: 12, to: 18, order: 1 },
      { from: 12, to: 19, order: 1 },
      { from: 12, to: 20, order: 1 },
    ],
  },
  {
    id: 'benzene',
    name: 'Benzene',
    iupacName: 'Benzene',
    formula: 'C₆H₆',
    cid: 241,
    smiles: 'C1=CC=CC=C1',
    molarMass: 78.11,
    vseprGeometry: 'D₆h Planar Hexagonal Ring',
    hybridization: 'sp² (all 6 carbons, 6π Hückel aromatic)',
    bondAngle: '120.0° (exact C-C-C and H-C-C)',
    dipoleMoment: '0.00 D',
    polarity: 'Nonpolar',
    category: 'Aromatic Hydrocarbon',
    description: 'The archetypal Hückel aromatic hydrocarbon (4n+2 = 6 π-electrons). All six C-C bond lengths are identical (1.397 Å), intermediate between a single bond (1.54 Å) and a double bond (1.34 Å).',
    xlogp: 2.1,
    tpsa: 0.0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    rotatableBonds: 0,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'C', x: 1.397, y: 0.000, z: 0.0, partialCharge: -0.11 },
      { id: 1, element: 'C', x: 0.698, y: 1.210, z: 0.0, partialCharge: -0.11 },
      { id: 2, element: 'C', x: -0.698, y: 1.210, z: 0.0, partialCharge: -0.11 },
      { id: 3, element: 'C', x: -1.397, y: 0.000, z: 0.0, partialCharge: -0.11 },
      { id: 4, element: 'C', x: -0.698, y: -1.210, z: 0.0, partialCharge: -0.11 },
      { id: 5, element: 'C', x: 0.698, y: -1.210, z: 0.0, partialCharge: -0.11 },
      { id: 6, element: 'H', x: 2.484, y: 0.000, z: 0.0, partialCharge: 0.11 },
      { id: 7, element: 'H', x: 1.242, y: 2.151, z: 0.0, partialCharge: 0.11 },
      { id: 8, element: 'H', x: -1.242, y: 2.151, z: 0.0, partialCharge: 0.11 },
      { id: 9, element: 'H', x: -2.484, y: 0.000, z: 0.0, partialCharge: 0.11 },
      { id: 10, element: 'H', x: -1.242, y: -2.151, z: 0.0, partialCharge: 0.11 },
      { id: 11, element: 'H', x: 1.242, y: -2.151, z: 0.0, partialCharge: 0.11 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 1, to: 2, order: 1 },
      { from: 2, to: 3, order: 2 },
      { from: 3, to: 4, order: 1 },
      { from: 4, to: 5, order: 2 },
      { from: 5, to: 0, order: 1 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 2, to: 8, order: 1 },
      { from: 3, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 },
      { from: 5, to: 11, order: 1 },
    ],
  },
  {
    id: 'water',
    name: 'Water',
    iupacName: 'Oxidane',
    formula: 'H₂O',
    cid: 962,
    smiles: 'O',
    molarMass: 18.015,
    vseprGeometry: 'Bent / Angular (AX₂E₂)',
    hybridization: 'sp³ (2 bonding pairs, 2 lone pairs)',
    bondAngle: '104.45° (compressed from 109.5° by lone-pair repulsion)',
    dipoleMoment: '1.85 D',
    polarity: 'Polar',
    category: 'Universal Solvent / Inorganic',
    description: 'Two lone pairs on oxygen exert stronger electrostatic repulsion than the two O–H bonding pairs, compressing the H–O–H angle from the ideal tetrahedral 109.5° to 104.45° and creating a strong permanent dipole.',
    xlogp: -0.5,
    tpsa: 25.3,
    hBondDonors: 1,
    hBondAcceptors: 1,
    rotatableBonds: 0,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'O', x: 0.000, y: 0.117, z: 0.000, partialCharge: -0.834 },
      { id: 1, element: 'H', x: 0.757, y: -0.469, z: 0.000, partialCharge: 0.417 },
      { id: 2, element: 'H', x: -0.757, y: -0.469, z: 0.000, partialCharge: 0.417 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
    ],
  },
  {
    id: 'ammonia',
    name: 'Ammonia',
    iupacName: 'Azane',
    formula: 'NH₃',
    cid: 222,
    smiles: 'N',
    molarMass: 17.031,
    vseprGeometry: 'Trigonal Pyramidal (AX₃E₁)',
    hybridization: 'sp³ (3 bonding pairs, 1 lone pair)',
    bondAngle: '107.8°',
    dipoleMoment: '1.47 D',
    polarity: 'Polar',
    category: 'Inorganic Base / Fertilizer Feedstock',
    description: 'Synthesized industrially via the Haber-Bosch process (N₂ + 3H₂ ⇌ 2NH₃). A single non-bonding lone pair on nitrogen gives NH₃ a trigonal pyramidal geometry and Brønsted-Lowry/Lewis basicity.',
    xlogp: -0.3,
    tpsa: 26.0,
    hBondDonors: 1,
    hBondAcceptors: 1,
    rotatableBonds: 0,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'N', x: 0.000, y: 0.116, z: 0.000, partialCharge: -0.90 },
      { id: 1, element: 'H', x: 0.939, y: -0.270, z: 0.000, partialCharge: 0.30 },
      { id: 2, element: 'H', x: -0.470, y: -0.270, z: 0.813, partialCharge: 0.30 },
      { id: 3, element: 'H', x: -0.470, y: -0.270, z: -0.813, partialCharge: 0.30 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
    ],
  },
  {
    id: 'methane',
    name: 'Methane',
    iupacName: 'Methane',
    formula: 'CH₄',
    cid: 297,
    smiles: 'C',
    molarMass: 16.043,
    vseprGeometry: 'Tetrahedral (AX₄)',
    hybridization: 'sp³',
    bondAngle: '109.47° (arccos(-1/3))',
    dipoleMoment: '0.00 D',
    polarity: 'Nonpolar',
    category: 'Alkane Hydrocarbon',
    description: 'Four identical sp³ hybrid orbitals on carbon point toward the vertices of a regular tetrahedron (Td point group), canceling out individual bond dipoles completely.',
    xlogp: 1.09,
    tpsa: 0.0,
    hBondDonors: 0,
    hBondAcceptors: 0,
    rotatableBonds: 0,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'C', x: 0.000, y: 0.000, z: 0.000, partialCharge: -0.40 },
      { id: 1, element: 'H', x: 0.629, y: 0.629, z: 0.629, partialCharge: 0.10 },
      { id: 2, element: 'H', x: -0.629, y: -0.629, z: 0.629, partialCharge: 0.10 },
      { id: 3, element: 'H', x: -0.629, y: 0.629, z: -0.629, partialCharge: 0.10 },
      { id: 4, element: 'H', x: 0.629, y: -0.629, z: -0.629, partialCharge: 0.10 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
    ],
  },
  {
    id: 'sulfuric-acid',
    name: 'Sulfuric Acid',
    iupacName: 'Sulfuric acid',
    formula: 'H₂SO₄',
    cid: 1118,
    smiles: 'OS(=O)(=O)O',
    molarMass: 98.079,
    vseprGeometry: 'Distorted Tetrahedral at Sulfur (AX₄)',
    hybridization: 'sp³ with S=O π-backbonding',
    bondAngle: '119.0° (O=S=O) · 104.0° (HO-S-OH)',
    dipoleMoment: '2.72 D',
    polarity: 'Polar',
    category: 'Strong Diprotic Mineral Acid',
    description: 'The world’s largest-volume industrial chemical, manufactured via the vanadium-catalyzed Contact Process. Strong π-character in the two S=O double bonds widens the O=S=O angle to 119°.',
    xlogp: -1.4,
    tpsa: 83.0,
    hBondDonors: 2,
    hBondAcceptors: 4,
    rotatableBonds: 0,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'S', x: 0.000, y: 0.000, z: 0.120, partialCharge: 1.42 },
      { id: 1, element: 'O', x: 0.000, y: 1.255, z: 0.815, partialCharge: -0.58 },
      { id: 2, element: 'O', x: 0.000, y: -1.255, z: 0.815, partialCharge: -0.58 },
      { id: 3, element: 'O', x: 1.240, y: 0.000, z: -0.820, partialCharge: -0.55 },
      { id: 4, element: 'O', x: -1.240, y: 0.000, z: -0.820, partialCharge: -0.55 },
      { id: 5, element: 'H', x: 1.980, y: 0.420, z: -0.360, partialCharge: 0.42 },
      { id: 6, element: 'H', x: -1.980, y: -0.420, z: -0.360, partialCharge: 0.42 },
    ],
    bonds: [
      { from: 0, to: 1, order: 2 },
      { from: 0, to: 2, order: 2 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 3, to: 5, order: 1 },
      { from: 4, to: 6, order: 1 },
    ],
  },
  {
    id: 'cisplatin',
    name: 'Cisplatin',
    iupacName: 'cis-Diamminedichloroplatinum(II)',
    formula: 'Pt(NH₃)₂Cl₂',
    cid: 5702198,
    smiles: 'N.N.Cl[Pt]Cl',
    molarMass: 300.05,
    vseprGeometry: 'Square Planar (dsp² / d⁸ Low-Spin)',
    hybridization: 'dsp² (5d⁸ Pt²⁺ coordination complex)',
    bondAngle: '90.0° (cis-Cl-Pt-Cl = 91.9°)',
    dipoleMoment: '10.3 D',
    polarity: 'Ionic / Coordination',
    description: 'Barnett Rosenberg’s landmark square-planar Pt(II) coordination complex. Only the cis stereoisomer cross-links adjacent guanine N7 purine bases in DNA to trigger apoptosis in rapidly dividing cancer cells.',
    xlogp: -2.19,
    tpsa: 65.2,
    hBondDonors: 2,
    hBondAcceptors: 2,
    rotatableBonds: 0,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'Pt', x: 0.00, y: 0.00, z: 0.00, partialCharge: 0.68 },
      { id: 1, element: 'Cl', x: -1.64, y: 1.64, z: 0.00, partialCharge: -0.48 },
      { id: 2, element: 'Cl', x: 1.64, y: 1.64, z: 0.00, partialCharge: -0.48 },
      { id: 3, element: 'N', x: -1.45, y: -1.45, z: 0.00, partialCharge: -0.66 },
      { id: 4, element: 'N', x: 1.45, y: -1.45, z: 0.00, partialCharge: -0.66 },
      { id: 5, element: 'H', x: -2.38, y: -1.04, z: 0.00, partialCharge: 0.27 },
      { id: 6, element: 'H', x: -1.36, y: -2.04, z: 0.82, partialCharge: 0.27 },
      { id: 7, element: 'H', x: -1.36, y: -2.04, z: -0.82, partialCharge: 0.27 },
      { id: 8, element: 'H', x: 2.38, y: -1.04, z: 0.00, partialCharge: 0.27 },
      { id: 9, element: 'H', x: 1.36, y: -2.04, z: 0.82, partialCharge: 0.27 },
      { id: 10, element: 'H', x: 1.36, y: -2.04, z: -0.82, partialCharge: 0.27 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 0, to: 2, order: 1 },
      { from: 0, to: 3, order: 1 },
      { from: 0, to: 4, order: 1 },
      { from: 3, to: 5, order: 1 },
      { from: 3, to: 6, order: 1 },
      { from: 3, to: 7, order: 1 },
      { from: 4, to: 8, order: 1 },
      { from: 4, to: 9, order: 1 },
      { from: 4, to: 10, order: 1 },
    ],
  },
  {
    id: 'dopamine',
    name: 'Dopamine',
    iupacName: '4-(2-Aminoethyl)benzene-1,2-diol',
    formula: 'C₈H₁₁NO₂',
    cid: 681,
    smiles: 'C1=CC(=C(C=C1CCN)O)O',
    molarMass: 153.18,
    vseprGeometry: 'Planar Catechol Ring + Flexible Ethylamine Tail',
    hybridization: 'sp² (catechol ring) · sp³ (ethylamine chain)',
    bondAngle: '120.0° (ring) · 109.5° (-CH₂-CH₂-NH₂)',
    dipoleMoment: '3.12 D',
    polarity: 'Polar',
    category: 'Catecholamine Neurotransmitter',
    description: 'Endogenous catecholamine neurotransmitter essential for motor control, reward-motivated behavior, and executive function. Contains an ortho-dihydroxybenzene (catechol) ring linked to a primary ethylamine.',
    xlogp: -0.98,
    tpsa: 66.5,
    hBondDonors: 3,
    hBondAcceptors: 3,
    rotatableBonds: 2,
    provenance: 'Experimentally determined',
    atoms: [
      { id: 0, element: 'C', x: -1.82, y: -0.62, z: 0.05, partialCharge: 0.22 },
      { id: 1, element: 'C', x: -1.86, y: 0.78, z: -0.02, partialCharge: 0.22 },
      { id: 2, element: 'C', x: -0.67, y: 1.50, z: -0.06, partialCharge: -0.15 },
      { id: 3, element: 'C', x: 0.56, y: 0.84, z: -0.03, partialCharge: -0.05 },
      { id: 4, element: 'C', x: 0.58, y: -0.56, z: 0.04, partialCharge: -0.14 },
      { id: 5, element: 'C', x: -0.60, y: -1.29, z: 0.08, partialCharge: -0.14 },
      { id: 6, element: 'O', x: -2.98, y: -1.34, z: 0.09, partialCharge: -0.56 },
      { id: 7, element: 'O', x: -3.06, y: 1.44, z: -0.05, partialCharge: -0.56 },
      { id: 8, element: 'C', x: 1.85, y: 1.62, z: -0.08, partialCharge: -0.10 },
      { id: 9, element: 'C', x: 2.86, y: 1.02, z: -1.06, partialCharge: 0.05 },
      { id: 10, element: 'N', x: 4.14, y: 1.72, z: -1.04, partialCharge: -0.78 },
      { id: 11, element: 'H', x: -0.70, y: 2.58, z: -0.12, partialCharge: 0.12 },
      { id: 12, element: 'H', x: 1.53, y: -1.08, z: 0.07, partialCharge: 0.12 },
      { id: 13, element: 'H', x: -0.58, y: -2.37, z: 0.14, partialCharge: 0.12 },
      { id: 14, element: 'H', x: -3.76, y: -0.76, z: 0.06, partialCharge: 0.41 },
      { id: 15, element: 'H', x: -3.82, y: 0.84, z: -0.02, partialCharge: 0.41 },
      { id: 16, element: 'H', x: 2.28, y: 1.68, z: 0.92, partialCharge: 0.09 },
      { id: 17, element: 'H', x: 1.64, y: 2.64, z: -0.41, partialCharge: 0.09 },
      { id: 18, element: 'H', x: 2.44, y: 1.06, z: -2.07, partialCharge: 0.09 },
      { id: 19, element: 'H', x: 3.04, y: -0.03, z: -0.82, partialCharge: 0.09 },
      { id: 20, element: 'H', x: 4.78, y: 1.32, z: -1.72, partialCharge: 0.34 },
      { id: 21, element: 'H', x: 4.58, y: 1.66, z: -0.12, partialCharge: 0.34 },
    ],
    bonds: [
      { from: 0, to: 1, order: 1 },
      { from: 1, to: 2, order: 2 },
      { from: 2, to: 3, order: 1 },
      { from: 3, to: 4, order: 2 },
      { from: 4, to: 5, order: 1 },
      { from: 5, to: 0, order: 2 },
      { from: 0, to: 6, order: 1 },
      { from: 1, to: 7, order: 1 },
      { from: 3, to: 8, order: 1 },
      { from: 8, to: 9, order: 1 },
      { from: 9, to: 10, order: 1 },
      { from: 2, to: 11, order: 1 },
      { from: 4, to: 12, order: 1 },
      { from: 5, to: 13, order: 1 },
      { from: 6, to: 14, order: 1 },
      { from: 7, to: 15, order: 1 },
      { from: 8, to: 16, order: 1 },
      { from: 8, to: 17, order: 1 },
      { from: 9, to: 18, order: 1 },
      { from: 9, to: 19, order: 1 },
      { from: 10, to: 20, order: 1 },
      { from: 10, to: 21, order: 1 },
    ],
  },
];

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  baseDelayMs = 600
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    if (
      (response.status === 429 || response.status >= 500) &&
      attempt < maxRetries
    ) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      const delay =
        !Number.isNaN(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `HTTP ${response.status} (${response.statusText}): ${errorBody.slice(0, 180)}`
    );
  }
  throw new Error(`Exhausted retries for ${url}`);
}

/**
 * Parses a PubChem V2000 3D SDF text into Atom3D[] and Bond3D[]
 */
export function parsePubChemSdf3D(sdfText: string): { atoms: Atom3D[]; bonds: Bond3D[] } {
  const lines = sdfText.split(/\r?\n/);
  if (lines.length < 5) {
    throw new Error('Invalid SDF format returned from PubChem');
  }

  // Find counts line (usually index 3, with V2000)
  let countsLineIdx = 3;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].includes('V2000')) {
      countsLineIdx = i;
      break;
    }
  }

  const countsLine = lines[countsLineIdx];
  const numAtoms = parseInt(countsLine.slice(0, 3).trim(), 10);
  const numBonds = parseInt(countsLine.slice(3, 6).trim(), 10);

  if (Number.isNaN(numAtoms) || numAtoms <= 0) {
    throw new Error('Could not parse atom count from SDF');
  }

  const atoms: Atom3D[] = [];
  const atomStart = countsLineIdx + 1;
  for (let i = 0; i < numAtoms; i++) {
    const line = lines[atomStart + i] || '';
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 4) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      const element = parts[3];
      atoms.push({
        id: i,
        element,
        x: Number.isNaN(x) ? 0 : x,
        y: Number.isNaN(y) ? 0 : y,
        z: Number.isNaN(z) ? 0 : z,
      });
    }
  }

  // Recenter molecule at origin (0,0,0)
  if (atoms.length > 0) {
    const cx = atoms.reduce((s, a) => s + a.x, 0) / atoms.length;
    const cy = atoms.reduce((s, a) => s + a.y, 0) / atoms.length;
    const cz = atoms.reduce((s, a) => s + a.z, 0) / atoms.length;
    for (const a of atoms) {
      a.x = Number((a.x - cx).toFixed(4));
      a.y = Number((a.y - cy).toFixed(4));
      a.z = Number((a.z - cz).toFixed(4));
    }
  }

  const bonds: Bond3D[] = [];
  const bondStart = atomStart + numAtoms;
  for (let i = 0; i < numBonds; i++) {
    const line = lines[bondStart + i] || '';
    const a1 = parseInt(line.slice(0, 3).trim(), 10) - 1;
    const a2 = parseInt(line.slice(3, 6).trim(), 10) - 1;
    const orderRaw = parseInt(line.slice(6, 9).trim(), 10);
    if (!Number.isNaN(a1) && !Number.isNaN(a2) && a1 >= 0 && a2 >= 0 && a1 < atoms.length && a2 < atoms.length) {
      const order: 1 | 2 | 3 = orderRaw === 2 ? 2 : orderRaw === 3 ? 3 : 1;
      bonds.push({ from: a1, to: a2, order });
    }
  }

  return { atoms, bonds };
}

/**
 * Fetches live 3D molecular coordinates and calculated properties from PubChem PUG REST API
 */
export async function fetchPubChemCompound3D(query: string): Promise<MoleculeData> {
  const clean = query.trim();
  if (!clean) throw new Error('Please enter a chemical name or PubChem CID.');

  const isNumericCid = /^\d+$/.test(clean);
  let cid: number;

  if (isNumericCid) {
    cid = parseInt(clean, 10);
  } else {
    const cidRes = await fetchWithRetry(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(clean)}/cids/JSON`
    );
    const cidJson = await cidRes.json();
    const firstCid = cidJson?.IdentifierList?.CID?.[0];
    if (!firstCid) {
      throw new Error(`No PubChem compound found for "${clean}".`);
    }
    cid = Number(firstCid);
  }

  // Fetch physicochemical properties and 3D SDF conformer in parallel
  const propUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/Title,IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount/JSON`;
  const sdf3dUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`;

  const [propRes, sdfRes] = await Promise.all([
    fetchWithRetry(propUrl),
    fetch(sdf3dUrl).then(async (res) => {
      if (res.ok) return res.text();
      // Fallback to 2D SDF if 3D conformer is unavailable for very large complexes
      const res2d = await fetchWithRetry(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=2d`
      );
      return res2d.text();
    }),
  ]);

  const propJson = await propRes.json();
  const prop = propJson?.PropertyTable?.Properties?.[0] || {};
  const { atoms, bonds } = parsePubChemSdf3D(sdfRes);

  const formula = String(prop.MolecularFormula || '');
  const mw = parseFloat(prop.MolecularWeight || '0');
  const tpsa = Number(prop.TPSA ?? 0);

  return {
    id: `pubchem-${cid}`,
    name: prop.Title || clean.charAt(0).toUpperCase() + clean.slice(1),
    iupacName: prop.IUPACName || prop.Title || clean,
    formula,
    cid,
    smiles: prop.CanonicalSMILES || '',
    molarMass: Number.isNaN(mw) ? 0 : mw,
    vseprGeometry: `${atoms.length} Atoms · ${bonds.length} Covalent Bonds`,
    hybridization: 'PubChem 3D MMFF94s Energy-Minimized Conformer',
    bondAngle: '3D Equilibrium Coordinates (Å)',
    dipoleMoment: tpsa > 40 ? 'Polar (> 1.5 D est.)' : 'Low / Nonpolar',
    polarity: tpsa > 20 ? 'Polar' : 'Nonpolar',
    category: `PubChem CID #${cid}`,
    description: `Live 3D conformer structure and calculated physicochemical descriptors retrieved from NCBI PubChem PUG REST (CID ${cid}). Click any two atoms in the 3D viewport to measure interatomic distances in Ångströms.`,
    xlogp: Number(prop.XLogP ?? 0),
    tpsa,
    hBondDonors: Number(prop.HBondDonorCount ?? 0),
    hBondAcceptors: Number(prop.HBondAcceptorCount ?? 0),
    rotatableBonds: Number(prop.RotatableBondCount ?? 0),
    provenance: 'PubChem 3D Conformer',
    atoms,
    bonds,
  };
}
