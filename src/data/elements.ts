export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'reactive-nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  group: number; // 1-18, or 0 for f-block
  period: number; // 1-7
  gridRow: number; // 1-10 for visual grid (8 is gap, 9 is Lanthanides, 10 is Actinides)
  gridCol: number; // 1-18
  block: 's' | 'p' | 'd' | 'f';
  electronConfig: string;
  shells: number[];
  electronegativity: number | null; // Pauling scale
  atomicRadius: number | null; // pm (empirical/calculated)
  ionizationEnergy: number | null; // kJ/mol (1st ionization)
  density: number | null; // g/cm³
  meltingPoint: number | null; // K
  boilingPoint: number | null; // K
  standardState: 'Solid' | 'Liquid' | 'Gas' | 'Synthetic';
  oxidationStates: string;
  cpkColor: string;
  discoveredBy: string;
  discoveryYear: string;
  history: string;
  applications: string[];
}

export const CATEGORY_META: Record<
  ElementCategory,
  { label: string; bg: string; border: string; text: string; hex: string }
> = {
  'alkali-metal': {
    label: 'Alkali Metal',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    text: 'text-rose-900',
    hex: '#e11d48',
  },
  'alkaline-earth': {
    label: 'Alkaline Earth',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-900',
    hex: '#ea580c',
  },
  'transition-metal': {
    label: 'Transition Metal',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-900',
    hex: '#0284c7',
  },
  'post-transition-metal': {
    label: 'Post-Transition Metal',
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    text: 'text-teal-900',
    hex: '#0d9488',
  },
  metalloid: {
    label: 'Metalloid',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    hex: '#d97706',
  },
  'reactive-nonmetal': {
    label: 'Reactive Nonmetal',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    hex: '#059669',
  },
  halogen: {
    label: 'Halogen',
    bg: 'bg-cyan-50',
    border: 'border-cyan-300',
    text: 'text-cyan-900',
    hex: '#0891b2',
  },
  'noble-gas': {
    label: 'Noble Gas',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    text: 'text-indigo-900',
    hex: '#4f46e5',
  },
  lanthanide: {
    label: 'Lanthanide',
    bg: 'bg-violet-50',
    border: 'border-violet-300',
    text: 'text-violet-900',
    hex: '#7c3aed',
  },
  actinide: {
    label: 'Actinide',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-300',
    text: 'text-fuchsia-900',
    hex: '#c026d3',
  },
};

// Compact tuple format for all 118 elements:
// [number, symbol, name, mass, category, group, period, row, col, block, config, shells, en, radius, ie, density, mp, bp, state, ox, cpk, discoverer, year, history, apps]
type RawElem = [
  number,
  string,
  string,
  number,
  ElementCategory,
  number,
  number,
  number,
  number,
  's' | 'p' | 'd' | 'f',
  string,
  number[],
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  'Solid' | 'Liquid' | 'Gas' | 'Synthetic',
  string,
  string,
  string,
  string,
  string,
  string[]
];

const RAW_ELEMENTS: RawElem[] = [
  [1, 'H', 'Hydrogen', 1.008, 'reactive-nonmetal', 1, 1, 1, 1, 's', '1s¹', [1], 2.20, 53, 1312, 0.00008988, 13.99, 20.27, 'Gas', '-1, +1', '#FFFFFF', 'Henry Cavendish', '1766', 'Isolated by Henry Cavendish as "inflammable air" and named by Antoine Lavoisier from the Greek hydro + genes ("water-forming"). Most abundant baryonic element in the universe.', ['Ammonia synthesis (Haber-Bosch)', 'PEM fuel cells', 'Rocket propellant']],
  [2, 'He', 'Helium', 4.0026, 'noble-gas', 18, 1, 1, 18, 's', '1s²', [2], null, 31, 2372, 0.0001785, 0.95, 4.22, 'Gas', '0', '#D9FFFF', 'Pierre Janssen & Norman Lockyer', '1868', 'First detected as an unknown yellow spectral line in sunlight during a solar eclipse in 1868 before being isolated on Earth from cleveite ore by William Ramsay in 1895.', ['MRI superconducting magnet cryogenics', 'Deep-sea breathing mixtures', 'Inert shielding gas']],
  [3, 'Li', 'Lithium', 6.94, 'alkali-metal', 1, 2, 2, 1, 's', '[He] 2s¹', [2, 1], 0.98, 167, 520, 0.534, 453.65, 1603, 'Solid', '+1', '#CC80FF', 'Johan August Arfwedson', '1817', 'Discovered in petalite ore by Arfwedson in Berzelius’s Stockholm laboratory. Named from Greek lithos ("stone") because it was found in mineral rock rather than plant ash.', ['Lithium-ion rechargeable batteries', 'Aerospace aluminum alloys', 'Mood-stabilizing pharmacology']],
  [4, 'Be', 'Beryllium', 9.0122, 'alkaline-earth', 2, 2, 2, 2, 's', '[He] 2s²', [2, 2], 1.57, 112, 899, 1.85, 1560, 2742, 'Solid', '+2', '#C2FF00', 'Louis Nicolas Vauquelin', '1798', 'Identified by Vauquelin as an oxide in beryl and emeralds; isolated as pure metal independently by Friedrich Wöhler and Antoine Bussy in 1828.', ['James Webb Space Telescope mirrors', 'X-ray tube windows', 'Non-sparking copper alloys']],
  [5, 'B', 'Boron', 10.81, 'metalloid', 13, 2, 2, 13, 'p', '[He] 2s² 2p¹', [2, 3], 2.04, 87, 801, 2.34, 2349, 4200, 'Solid', '+3', '#FFB5B5', 'Joseph Louis Gay-Lussac & Humphry Davy', '1808', 'Derived from the Arabic buraq (borax). Produced via cosmic ray spallation rather than stellar nucleosynthesis.', ['Borosilicate laboratory glassware (Pyrex)', 'Neodymium-iron-boron magnets', 'p-type silicon semiconductor doping']],
  [6, 'C', 'Carbon', 12.011, 'reactive-nonmetal', 14, 2, 2, 14, 'p', '[He] 2s² 2p²', [2, 4], 2.55, 67, 1086, 2.267, 3800, 4300, 'Solid', '-4, -3, -2, -1, 0, +1, +2, +3, +4', '#334155', 'Known since antiquity', 'Prehistoric', 'Known since prehistoric times as charcoal and soot; Lavoisier recognized diamond and graphite as allotropes of carbon in 1772–1789. Tetravalent backbone of all organic chemistry.', ['Organic biochemistry & polymers', 'Carbon fiber composites & graphene', 'Radiocarbon-14 dating']],
  [7, 'N', 'Nitrogen', 14.007, 'reactive-nonmetal', 15, 2, 2, 15, 'p', '[He] 2s² 2p³', [2, 5], 3.04, 56, 1402, 0.001251, 63.15, 77.36, 'Gas', '-3, +1, +2, +3, +4, +5', '#3050F8', 'Daniel Rutherford', '1772', 'Isolated by Scottish physician Daniel Rutherford as "noxious air" after removing oxygen and carbon dioxide from a sealed bell jar.', ['Agricultural fertilizers (NH₃, nitrates)', 'Cryogenic preservation (LN₂)', 'Amino acids & nucleic acids']],
  [8, 'O', 'Oxygen', 15.999, 'reactive-nonmetal', 16, 2, 2, 16, 'p', '[He] 2s² 2p⁴', [2, 6], 3.44, 48, 1314, 0.001429, 54.36, 90.20, 'Gas', '-2, -1, +2', '#FF0D0D', 'Carl Wilhelm Scheele & Joseph Priestley', '1774', 'Prepared by Scheele (1771) and Priestley (1774) by heating mercuric oxide; Antoine Lavoisier overturned phlogiston theory by proving its role in combustion and respiration.', ['Cellular aerobic respiration', 'Steelmaking (basic oxygen process)', 'Medical life support & oxidizers']],
  [9, 'F', 'Fluorine', 18.998, 'halogen', 17, 2, 2, 17, 'p', '[He] 2s² 2p⁵', [2, 7], 3.98, 42, 1681, 0.001696, 53.53, 85.03, 'Gas', '-1', '#90E050', 'Henri Moissan', '1886', 'The most electronegative element. After decades of hazardous attempts by early chemists ("fluorine martyrs"), Henri Moissan isolated F₂ gas via low-temperature electrolysis in 1886, earning the 1906 Nobel Prize.', ['PTFE (Teflon) fluoropolymers', 'UF₆ nuclear fuel enrichment', 'Dental enamel fluoridation & pharmaceuticals']],
  [10, 'Ne', 'Neon', 20.180, 'noble-gas', 18, 2, 2, 18, 'p', '[He] 2s² 2p⁶', [2, 8], null, 38, 2081, 0.0008999, 24.56, 27.07, 'Gas', '0', '#B3E3F5', 'William Ramsay & Morris Travers', '1898', 'Discovered in London via fractional distillation of liquid air; named from Greek neos ("new").', ['High-voltage gas-discharge lighting', 'Helium-neon metrology lasers', 'Cryogenic refrigeration']],
  [11, 'Na', 'Sodium', 22.990, 'alkali-metal', 1, 3, 3, 1, 's', '[Ne] 3s¹', [2, 8, 1], 0.93, 190, 496, 0.968, 370.87, 1156, 'Solid', '+1', '#AB5CF2', 'Humphry Davy', '1807', 'Isolated by Humphry Davy in 1807 via electrolysis of molten sodium hydroxide (caustic soda). Symbol Na comes from Neo-Latin natrium.', ['Action potential nerve signaling', 'Chemical synthesis (NaOH, Na₂CO₃)', 'Liquid metal fast reactor coolant']],
  [12, 'Mg', 'Magnesium', 24.305, 'alkaline-earth', 2, 3, 3, 2, 's', '[Ne] 3s²', [2, 8, 2], 1.31, 145, 738, 1.738, 923, 1363, 'Solid', '+2', '#8AFF00', 'Joseph Black & Humphry Davy', '1755', 'Recognized as an element by Joseph Black in 1755 and isolated Electrolytically by Humphry Davy in 1808. Central coordination ion of chlorophyll.', ['Chlorophyll photosynthesis center', 'Grignard organometallic reagents', 'Ultralight automotive/aerospace alloys']],
  [13, 'Al', 'Aluminum', 26.982, 'post-transition-metal', 13, 3, 3, 13, 'p', '[Ne] 3s² 3p¹', [2, 8, 3], 1.61, 118, 578, 2.70, 933.47, 2792, 'Solid', '+3', '#BFA6A6', 'Hans Christian Ørsted', '1825', 'Once more precious than gold until Charles Martin Hall and Paul Héroult independently invented electrolytic reduction in molten cryolite in 1886.', ['Aircraft & structural engineering', 'High-voltage power transmission lines', 'Recyclable packaging & heat sinks']],
  [14, 'Si', 'Silicon', 28.085, 'metalloid', 14, 3, 3, 14, 'p', '[Ne] 3s² 3p²', [2, 8, 4], 1.90, 111, 787, 2.329, 1687, 3538, 'Solid', '-4, +2, +4', '#F0C8A0', 'Jöns Jacob Berzelius', '1824', 'Purified by Berzelius in 1824. Second most abundant element in Earth’s crust after oxygen, forming silicate minerals and powering modern microelectronics.', ['CMOS semiconductor integrated circuits', 'Photovoltaic solar cells', 'Silicone elastomers & optical glass']],
  [15, 'P', 'Phosphorus', 30.974, 'reactive-nonmetal', 15, 3, 3, 15, 'p', '[Ne] 3s² 3p³', [2, 8, 5], 2.19, 98, 1012, 1.823, 317.3, 553.7, 'Solid', '-3, +3, +5', '#FF8000', 'Hennig Brand', '1669', 'First element with a recorded discoverer: Hamburg alchemist Hennig Brand distilled it from urine in 1669 and named it phosphorus ("light-bearer") for its chemiluminescence.', ['ATP bioenergetics & DNA/RNA backbone', 'Phosphate agricultural fertilizers', 'Safety match striking surfaces']],
  [16, 'S', 'Sulfur', 32.06, 'reactive-nonmetal', 16, 3, 3, 16, 'p', '[Ne] 3s² 3p⁴', [2, 8, 6], 2.58, 88, 1000, 2.07, 388.36, 717.8, 'Solid', '-2, +2, +4, +6', '#FFFF30', 'Known since antiquity', 'Prehistoric', 'Known in ancient texts as brimstone; Antoine Lavoisier convinced the scientific community in 1777 that sulfur is a fundamental chemical element rather than a compound.', ['Sulfuric acid (H₂SO₄) industrial production', 'Rubber vulcanization cross-linking', 'Cysteine & methionine disulfide bridges']],
  [17, 'Cl', 'Chlorine', 35.45, 'halogen', 17, 3, 3, 17, 'p', '[Ne] 3s² 3p⁵', [2, 8, 7], 3.16, 79, 1251, 0.003214, 171.6, 239.11, 'Gas', '-1, +1, +3, +5, +7', '#1FF01F', 'Carl Wilhelm Scheele', '1774', 'Produced by Scheele in 1774 by reacting MnO₂ with HCl; Humphry Davy proved in 1810 that it was an element and named it from Greek chloros ("pale green").', ['Municipal water sanitation', 'Polyvinyl chloride (PVC) polymers', 'Hydrochloric acid & pharmaceutical synthesis']],
  [18, 'Ar', 'Argon', 39.948, 'noble-gas', 18, 3, 3, 18, 'p', '[Ne] 3s² 3p⁶', [2, 8, 8], null, 71, 1521, 0.001784, 83.80, 87.30, 'Gas', '0', '#80D1E3', 'Lord Rayleigh & William Ramsay', '1894', 'Discovered when Rayleigh noticed nitrogen extracted from air was slightly denser than nitrogen from chemical compounds. Named from Greek argos ("inactive").', ['Schlenk line & glovebox inert atmospheres', 'GTAW / MIG arc welding shielding gas', 'Double-pane insulated window fill']],
  [19, 'K', 'Potassium', 39.098, 'alkali-metal', 1, 4, 4, 1, 's', '[Ar] 4s¹', [2, 8, 8, 1], 0.82, 243, 419, 0.862, 336.53, 1032, 'Solid', '+1', '#8F40D4', 'Humphry Davy', '1807', 'First metal isolated by electrolysis (molten potash, KOH) by Humphry Davy in 1807; symbol K derives from kalium (alkali).', ['Cellular Na⁺/K⁺-ATPase membrane potential', 'NPK agricultural potash fertilizers', 'Potassium superoxide rebreathers']],
  [20, 'Ca', 'Calcium', 40.078, 'alkaline-earth', 2, 4, 4, 2, 's', '[Ar] 4s²', [2, 8, 8, 2], 1.00, 194, 590, 1.55, 1115, 1757, 'Solid', '+2', '#3DFF00', 'Humphry Davy', '1808', 'Isolated by Davy in 1808 via electrolysis of lime and mercuric oxide. Named from Latin calx ("lime").', ['Hydroxyapatite bone & tooth mineral matrix', 'Portland cement & mortar chemistry', 'Intracellular secondary messenger signaling']],
  [21, 'Sc', 'Scandium', 44.956, 'transition-metal', 3, 4, 4, 3, 'd', '[Ar] 3d¹ 4s²', [2, 8, 9, 2], 1.36, 184, 633, 2.985, 1814, 3109, 'Solid', '+3', '#E6E6E6', 'Lars Fredrik Nilson', '1879', 'Predicted by Mendeleev in 1869 as "ekaboron" and discovered in euxenite and gadolinite minerals in Scandinavia by Nilson.', ['Aluminum-scandium aerospace frames', 'High-intensity metal halide stadium lamps', 'Solid oxide fuel cell electrolytes']],
  [22, 'Ti', 'Titanium', 47.867, 'transition-metal', 4, 4, 4, 4, 'd', '[Ar] 3d² 4s²', [2, 8, 10, 2], 1.54, 176, 659, 4.506, 1941, 3560, 'Solid', '+2, +3, +4', '#BFC2C7', 'William Gregor', '1791', 'Discovered in ilmenite sand in Cornwall by William Gregor and named after the mythological Titans by Martin Heinrich Klaproth.', ['Biocompatible orthopedic & dental implants', 'Jet turbine blades & airframes', 'TiO₂ high-refractive white pigment & photocatalyst']],
  [23, 'V', 'Vanadium', 50.942, 'transition-metal', 5, 4, 4, 5, 'd', '[Ar] 3d³ 4s²', [2, 8, 11, 2], 1.63, 171, 651, 6.11, 2183, 3680, 'Solid', '+2, +3, +4, +5', '#A6A6AB', 'Andrés Manuel del Río', '1801', 'Discovered in Mexico by del Río (1801) and rediscovered by Nils Gabriel Sefström (1830), who named it after Vanadís (Freyja) because of its vibrantly colored oxidation states (+2 violet, +3 green, +4 blue, +5 yellow).', ['Vanadium redox flow grid batteries', 'Chrome-vanadium high-strength tool steel', 'V₂O₅ contact process catalyst for H₂SO₄']],
  [24, 'Cr', 'Chromium', 51.996, 'transition-metal', 6, 4, 4, 6, 'd', '[Ar] 3d⁵ 4s¹', [2, 8, 13, 1], 1.66, 166, 653, 7.19, 2180, 2944, 'Solid', '+2, +3, +6', '#8A99C7', 'Louis Nicolas Vauquelin', '1797', 'Extracted from Siberian crocoite (PbCrO₄) by Vauquelin; exhibits an anomalous [Ar] 3d⁵ 4s¹ ground-state electron configuration due to half-filled d-subshell exchange stabilization.', ['Passivating oxide layer in stainless steel', 'Chrome electroplating & anodizing', 'Ruby and emerald chromophore dopant']],
  [25, 'Mn', 'Manganese', 54.938, 'transition-metal', 7, 4, 4, 7, 'd', '[Ar] 3d⁵ 4s²', [2, 8, 13, 2], 1.55, 161, 717, 7.21, 1519, 2334, 'Solid', '+2, +3, +4, +6, +7', '#9C7AC7', 'Johan Gottlieb Gahn', '1774', 'Isolated by Gahn in 1774 by reducing manganese dioxide with carbon. Essential cofactor in the oxygen-evolving complex of Photosystem II.', ['Photosystem II water-splitting cluster (Mn₄CaO₅)', 'Austenitic Hadfield impact steel', 'KMnO₄ analytical redox titrant']],
  [26, 'Fe', 'Iron', 55.845, 'transition-metal', 8, 4, 4, 8, 'd', '[Ar] 3d⁶ 4s²', [2, 8, 14, 2], 1.83, 156, 762, 7.874, 1811, 3134, 'Solid', '+2, +3', '#E06633', 'Known since antiquity', 'Prehistoric', 'Smelted since the Iron Age (~1200 BCE) and used earlier from meteoritic iron. Fe-56 has one of the highest nuclear binding energies per nucleon, marking the endpoint of exothermic stellar fusion.', ['Hemoglobin & myoglobin oxygen transport', 'Structural carbon and alloy steels', 'Haber-Bosch ammonia synthesis catalyst']],
  [27, 'Co', 'Cobalt', 58.933, 'transition-metal', 9, 4, 4, 9, 'd', '[Ar] 3d⁷ 4s²', [2, 8, 15, 2], 1.88, 152, 760, 8.90, 1768, 3200, 'Solid', '+2, +3', '#F090A0', 'Georg Brandt', '1735', 'Isolated by Swedish chemist Georg Brandt around 1735, becoming the first new metal discovered since antiquity. Named from German Kobold ("goblin" ore).', ['Vitamin B₁₂ (cobalamin) corrin ring', 'NMC & LCO lithium-ion battery cathodes', 'Samarium-cobalt & Alnico permanent magnets']],
  [28, 'Ni', 'Nickel', 58.693, 'transition-metal', 10, 4, 4, 10, 'd', '[Ar] 3d⁸ 4s²', [2, 8, 16, 2], 1.91, 149, 737, 8.908, 1728, 3186, 'Solid', '+2, +3', '#50D050', 'Axel Fredrik Cronstedt', '1751', 'Isolated by Cronstedt from niccolite (Kupfernickel) in 1751 in Sweden.', ['Raney nickel hydrogenation catalyst', 'Inconel & Monel corrosion-resistant superalloys', 'Austenitic stainless steel & EV batteries']],
  [29, 'Cu', 'Copper', 63.546, 'transition-metal', 11, 4, 4, 11, 'd', '[Ar] 3d¹⁰ 4s¹', [2, 8, 18, 1], 1.90, 145, 745, 8.96, 1357.77, 2835, 'Solid', '+1, +2', '#C88033', 'Known since antiquity', 'Prehistoric', 'One of the earliest native metals worked by humans (>9000 BCE); named from Cyprium Aes ("metal of Cyprus"). Exhibits a filled 3d¹⁰ subshell at the expense of 4s¹.', ['Electrical wiring, motors & PCB interconnects', 'Bronze (Cu-Sn) & Brass (Cu-Zn) alloys', 'Cytochrome c oxidase & hemocyanin proteins']],
  [30, 'Zn', 'Zinc', 65.38, 'transition-metal', 12, 4, 4, 12, 'd', '[Ar] 3d¹⁰ 4s²', [2, 8, 18, 2], 1.65, 142, 906, 7.14, 692.68, 1180, 'Solid', '+2', '#7D80B0', 'Andreas Sigismund Marggraf', '1746', 'Smelted in India by the 12th century and isolated in Europe by Marggraf in 1746.', ['Hot-dip galvanization corrosion protection', 'Carbonic anhydrase & zinc-finger DNA proteins', 'Zinc-air & alkaline battery anodes']],
  [31, 'Ga', 'Gallium', 69.723, 'post-transition-metal', 13, 4, 4, 13, 'p', '[Ar] 3d¹⁰ 4s² 4p¹', [2, 8, 18, 3], 1.81, 136, 579, 5.91, 302.91, 2673, 'Solid', '+3', '#C28F8F', 'Paul-Émile Lecoq de Boisbaudran', '1875', 'Predicted by Mendeleev as "eka-aluminum" and discovered spectroscopically by Lecoq de Boisbaudran in 1875. Melts just above room temperature (29.76 °C) in the palm of a hand.', ['Gallium nitride (GaN) blue LEDs & power electronics', 'Gallium arsenide (GaAs) RF & solar wafers', 'Galinstan non-toxic liquid metal thermometers']],
  [32, 'Ge', 'Germanium', 72.630, 'metalloid', 14, 4, 4, 14, 'p', '[Ar] 3d¹⁰ 4s² 4p²', [2, 8, 18, 4], 2.01, 125, 762, 5.323, 1211.4, 3106, 'Solid', '+2, +4', '#668F8F', 'Clemens Winkler', '1886', 'Predicted by Mendeleev as "eka-silicon" in 1869; Winkler’s 1886 isolation in argyrodite confirmed Mendeleev’s periodic law with stunning precision.', ['Fiber-optic core refractive index dopant', 'Infrared night-vision thermal optics', 'SiGe high-speed heterojunction transistors']],
  [33, 'As', 'Arsenic', 74.922, 'metalloid', 15, 4, 4, 15, 'p', '[Ar] 3d¹⁰ 4s² 4p³', [2, 8, 18, 5], 2.18, 114, 947, 5.727, 1090, 887, 'Solid', '-3, +3, +5', '#BD80E3', 'Albertus Magnus', '1250', 'Isolated by Albertus Magnus around 1250 CE by heating soap with orpiment (As₂S₃). Sublimes directly from solid to vapor at atmospheric pressure.', ['Gallium arsenide (GaAs) optoelectronics', 'Arsenic trioxide (As₂O₃) APL leukemia therapy', 'Lead-acid battery grid strengthening']],
  [34, 'Se', 'Selenium', 78.971, 'reactive-nonmetal', 16, 4, 4, 16, 'p', '[Ar] 3d¹⁰ 4s² 4p⁴', [2, 8, 18, 6], 2.55, 103, 941, 4.81, 494, 958, 'Solid', '-2, +4, +6', '#FFA100', 'Jöns Jacob Berzelius', '1817', 'Discovered by Berzelius in sulfuric acid chamber sludge and named after Selene, Greek goddess of the Moon.', ['Glutathione peroxidase antioxidant selenoenzymes', 'Photoconductive X-ray detectors', 'Ruby-red architectural glass decolorizer/tint']],
  [35, 'Br', 'Bromine', 79.904, 'halogen', 17, 4, 4, 17, 'p', '[Ar] 3d¹⁰ 4s² 4p⁵', [2, 8, 18, 7], 2.96, 94, 1140, 3.1028, 265.8, 332.0, 'Liquid', '-1, +1, +3, +5', '#A62929', 'Antoine Jérôme Balard & Carl Jacob Löwig', '1826', 'One of only two elements (with mercury) that is liquid at standard temperature and pressure. Isolated from Mediterranean salt marsh brines.', ['Organobromine chemical synthesis intermediates', 'Brominated flame retardants', 'Silver bromide photographic emulsions']],
  [36, 'Kr', 'Krypton', 83.798, 'noble-gas', 18, 4, 4, 18, 'p', '[Ar] 3d¹⁰ 4s² 4p⁶', [2, 8, 18, 8], 3.00, 88, 1351, 0.003749, 115.78, 119.93, 'Gas', '0, +2', '#5CB8D1', 'William Ramsay & Morris Travers', '1898', 'Isolated from liquid air residue in 1898; from 1960 to 1983, the international meter was defined by the orange-red emission line of Krypton-86.', ['KrF excimer photolithography lasers (248 nm)', 'High-efficiency insulated glazing', 'Spacecraft Hall-effect ion thrusters']],
  [37, 'Rb', 'Rubidium', 85.468, 'alkali-metal', 1, 5, 5, 1, 's', '[Kr] 5s¹', [2, 8, 18, 8, 1], 0.82, 265, 403, 1.532, 312.45, 961, 'Solid', '+1', '#702EB0', 'Robert Bunsen & Gustav Kirchhoff', '1861', 'Discovered spectroscopically in lepidolite by Bunsen and Kirchhoff; named from Latin rubidus ("deepest red") for its bright red emission lines.', ['Rubidium-87 atomic clocks (GPS precision)', 'Bose-Einstein condensate quantum experiments', 'Specialty aluminosilicate glass']],
  [38, 'Sr', 'Strontium', 87.62, 'alkaline-earth', 2, 5, 5, 2, 's', '[Kr] 5s²', [2, 8, 18, 8, 2], 0.95, 219, 549, 2.64, 1050, 1650, 'Solid', '+2', '#00FF00', 'Adair Crawford & Humphry Davy', '1790', 'Named after the Scottish village of Strontian where strontianite mineral was found in lead mines in 1790.', ['Crimson-red pyrotechnic salts (SrCO₃, Sr(NO₃)₂)', 'Optical lattice atomic clocks', 'Strontium ferrite permanent magnets']],
  [39, 'Y', 'Yttrium', 88.906, 'transition-metal', 3, 5, 5, 3, 'd', '[Kr] 4d¹ 5s²', [2, 8, 18, 9, 2], 1.22, 212, 600, 4.472, 1799, 3609, 'Solid', '+3', '#94FFFF', 'Johan Gadolin', '1794', 'First of the rare-earth elements discovered in gadolinite from the Ytterby quarry in Sweden—a single quarry that gave its name to four elements (Y, Tb, Er, Yb).', ['Nd:YAG solid-state surgical & industrial lasers', 'YBCO high-temperature superconductors', 'Yttria-stabilized zirconia (YSZ) thermal coatings']],
  [40, 'Zr', 'Zirconium', 91.224, 'transition-metal', 4, 5, 5, 4, 'd', '[Kr] 4d² 5s²', [2, 8, 18, 10, 2], 1.33, 206, 640, 6.52, 2128, 4682, 'Solid', '+4', '#94E0E0', 'Martin Heinrich Klaproth', '1789', 'Identified by Klaproth in zircon gems in 1789; its extraordinarily low thermal neutron capture cross-section makes it indispensable in nuclear engineering.', ['Zircaloy nuclear reactor fuel rod cladding', 'Zirconia (ZrO₂) dental crowns & ceramics', 'Ziegler-Natta metallocene polymerization catalysts']],
  [41, 'Nb', 'Niobium', 92.906, 'transition-metal', 5, 5, 5, 5, 'd', '[Kr] 4d⁴ 5s¹', [2, 8, 18, 12, 1], 1.6, 198, 652, 8.57, 2750, 5017, 'Solid', '+3, +5', '#73C2C9', 'Charles Hatchett', '1801', 'Discovered by Hatchett in columbite ore in 1801 (originally called columbium); renamed after Niobe, daughter of Tantalus, reflecting its chemical similarity to tantalum.', ['NbTi & Nb₃Sn superconducting magnets (LHC, MRI)', 'HSLA structural pipeline & bridge microalloying', 'Rocket thruster nozzles (Apollo Service Module)']],
  [42, 'Mo', 'Molybdenum', 95.95, 'transition-metal', 6, 5, 5, 6, 'd', '[Kr] 4d⁵ 5s¹', [2, 8, 18, 13, 1], 2.16, 190, 684, 10.28, 2896, 4912, 'Solid', '+2, +3, +4, +5, +6', '#54B5B5', 'Carl Wilhelm Scheele', '1778', 'Distinguished from graphite and lead ore (galena) by Scheele in 1778 and isolated by Peter Jacob Hjelm in 1781. Essential trace cofactor in biological nitrogenase.', ['Nitrogenase FeMo-cofactor biological N₂ fixation', 'Chromoly (41xx) high-temperature alloy steel', 'MoS₂ dry lubricant & hydrodesulfurization catalyst']],
  [43, 'Tc', 'Technetium', 98, 'transition-metal', 7, 5, 5, 7, 'd', '[Kr] 4d⁵ 5s²', [2, 8, 18, 13, 2], 1.9, 183, 702, 11.5, 2430, 4538, 'Synthetic', '+4, +7', '#3B9E9E', 'Carlo Perrier & Emilio Segrè', '1937', 'The lightest element with no stable isotopes. Predicted by Mendeleev as "eka-manganese" and first artificially produced in 1937 by bombarding molybdenum with deuterons.', ['⁹⁹ᵐTc SPECT nuclear medicine diagnostic imaging', 'Radiopharmaceutical myocardial & bone scans', 'Corrosion inhibitor in closed cooling systems']],
  [44, 'Ru', 'Ruthenium', 101.07, 'transition-metal', 8, 5, 5, 8, 'd', '[Kr] 4d⁷ 5s¹', [2, 8, 18, 15, 1], 2.2, 178, 710, 12.45, 2607, 4423, 'Solid', '+2, +3, +4, +8', '#248F8F', 'Karl Ernst Claus', '1844', 'Isolated from Ural platinum ore residues at Kazan University by Karl Ernst Claus in 1844.', ['Grubbs olefin metathesis catalysts (2005 Nobel)', 'Wear-resistant electrical contacts & chip resistors', 'Noyori asymmetric hydrogenation catalysis']],
  [45, 'Rh', 'Rhodium', 102.91, 'transition-metal', 9, 5, 5, 9, 'd', '[Kr] 4d⁸ 5s¹', [2, 8, 18, 16, 1], 2.28, 173, 720, 12.41, 2237, 3968, 'Solid', '+3', '#0A7D8C', 'William Hyde Wollaston', '1803', 'Discovered by Wollaston in crude platinum ore and named from Greek rhodon ("rose") after the rose-red color of its chloride salt solutions.', ['Three-way automotive catalytic converters (NOₓ reduction)', 'Monsanto/Cativa acetic acid carbonylation catalyst', 'Wilkinson’s homogeneous hydrogenation catalyst']],
  [46, 'Pd', 'Palladium', 106.42, 'transition-metal', 10, 5, 5, 10, 'd', '[Kr] 4d¹⁰', [2, 8, 18, 18], 2.20, 169, 804, 12.023, 1828.05, 3236, 'Solid', '+2, +4', '#006985', 'William Hyde Wollaston', '1803', 'Named after the asteroid Pallas; uniquely exhibits a completely filled [Kr] 4d¹⁰ ground state with zero 5s electrons and absorbs up to 900 times its own volume of hydrogen gas.', ['Suzuki, Heck & Negishi cross-coupling (2010 Nobel)', 'Hydrogen purification membranes & sensors', 'Catalytic converters & white gold alloys']],
  [47, 'Ag', 'Silver', 107.87, 'transition-metal', 11, 5, 5, 11, 'd', '[Kr] 4d¹⁰ 5s¹', [2, 8, 18, 18, 1], 1.93, 165, 731, 10.49, 1234.93, 2435, 'Solid', '+1', '#C0C0C0', 'Known since antiquity', 'Prehistoric', 'Possesses the highest electrical conductivity, thermal conductivity, and optical reflectivity of any metal on the periodic table.', ['Solar photovoltaic conductive silver pastes', 'Antimicrobial wound dressings & silver nanoparticles', 'High-reflectivity telescope mirrors & electronics']],
  [48, 'Cd', 'Cadmium', 112.41, 'transition-metal', 12, 5, 5, 12, 'd', '[Kr] 4d¹⁰ 5s²', [2, 8, 18, 18, 2], 1.69, 161, 868, 8.65, 594.22, 1040, 'Solid', '+2', '#FFD98F', 'Karl Samuel Leberecht Hermann & Friedrich Stromeyer', '1817', 'Discovered simultaneously in Germany in 1817 as a yellow impurity in zinc carbonate (calamine).', ['CdSe/ZnS quantum dot display nanocrystals', 'CdTe thin-film solar photovoltaics', 'Nuclear reactor thermal neutron control rods']],
  [49, 'In', 'Indium', 114.82, 'post-transition-metal', 13, 5, 5, 13, 'p', '[Kr] 4d¹⁰ 5s² 5p¹', [2, 8, 18, 18, 3], 1.78, 156, 558, 7.31, 429.75, 2345, 'Solid', '+3', '#A67573', 'Ferdinand Reich & Hieronymous Theodor Richter', '1863', 'Named after the brilliant indigo-blue spectral line that revealed its presence in zinc ores; emits a "tin cry" sound when bent due to crystal twinning.', ['Indium tin oxide (ITO) transparent touchscreens', 'Low-melting cryogenic vacuum seals & solders', 'InGaN & InP fiber-optic lasers']],
  [50, 'Sn', 'Tin', 118.71, 'post-transition-metal', 14, 5, 5, 14, 'p', '[Kr] 4d¹⁰ 5s² 5p²', [2, 8, 18, 18, 4], 1.96, 145, 709, 7.265, 505.08, 2875, 'Solid', '+2, +4', '#668080', 'Known since antiquity', 'Prehistoric', 'Alloyed with copper since ~3300 BCE to usher in the Bronze Age. Has 10 stable isotopes—the largest number of any element on the periodic table.', ['Lead-free electronic solder (Sn-Ag-Cu)', 'Float glass manufacturing molten tin bath', 'Bronze alloys & food-grade tinplate']],
  [51, 'Sb', 'Antimony', 121.76, 'metalloid', 15, 5, 5, 15, 'p', '[Kr] 4d¹⁰ 5s² 5p³', [2, 8, 18, 18, 5], 2.05, 133, 834, 6.697, 903.78, 1860, 'Solid', '-3, +3, +5', '#9E63B5', 'Known since antiquity', 'Prehistoric', 'Used as stibnite (Sb₂S₃) cosmetics in ancient Egypt and extensively described by Vannoccio Biringuccio in 1540.', ['Antimony trioxide flame-retardant synergist', 'Lead-antimony automotive battery plates', 'InSb infrared detectors & phase-change memory']],
  [52, 'Te', 'Tellurium', 127.60, 'metalloid', 16, 5, 5, 16, 'p', '[Kr] 4d¹⁰ 5s² 5p⁴', [2, 8, 18, 18, 6], 2.1, 123, 869, 6.24, 722.66, 1261, 'Solid', '-2, +4, +6', '#D47A00', 'Franz-Joseph Müller von Reichenstein', '1782', 'Discovered in Transylvanian gold ores in 1782 and named by Klaproth from Latin tellus ("Earth"). Noticeably higher atomic weight than iodine (Z=53) due to neutron-rich isotopes.', ['Cadmium telluride (CdTe) solar panels', 'Bismuth telluride (Bi₂Te₃) Peltier coolers', 'Free-machining steel & copper additive']],
  [53, 'I', 'Iodine', 126.90, 'halogen', 17, 5, 5, 17, 'p', '[Kr] 4d¹⁰ 5s² 5p⁵', [2, 8, 18, 18, 7], 2.66, 115, 1008, 4.933, 386.85, 457.4, 'Solid', '-1, +1, +3, +5, +7', '#940094', 'Bernard Courtois', '1811', 'Discovered by Courtois in 1811 when he added excess sulfuric acid to seaweed ash and observed clouds of violet vapor condensing into lustrous dark crystals.', ['Thyroid hormones (thyroxine T₄ & triiodothyronine T₃)', 'Povidone-iodine surgical antiseptics', 'Starch-iodine redox titration indicator']],
  [54, 'Xe', 'Xenon', 131.29, 'noble-gas', 18, 5, 5, 18, 'p', '[Kr] 4d¹⁰ 5s² 5p⁶', [2, 8, 18, 18, 8], 2.60, 108, 1170, 0.005894, 161.4, 165.05, 'Gas', '0, +2, +4, +6, +8', '#429EB0', 'William Ramsay & Morris Travers', '1898', 'In 1962, Neil Bartlett synthesized xenon hexafluoroplatinate (Xe⁺[PtF₆]⁻), shattering the dogma that noble gases are chemically incapable of forming compounds.', ['Deep-space Hall-effect & gridded ion propulsion', 'High-intensity xenon arc cinema & strobe lamps', 'Hyperpolarized ¹²⁹Xe lung MRI imaging']],
  [55, 'Cs', 'Cesium', 132.91, 'alkali-metal', 1, 6, 6, 1, 's', '[Xe] 6s¹', [2, 8, 18, 18, 8, 1], 0.79, 298, 376, 1.93, 301.59, 944, 'Solid', '+1', '#57178F', 'Robert Bunsen & Gustav Kirchhoff', '1860', 'The first element ever discovered by emission spectroscopy (1860, in Dürkheim mineral water). Has the largest empirical atomic radius and lowest ionization energy of all stable elements.', ['SI second definition via ¹³³Cs hyperfine transition (9,192,631,770 Hz)', 'High-density cesium formate oil drilling fluids', 'Photoelectric cells & vacuum tube getters']],
  [56, 'Ba', 'Barium', 137.33, 'alkaline-earth', 2, 6, 6, 2, 's', '[Xe] 6s²', [2, 8, 18, 18, 8, 2], 0.89, 253, 503, 3.51, 1000, 2170, 'Solid', '+2', '#00C900', 'Carl Wilhelm Scheele & Humphry Davy', '1772', 'Distinguished from lime by Scheele (1772) and isolated electrolytically by Davy (1808). Named from Greek barys ("heavy") for the high density of barite (BaSO₄).', ['Radiopaque BaSO₄ gastrointestinal X-ray contrast', 'Apple-green pyrotechnic flame emission', 'Barium titanate (BaTiO₃) piezoelectric capacitors']],
  [57, 'La', 'Lanthanum', 138.91, 'lanthanide', 3, 6, 9, 3, 'f', '[Xe] 5d¹ 6s²', [2, 8, 18, 18, 9, 2], 1.10, 195, 538, 6.162, 1193, 3737, 'Solid', '+3', '#70D4FF', 'Carl Gustaf Mosander', '1839', 'Discovered by Mosander in 1839 by thermally decomposing cerium nitrate; named from Greek lanthanein ("to lie hidden").', ['Fluid catalytic cracking (FCC) zeolite catalysts', 'High-refractive-index camera & telescope lenses', 'LaNi₅ hydrogen storage & NiMH battery anodes']],
  [58, 'Ce', 'Cerium', 140.12, 'lanthanide', 0, 6, 9, 4, 'f', '[Xe] 4f¹ 5d¹ 6s²', [2, 8, 18, 19, 9, 2], 1.12, 185, 534, 6.770, 1068, 3716, 'Solid', '+3, +4', '#FFFFC7', 'Jöns Jacob Berzelius, Wilhelm Hisinger & Martin Klaproth', '1803', 'The most abundant of the lanthanide elements (more abundant in Earth’s crust than copper). Named after the dwarf planet Ceres.', ['CeO₂ precision optical glass polishing compound', 'Self-cleaning oven & automotive three-way catalysts', 'Ferrocerium pyrophoric striker flints']],
  [59, 'Pr', 'Praseodymium', 140.91, 'lanthanide', 0, 6, 9, 5, 'f', '[Xe] 4f³ 6s²', [2, 8, 18, 21, 8, 2], 1.13, 247, 527, 6.77, 1208, 3793, 'Solid', '+3, +4', '#D9FFC7', 'Carl Auer von Welsbach', '1885', 'Separated along with neodymium from "didymium" by Carl Auer von Welsbach in 1885; named for its leek-green salts.', ['Didymium glassblower safety goggles (absorbs Na yellow glare)', 'Pr-doped permanent magnet alloys', 'High-strength magnesium aircraft engine castings']],
  [60, 'Nd', 'Neodymium', 144.24, 'lanthanide', 0, 6, 9, 6, 'f', '[Xe] 4f⁴ 6s²', [2, 8, 18, 22, 8, 2], 1.14, 206, 533, 7.01, 1297, 3347, 'Solid', '+3', '#C7FFC7', 'Carl Auer von Welsbach', '1885', 'Isolated from didymium by Welsbach in 1885. Forms Nd₂Fe₁₄B, the strongest permanent magnet material known.', ['Nd₂Fe₁₄B permanent magnets (EV motors, wind turbines, headphones)', 'Nd:YAG & Nd:glass high-power lasers (1064 nm)', 'Alexandrite-like color-shifting Dichroic glass']],
  [61, 'Pm', 'Promethium', 145, 'lanthanide', 0, 6, 9, 7, 'f', '[Xe] 4f⁵ 6s²', [2, 8, 18, 23, 8, 2], 1.13, 205, 540, 7.26, 1315, 3273, 'Synthetic', '+3', '#A3FFC7', 'Jacob A. Marinsky, Lawrence E. Glendenin & Charles D. Coryell', '1945', 'The only radioactive lanthanide with no stable isotopes; isolated from uranium fission products at Oak Ridge National Laboratory in 1945 and named after Prometheus.', ['Betavoltaic nuclear microbatteries (pacemakers, spacecraft)', 'Non-contact thickness gauges', 'Self-luminous aerospace dials']],
  [62, 'Sm', 'Samarium', 150.36, 'lanthanide', 0, 6, 9, 8, 'f', '[Xe] 4f⁶ 6s²', [2, 8, 18, 24, 8, 2], 1.17, 238, 545, 7.52, 1345, 2067, 'Solid', '+2, +3', '#8FFFC7', 'Paul-Émile Lecoq de Boisbaudran', '1879', 'Isolated from samarskite mineral in 1879; indirectly named after Russian mining official Vasili Samarsky-Bykhovets.', ['SmCo₅ & Sm₂Co₁₇ high-temperature permanent magnets', 'Samarium(II) iodide (SmI₂) Kagan single-electron reductant', '¹⁵³Sm lexidronam bone cancer palliative radiotherapy']],
  [63, 'Eu', 'Europium', 151.96, 'lanthanide', 0, 6, 9, 9, 'f', '[Xe] 4f⁷ 6s²', [2, 8, 18, 25, 8, 2], 1.2, 231, 547, 5.244, 1099, 1802, 'Solid', '+2, +3', '#61FFC7', 'Eugène-Anatole Demarçay', '1901', 'The most reactive and least dense lanthanide due to its half-filled 4f⁷ shell favoring a large divalent metallic radius.', ['Red (Eu³⁺) and blue (Eu²⁺) LED & display phosphors', 'Euro banknote anti-counterfeiting UV fluorescence inks', 'Nuclear reactor neutron control absorbers']],
  [64, 'Gd', 'Gadolinium', 157.25, 'lanthanide', 0, 6, 9, 10, 'f', '[Xe] 4f⁷ 5d¹ 6s²', [2, 8, 18, 25, 9, 2], 1.20, 233, 593, 7.90, 1585, 3546, 'Solid', '+3', '#45FFC7', 'Jean Charles Galissard de Marignac', '1880', 'Named after Finnish chemist Johan Gadolin. Has 7 unpaired 4f electrons, giving Gd³⁺ a massive paramagnetic moment and the highest thermal neutron capture cross-section of any natural element.', ['Chelated Gd³⁺ intravenous MRI T1 contrast agents', 'Magnetocaloric solid-state magnetic refrigeration', 'Nuclear reactor emergency shut-down shielding']],
  [65, 'Tb', 'Terbium', 158.93, 'lanthanide', 0, 6, 9, 11, 'f', '[Xe] 4f⁹ 6s²', [2, 8, 18, 27, 8, 2], 1.2, 225, 566, 8.23, 1629, 3503, 'Solid', '+3, +4', '#30FFC7', 'Carl Gustaf Mosander', '1843', 'Discovered by Mosander in 1843 as an impurity in yttrium oxide; one of four elements named after Ytterby, Sweden.', ['Brilliant green (Tb³⁺) trichromatic display phosphors', 'Terfenol-D giant magnetostrictive sonar actuators', 'Solid-state fuel cell crystal stabilizers']],
  [66, 'Dy', 'Dysprosium', 162.50, 'lanthanide', 0, 6, 9, 12, 'f', '[Xe] 4f¹⁰ 6s²', [2, 8, 18, 28, 8, 2], 1.22, 228, 573, 8.54, 1680, 2840, 'Solid', '+3', '#1FFFC7', 'Paul-Émile Lecoq de Boisbaudran', '1886', 'Named from Greek dysprositos ("hard to get at") after Lecoq de Boisbaudran required over 30 fractional crystallizations to isolate it.', ['High-coercivity additive in EV traction motor NdFeB magnets', 'Terfenol-D magnetostrictive transducers', 'High-intensity metal-halide discharge lamps']],
  [67, 'Ho', 'Holmium', 164.93, 'lanthanide', 0, 6, 9, 13, 'f', '[Xe] 4f¹¹ 6s²', [2, 8, 18, 29, 8, 2], 1.23, 226, 581, 8.79, 1734, 2993, 'Solid', '+3', '#00FF9C', 'Marc Delafontaine, Jacques-Louis Soret & Per Teodor Cleve', '1878', 'Named after Holmia, the Latin name for Stockholm. Possesses the highest magnetic permeability and magnetic moment (10.6 μB) of any naturally occurring element.', ['Magnetic flux concentrator pole pieces in high-field magnets', 'Ho:YAG (2.1 μm) lithotripsy & minimally invasive surgical lasers', 'Spectrophotometer wavelength calibration standards']],
  [68, 'Er', 'Erbium', 167.26, 'lanthanide', 0, 6, 9, 14, 'f', '[Xe] 4f¹² 6s²', [2, 8, 18, 30, 8, 2], 1.24, 226, 589, 9.066, 1802, 3141, 'Solid', '+3', '#00E675', 'Carl Gustaf Mosander', '1843', 'Discovered by Mosander in 1843 and named after Ytterby, Sweden. Its Er³⁺ ion emits at 1550 nm—precisely in the minimum-loss window of silica optical fibers.', ['Erbium-doped fiber amplifiers (EDFAs) for global internet cables', 'Er:YAG dermatological & dental lasers (2940 nm)', 'Pink optical glass & zirconia ceramic coloring']],
  [69, 'Tm', 'Thulium', 168.93, 'lanthanide', 0, 6, 9, 15, 'f', '[Xe] 4f¹³ 6s²', [2, 8, 18, 31, 8, 2], 1.25, 222, 597, 9.32, 1818, 2223, 'Solid', '+2, +3', '#00D452', 'Per Teodor Cleve', '1879', 'The least abundant naturally occurring stable lanthanide; named by Cleve after Thule, the ancient Greek name for Scandinavia.', ['Portable ¹⁷⁰Tm X-ray inspection sources', 'Tm:YAG & thulium fiber surgical lasers (1940 nm)', 'Euro banknote blue UV security phosphors']],
  [70, 'Yb', 'Ytterbium', 173.05, 'lanthanide', 0, 6, 9, 16, 'f', '[Xe] 4f¹⁴ 6s²', [2, 8, 18, 32, 8, 2], 1.1, 222, 603, 6.90, 1097, 1469, 'Solid', '+2, +3', '#00BF38', 'Jean Charles Galissard de Marignac', '1878', 'Has a completely filled 4f¹⁴ subshell. Used in the world’s most stable optical lattice atomic clocks, accurate to within 1 second over the age of the universe.', ['Ytterbium optical lattice clocks (10⁻¹⁸ precision)', 'Yb-doped ultra-high-power industrial fiber lasers', 'Piezoresistive seismic stress gauges']],
  [71, 'Lu', 'Lutetium', 174.97, 'lanthanide', 0, 6, 9, 17, 'd', '[Xe] 4f¹⁴ 5d¹ 6s²', [2, 8, 18, 32, 9, 2], 1.27, 217, 524, 9.841, 1925, 3675, 'Solid', '+3', '#00AB24', 'Georges Urbain, Carl Auer von Welsbach & Charles James', '1907', 'The heaviest and hardest lanthanide due to lanthanide contraction; named after Lutetia, the ancient Roman name for Paris.', ['LSO/LYSO scintillator crystals in PET medical scanners', '¹⁷⁷Lu-dotatate & PSMA targeted radioligand cancer therapy', 'Lu-Hf geochronology of meteorites and Earth’s crust']],
  [72, 'Hf', 'Hafnium', 178.49, 'transition-metal', 4, 6, 6, 4, 'd', '[Xe] 4f¹⁴ 5d² 6s²', [2, 8, 18, 32, 10, 2], 1.3, 208, 659, 13.31, 2506, 4876, 'Solid', '+4', '#4DC2FF', 'Dirk Coster & George de Hevesy', '1923', 'Because of the lanthanide contraction, hafnium has almost the exact same atomic and ionic radius as zirconium (72 pm vs 71 pm), making them chemically twin elements. Discovered via X-ray spectroscopy in Copenhagen (Hafnia).', ['HfO₂ high-k dielectric gate insulator in modern CPUs', 'Nuclear submarine control rods (high neutron capture)', 'Plasma cutting torch electrodes & superalloys']],
  [73, 'Ta', 'Tantalum', 180.95, 'transition-metal', 5, 6, 6, 5, 'd', '[Xe] 4f¹⁴ 5d³ 6s²', [2, 8, 18, 32, 11, 2], 1.5, 200, 761, 16.69, 3290, 5731, 'Solid', '+5', '#4DA6FF', 'Anders Gustaf Ekeberg', '1802', 'Named after mythological Tantalus because its oxide film refuses to "drink in" and dissolve in strong acids (even aqua regia below 150 °C).', ['High-capacitance SMD tantalum electrolytic capacitors', 'Biocompatible cranial plates & surgical sutures', 'Ultra-high-vacuum furnace heating elements']],
  [74, 'W', 'Tungsten', 183.84, 'transition-metal', 6, 6, 6, 6, 'd', '[Xe] 4f¹⁴ 5d⁴ 6s²', [2, 8, 18, 32, 12, 2], 2.36, 193, 770, 19.25, 3695, 5828, 'Solid', '+4, +6', '#2194D6', 'Juan José and Fausto Elhuyar', '1783', 'Possesses the highest melting point (3695 K / 3422 °C) and lowest vapor pressure of all pure metals. Symbol W comes from German Wolfram.', ['Tungsten carbide (WC) ultra-hard machining tools', 'TIG welding electrodes & X-ray tube targets', 'Tokamak fusion reactor divertor armor']],
  [75, 'Re', 'Rhenium', 186.21, 'transition-metal', 7, 6, 6, 7, 'd', '[Xe] 4f¹⁴ 5d⁵ 6s²', [2, 8, 18, 32, 13, 2], 1.9, 188, 760, 21.02, 3459, 5869, 'Solid', '+4, +6, +7', '#267DAB', 'Walter Noddack, Ida Tacke & Otto Berg', '1925', 'The last stable, non-radioactive element to be discovered (1925) and one of the rarest elements in Earth’s crust (~1 ppb). Named after the Rhine River.', ['Single-crystal nickel-rhenium jet turbine blades', 'Pt-Re catalytic reforming for high-octane gasoline', 'High-temperature W-Re thermocouples']],
  [76, 'Os', 'Osmium', 190.23, 'transition-metal', 8, 6, 6, 8, 'd', '[Xe] 4f¹⁴ 5d⁶ 6s²', [2, 8, 18, 32, 14, 2], 2.2, 185, 840, 22.59, 3306, 5285, 'Solid', '+4, +8', '#266696', 'Smithson Tennant', '1803', 'The densest naturally occurring element on Earth (22.59 g/cm³—twice as dense as lead). Named from Greek osme ("smell") due to the pungent, volatile osmium tetroxide (OsO₄).', ['Sharpless asymmetric dihydroxylation of alkenes (OsO₄)', 'Transmission electron microscopy (TEM) lipid staining', 'Fountain pen nib tips & electrical pivots']],
  [77, 'Ir', 'Iridium', 192.22, 'transition-metal', 9, 6, 6, 9, 'd', '[Xe] 4f¹⁴ 5d⁷ 6s²', [2, 8, 18, 32, 15, 2], 2.20, 180, 880, 22.56, 2719, 4701, 'Solid', '+3, +4', '#175487', 'Smithson Tennant', '1803', 'The most corrosion-resistant metal known; global enrichment of iridium in the K-Pg boundary clay layer provided key evidence for the Chicxulub asteroid impact that ended the dinosaurs.', ['OLED phosphorescent emitter complexes (Ir(ppy)₃)', 'High-durability laser-welded spark plug tips', 'Crucibles for growing single-crystal sapphire & YAG']],
  [78, 'Pt', 'Platinum', 195.08, 'transition-metal', 10, 6, 6, 10, 'd', '[Xe] 4f¹⁴ 5d⁹ 6s¹', [2, 8, 18, 32, 17, 1], 2.28, 177, 870, 21.45, 2041.4, 4098, 'Solid', '+2, +4', '#D0D0E0', 'Antonio de Ulloa', '1735', 'Used by pre-Columbian South American artisans and brought to European scientific notice by Antonio de Ulloa in 1735.', ['Cisplatin & carboplatin chemotherapy drugs', 'PEM fuel cell & catalytic converter electrocatalysts', 'Standard hydrogen electrode (SHE) & laboratory crucibles']],
  [79, 'Au', 'Gold', 196.97, 'transition-metal', 11, 6, 6, 11, 'd', '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', [2, 8, 18, 32, 18, 1], 2.54, 174, 890, 19.30, 1337.33, 3129, 'Solid', '+1, +3', '#FFD123', 'Known since antiquity', 'Prehistoric', 'The most malleable and ductile metal; relativistic contraction of the 6s orbital narrows the 5d-to-6s energy gap, absorbing blue light and giving gold its signature warm yellow luster.', ['Corrosion-free semiconductor wire bonding & contacts', 'Rutherford gold foil alpha-scattering experiment', 'Colloidal gold lateral-flow rapid diagnostic assays']],
  [80, 'Hg', 'Mercury', 200.59, 'transition-metal', 12, 6, 6, 12, 'd', '[Xe] 4f¹⁴ 5d¹⁰ 6s²', [2, 8, 18, 32, 18, 2], 2.00, 171, 1007, 13.534, 234.32, 629.88, 'Liquid', '+1, +2', '#B8B8D0', 'Known since antiquity', 'Prehistoric', 'The only metallic element that is liquid at standard conditions; relativistic contraction of the filled 6s² shell weakens Hg-Hg metallic bonding.', ['Barometers, sphygmomanometers & UV germicidal lamps', 'Castner-Kellner chlor-alkali amalgam cells', 'Liquid-mirror astronomical telescopes']],
  [81, 'Tl', 'Thallium', 204.38, 'post-transition-metal', 13, 6, 6, 13, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', [2, 8, 18, 32, 18, 3], 1.62, 156, 589, 11.85, 577, 1746, 'Solid', '+1, +3', '#A6544D', 'William Crookes', '1861', 'Discovered spectroscopically by Crookes in 1861 and named from Greek thallos ("green shoot") after its vivid green emission line. Exhibits the "inert pair effect" favoring +1 over +3.', ['NaI(Tl) gamma-ray scintillation detectors', 'Low-temperature mercury-thallium thermometers (-60 °C)', 'Infrared KRS-5 optical prisms']],
  [82, 'Pb', 'Lead', 207.2, 'post-transition-metal', 14, 6, 6, 14, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', [2, 8, 18, 32, 18, 4], 2.33, 154, 716, 11.34, 600.61, 2022, 'Solid', '+2, +4', '#575961', 'Known since antiquity', 'Prehistoric', 'Has the highest atomic number (Z=82, magic proton shell) of any element with stable isotopes; Pb-206, Pb-207, and Pb-208 are the final stable endpoints of the uranium and thorium radioactive decay chains.', ['Lead-acid automotive & backup storage batteries', 'X-ray and gamma radiation shielding aprons/walls', 'Uranium-lead (U-Pb) zircon radiometric dating']],
  [83, 'Bi', 'Bismuth', 208.98, 'post-transition-metal', 15, 6, 6, 15, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', [2, 8, 18, 32, 18, 5], 2.02, 143, 703, 9.78, 544.7, 1837, 'Solid', '+3, +5', '#9E4FB5', 'Claude François Geoffroy', '1753', 'Shown to be distinct from lead and tin by Geoffroy in 1753. Forms iridescent, stair-stepped hopper crystals and is the most strongly diamagnetic metal (levitating magnets).', ['Bismuth subsalicylate gastrointestinal pharmaceuticals', 'Non-toxic replacement for lead in solders & brass', 'Bi₂Se₃ & Bi₂Te₃ topological insulators']],
  [84, 'Po', 'Polonium', 209, 'post-transition-metal', 16, 6, 6, 16, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', [2, 8, 18, 32, 18, 6], 2.0, 135, 812, 9.196, 527, 1235, 'Solid', '+2, +4', '#AB5C00', 'Marie & Pierre Curie', '1898', 'Discovered by Marie and Pierre Curie in pitchblende ore in July 1898 and named after Marie’s native Poland. The only element that crystallizes in a simple cubic lattice at STP.', ['Alpha-particle antistatic brushes for film & optics', 'Po-Be neutron startup sources', 'Early Lunokhod rover radioisotope heaters']],
  [85, 'At', 'Astatine', 210, 'halogen', 17, 6, 6, 17, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', [2, 8, 18, 32, 18, 7], 2.2, 127, 920, 8.9, 575, 610, 'Solid', '-1, +1', '#754F45', 'Dale R. Corson, Kenneth Ross MacKenzie & Emilio Segrè', '1940', 'The rarest naturally occurring element in Earth’s crust (< 1 gram total at any moment). Synthesized at UC Berkeley by bombarding bismuth-209 with alpha particles.', ['²¹¹At targeted alpha-particle cancer immunotherapy', 'Radiochemistry halogen periodicity research']],
  [86, 'Rn', 'Radon', 222, 'noble-gas', 18, 6, 6, 18, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', [2, 8, 18, 32, 18, 8], 2.2, 120, 1037, 0.00973, 202, 211.3, 'Gas', '0, +2', '#428296', 'Friedrich Ernst Dorn', '1900', 'A dense, colorless radioactive noble gas formed as an intermediate in the decay chains of radium, uranium, and thorium in granitic bedrock.', ['Hydrologic & seismic fault-line gas tracer', 'Environmental indoor radiation monitoring']],
  [87, 'Fr', 'Francium', 223, 'alkali-metal', 1, 7, 7, 1, 's', '[Rn] 7s¹', [2, 8, 18, 32, 18, 8, 1], 0.7, 348, 380, 2.48, 300, 950, 'Solid', '+1', '#420066', 'Marguerite Perey', '1939', 'The last element discovered in nature rather than by synthesis, identified by Marguerite Perey at the Curie Institute in Paris in 1939 from actinium-227 decay (longest half-life 22 minutes).', ['Atomic parity non-conservation (PNC) magneto-optical traps', 'Relativistic quantum electrodynamics spectroscopy']],
  [88, 'Ra', 'Radium', 226, 'alkaline-earth', 2, 7, 7, 2, 's', '[Rn] 7s²', [2, 8, 18, 32, 18, 8, 2], 0.9, 283, 509, 5.5, 973, 2010, 'Solid', '+2', '#007D00', 'Marie & Pierre Curie', '1898', 'Isolated by Marie and Pierre Curie from several tons of Joachimsthal pitchblende residue in December 1898; named from Latin radius ("ray") for its intense radioluminescence.', ['²²³Ra dichloride (Xofigo) targeted bone metastasis therapy', 'Historical neutron & radon sources']],
  [89, 'Ac', 'Actinium', 227, 'actinide', 3, 7, 10, 3, 'f', '[Rn] 6d¹ 7s²', [2, 8, 18, 32, 18, 9, 2], 1.1, 195, 499, 10.07, 1323, 3471, 'Solid', '+3', '#70ABFA', 'Friedrich Oskar Giesel & André-Louis Debierne', '1899', 'Gives its name to the actinide series; glows pale blue in the dark as its intense alpha emissions ionize surrounding air.', ['²²⁵Ac targeted alpha therapy (TAT) oncology conjugates', 'Geochemical deep-ocean circulation tracer']],
  [90, 'Th', 'Thorium', 232.04, 'actinide', 0, 7, 10, 4, 'f', '[Rn] 6d² 7s²', [2, 8, 18, 32, 18, 10, 2], 1.3, 180, 587, 11.72, 2023, 5061, 'Solid', '+4', '#00BAFF', 'Jöns Jacob Berzelius', '1829', 'Discovered by Berzelius in thorite mineral and named after Thor, Norse god of thunder. Has an exceptionally high melting point for an oxide (ThO₂ melts at 3663 K).', ['Molten-salt thorium fuel cycle breeder reactors (²³²Th → ²³³U)', 'TIG welding tungsten electrode thermionic emitters', 'U-Th coral & speleothem paleoclimate dating']],
  [91, 'Pa', 'Protactinium', 231.04, 'actinide', 0, 7, 10, 5, 'f', '[Rn] 5f² 6d¹ 7s²', [2, 8, 18, 32, 20, 9, 2], 1.5, 180, 568, 15.37, 1841, 4300, 'Solid', '+4, +5', '#00A1FF', 'Kasimir Fajans, Oswald Göhring, Lise Meitner & Otto Hahn', '1913', 'First identified as short-lived "brevium" (²³⁴ᵐPa) by Fajans and Göhring in 1913, and long-lived ²³¹Pa by Lise Meitner and Otto Hahn in 1918 ("parent of actinium").', ['²³¹Pa/²³⁰Th marine sediment paleoceanography dating']],
  [92, 'U', 'Uranium', 238.03, 'actinide', 0, 7, 10, 6, 'f', '[Rn] 5f³ 6d¹ 7s²', [2, 8, 18, 32, 21, 9, 2], 1.38, 175, 598, 19.1, 1405.3, 4404, 'Solid', '+3, +4, +5, +6', '#008FFF', 'Martin Heinrich Klaproth', '1789', 'Discovered by Klaproth in pitchblende in 1789 and named after the newly discovered planet Uranus. In 1938, Hahn, Strassmann, Meitner, and Frisch discovered nuclear fission of ²³⁵U.', ['Nuclear fission power generation (²³⁵U fuel)', 'Uranium-lead geochronology of Earth’s oldest rocks (4.54 Ga)', 'Uranyl acetate electron microscopy stain & vaseline glass']],
  [93, 'Np', 'Neptunium', 237, 'actinide', 0, 7, 10, 7, 'f', '[Rn] 5f⁴ 6d¹ 7s²', [2, 8, 18, 32, 22, 9, 2], 1.36, 175, 605, 20.45, 917, 4273, 'Synthetic', '+3, +4, +5, +6, +7', '#0080FF', 'Edwin McMillan & Philip H. Abelson', '1940', 'The first synthetic transuranium element, produced at UC Berkeley in 1940 by bombarding uranium with slow neutrons. Exhibits the widest liquid temperature range of any element (3356 K).', ['Precursor target for producing ²³⁸Pu spacecraft RTG fuel', 'High-energy fast neutron detectors']],
  [94, 'Pu', 'Plutonium', 244, 'actinide', 0, 7, 10, 8, 'f', '[Rn] 5f⁶ 7s²', [2, 8, 18, 32, 24, 8, 2], 1.28, 175, 585, 19.85, 912.5, 3505, 'Synthetic', '+3, +4, +5, +6', '#006BFF', 'Glenn T. Seaborg, Arthur Wahl, Joseph W. Kennedy & Edwin McMillan', '1940', 'Synthesized by Seaborg’s team in December 1940. Crystallographically extraordinary: pure plutonium exhibits 6 solid allotropic phases between room temperature and its melting point.', ['²³⁸Pu radioisotope thermoelectric generators (Voyager, Curiosity, Perseverance)', 'MOX mixed-oxide nuclear reactor fuel']],
  [95, 'Am', 'Americium', 243, 'actinide', 0, 7, 10, 9, 'f', '[Rn] 5f⁷ 7s²', [2, 8, 18, 32, 25, 8, 2], 1.3, 175, 578, 12.0, 1449, 2880, 'Synthetic', '+3, +4, +5, +6', '#545CF2', 'Glenn T. Seaborg, Ralph A. James, Leon O. Morgan & Albert Ghiorso', '1944', 'Discovered in late 1944 at the Metallurgical Laboratory in Chicago; the only synthetic transuranium element commonly found in household devices.', ['²⁴¹Am ionization-chamber household smoke detectors', 'Am-Be industrial neutron moisture & density probes', 'Long-lived space probe RTG power sources (ESA)']],
  [96, 'Cm', 'Curium', 247, 'actinide', 0, 7, 10, 10, 'f', '[Rn] 5f⁷ 6d¹ 7s²', [2, 8, 18, 32, 25, 9, 2], 1.3, 176, 581, 13.51, 1613, 3383, 'Synthetic', '+3', '#785CE3', 'Glenn T. Seaborg, Ralph A. James & Albert Ghiorso', '1944', 'Synthesized in July 1944 at UC Berkeley by bombarding Pu-239 with alpha particles; named in honor of Marie and Pierre Curie.', ['²⁴⁴Cm Alpha Particle X-ray Spectrometers (APXS) on Mars rovers & Philae lander', 'Target feedstock for heavy transcurium synthesis']],
  [97, 'Bk', 'Berkelium', 247, 'actinide', 0, 7, 10, 11, 'f', '[Rn] 5f⁹ 7s²', [2, 8, 18, 32, 27, 8, 2], 1.3, 170, 601, 14.78, 1259, 2900, 'Synthetic', '+3, +4', '#8A4FE3', 'Glenn T. Seaborg, Albert Ghiorso & Stanley G. Thompson', '1949', 'Synthesized at UC Berkeley in December 1949; a 22-milligram sample of ²⁴⁹Bk synthesized at Oak Ridge was crucial for discovering element 117 (Tennessine).', ['Target material for synthesizing superheavy elements (Z=117)', 'Actinide coordination chemistry research']],
  [98, 'Cf', 'Californium', 251, 'actinide', 0, 7, 10, 12, 'f', '[Rn] 5f¹⁰ 7s²', [2, 8, 18, 32, 28, 8, 2], 1.3, 186, 608, 15.1, 1173, 1743, 'Synthetic', '+3', '#A136D4', 'Glenn T. Seaborg, Albert Ghiorso, Kenneth Street Jr. & Stanley G. Thompson', '1950', 'A remarkably potent neutron emitter: 1 microgram of Californium-252 emits 2.3 million neutrons per second via spontaneous fission.', ['²⁵²Cf nuclear reactor startup neutron sources', 'Prompt gamma neutron activation analysis (PGNAA) of coal & cement', 'Target for synthesizing Oganesson (Z=118)']],
  [99, 'Es', 'Einsteinium', 252, 'actinide', 0, 7, 10, 13, 'f', '[Rn] 5f¹¹ 7s²', [2, 8, 18, 32, 29, 8, 2], 1.3, 186, 619, 8.84, 1133, 1269, 'Synthetic', '+3', '#B31FD4', 'Albert Ghiorso et al.', '1952', 'Discovered in December 1952 in fallout debris from the "Ivy Mike" thermonuclear test via rapid neutron capture on U-238; named after Albert Einstein.', ['Synthesis of Mendelevium (Z=101)', 'Radiochemical self-irradiation & coordination studies']],
  [100, 'Fm', 'Fermium', 257, 'actinide', 0, 7, 10, 14, 'f', '[Rn] 5f¹² 7s²', [2, 8, 18, 32, 30, 8, 2], 1.3, null, 627, 9.7, 1800, null, 'Synthetic', '+2, +3', '#B31FBA', 'Albert Ghiorso et al.', '1952', 'Discovered alongside einsteinium in 1952 and named after Enrico Fermi; represents the heaviest element that can be produced by neutron bombardment of lighter elements.', ['Heavy-actinide laser resonance ionization spectroscopy']],
  [101, 'Md', 'Mendelevium', 258, 'actinide', 0, 7, 10, 15, 'f', '[Rn] 5f¹³ 7s²', [2, 8, 18, 32, 31, 8, 2], 1.3, null, 635, 10.3, 1100, null, 'Synthetic', '+2, +3', '#B30DA6', 'Albert Ghiorso, Bernard G. Harvey, Gregory R. Choppin, Stanley G. Thompson & Glenn T. Seaborg', '1955', 'The first element synthesized one atom at a time (17 atoms initially) by bombarding Es-253 with helium ions; named in honor of Dmitri Mendeleev.', ['One-atom-at-a-time aqueous redox chemistry']],
  [102, 'No', 'Nobelium', 259, 'actinide', 0, 7, 10, 16, 'f', '[Rn] 5f¹⁴ 7s²', [2, 8, 18, 32, 32, 8, 2], 1.3, null, 642, 9.9, 1100, null, 'Synthetic', '+2, +3', '#BD0D87', 'Joint Institute for Nuclear Research (Dubna) & UC Berkeley', '1966', 'Named after Alfred Nobel. Because of its completely filled 5f¹⁴ shell, No²⁺ is more stable in aqueous solution than No³⁺.', ['First-ionization-potential laser spectroscopy of transfermium elements']],
  [103, 'Lr', 'Lawrencium', 266, 'actinide', 0, 7, 10, 17, 'd', '[Rn] 5f¹⁴ 7s² 7p¹', [2, 8, 18, 32, 32, 8, 3], 1.3, null, 470, 14.4, 1900, null, 'Synthetic', '+3', '#C70066', 'Albert Ghiorso, Torbjørn Sikkeland, Almon E. Larsh & Robert M. Latimer', '1961', 'Named after Ernest O. Lawrence, inventor of the cyclotron. Relativistic stabilization causes its valence electron to occupy 7p₁/₂ rather than 6d.', ['Relativistic valence orbital studies at the end of the actinide series']],
  [104, 'Rf', 'Rutherfordium', 267, 'transition-metal', 4, 7, 7, 4, 'd', '[Rn] 5f¹⁴ 6d² 7s²', [2, 8, 18, 32, 32, 10, 2], null, null, 580, 17, 2400, 5800, 'Synthetic', '+4', '#CC0059', 'JINR (Dubna) & Lawrence Berkeley Laboratory', '1964', 'The first transactinide (superheavy) element, opening the 6d transition series; named in honor of Ernest Rutherford.', ['Gas-phase halide volatility comparisons with Zr and Hf']],
  [105, 'Db', 'Dubnium', 268, 'transition-metal', 5, 7, 7, 5, 'd', '[Rn] 5f¹⁴ 6d³ 7s²', [2, 8, 18, 32, 32, 11, 2], null, null, 665, 21.6, null, null, 'Synthetic', '+5', '#D1004F', 'JINR (Dubna) & Lawrence Berkeley Laboratory', '1968', 'Named after the Russian science city of Dubna, home of the Joint Institute for Nuclear Research.', ['Superheavy Group 5 aqueous complexation research']],
  [106, 'Sg', 'Seaborgium', 269, 'transition-metal', 6, 7, 7, 6, 'd', '[Rn] 5f¹⁴ 6d⁴ 7s²', [2, 8, 18, 32, 32, 12, 2], null, null, 757, 23, null, null, 'Synthetic', '+6', '#D90045', 'Albert Ghiorso & Glenn T. Seaborg (LBNL)', '1974', 'The first element named after a living person at the time of naming, honoring nuclear chemist Glenn T. Seaborg.', ['Synthesis of volatile Sg(CO)₆ hexacarbonyl complexes']],
  [107, 'Bh', 'Bohrium', 270, 'transition-metal', 7, 7, 7, 7, 'd', '[Rn] 5f¹⁴ 6d⁵ 7s²', [2, 8, 18, 32, 32, 13, 2], null, null, 740, 26, null, null, 'Synthetic', '+7', '#E00038', 'Peter Armbruster & Gottfried Münzenberg (GSI Darmstadt)', '1981', 'Synthesized by cold fusion of ²⁰⁹Bi and ⁵⁴Cr at GSI Darmstadt and named after Danish physicist Niels Bohr.', ['Volatile oxychloride BhO₃Cl gas-chromatography studies']],
  [108, 'Hs', 'Hassium', 277, 'transition-metal', 8, 7, 7, 8, 'd', '[Rn] 5f¹⁴ 6d⁶ 7s²', [2, 8, 18, 32, 32, 14, 2], null, null, 730, 27, null, null, 'Synthetic', '+8', '#E6002E', 'Peter Armbruster & Gottfried Münzenberg (GSI Darmstadt)', '1984', 'Named after Hassia, the Latin name for the German state of Hesse. Forms volatile tetroxide HsO₄ analogous to osmium tetroxide.', ['Nuclear shell stabilization analysis at N=162 deformed shell']],
  [109, 'Mt', 'Meitnerium', 278, 'transition-metal', 9, 7, 7, 9, 'd', '[Rn] 5f¹⁴ 6d⁷ 7s²', [2, 8, 18, 32, 32, 15, 2], null, null, 800, 27, null, null, 'Synthetic', '+3, +4', '#EB0026', 'Peter Armbruster & Gottfried Münzenberg (GSI Darmstadt)', '1982', 'Synthesized in 1982 at GSI Darmstadt and named in honor of physicist Lise Meitner, co-discoverer of nuclear fission.', ['Superheavy nuclear decay chain alpha spectroscopy']],
  [110, 'Ds', 'Darmstadtium', 281, 'transition-metal', 10, 7, 7, 10, 'd', '[Rn] 5f¹⁴ 6d⁸ 7s²', [2, 8, 18, 32, 32, 16, 2], null, null, 960, 26, null, null, 'Synthetic', '+2, +4', '#EB0026', 'Sigurd Hofmann et al. (GSI Darmstadt)', '1994', 'Synthesized in November 1994 at GSI in Darmstadt, Germany by fusing lead-208 and nickel-62.', ['Relativistic 7s² stabilization modeling']],
  [111, 'Rg', 'Roentgenium', 282, 'transition-metal', 11, 7, 7, 11, 'd', '[Rn] 5f¹⁴ 6d⁹ 7s²', [2, 8, 18, 32, 32, 17, 2], null, null, 1020, 22, null, null, 'Synthetic', '+3, +5', '#EB0026', 'Sigurd Hofmann et al. (GSI Darmstadt)', '1994', 'Named in honor of Wilhelm Conrad Röntgen, discoverer of X-rays.', ['Relativistic coinage-metal orbital contraction studies']],
  [112, 'Cn', 'Copernicium', 285, 'transition-metal', 12, 7, 7, 12, 'd', '[Rn] 5f¹⁴ 6d¹⁰ 7s²', [2, 8, 18, 32, 32, 18, 2], null, null, 1155, 14.0, 283, 340, 'Synthetic', '+2', '#EB0026', 'Sigurd Hofmann et al. (GSI Darmstadt)', '1996', 'Named after astronomer Nicolaus Copernicus. Extreme relativistic stabilization of the closed 7s² shell makes Copernicium volatile like a noble gas or mercury at room temperature.', ['Gold-surface thermochromatography adsorption experiments']],
  [113, 'Nh', 'Nihonium', 286, 'post-transition-metal', 13, 7, 7, 13, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', [2, 8, 18, 32, 32, 18, 3], null, null, 705, 16, 700, 1430, 'Synthetic', '+1, +3', '#EB0026', 'Kosuke Morita et al. (RIKEN)', '2004', 'The first element discovered in Asia, synthesized at RIKEN in Wako, Japan; named from Nihon ("Japan").', ['Superheavy p-block volatility & adsorption studies']],
  [114, 'Fl', 'Flerovium', 289, 'post-transition-metal', 14, 7, 7, 14, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', [2, 8, 18, 32, 32, 18, 4], null, null, 824, 11.4, 284, 380, 'Synthetic', '+2', '#EB0026', 'Yuri Oganessian et al. (JINR Dubna & LLNL)', '1999', 'Named after the Flerov Laboratory of Nuclear Reactions (and Georgy Flyorov). Spin-orbit splitting creates a quasi-closed 7s² 7p₁/₂² subshell.', ['Island of Stability (Z=114, N=184) nuclear structure physics']],
  [115, 'Mc', 'Moscovium', 290, 'post-transition-metal', 15, 7, 7, 15, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', [2, 8, 18, 32, 32, 18, 5], null, null, 538, 13.5, 670, 1400, 'Synthetic', '+1, +3', '#EB0026', 'Yuri Oganessian et al. (JINR Dubna & LLNL)', '2003', 'Synthesized via hot fusion of Ca-48 and Am-243; alpha-decays directly into Nihonium.', ['Hot-fusion recoil separator nuclear physics']],
  [116, 'Lv', 'Livermorium', 293, 'post-transition-metal', 16, 7, 7, 16, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', [2, 8, 18, 32, 32, 18, 6], null, null, 663, 12.9, 709, 1085, 'Synthetic', '+2, +4', '#EB0026', 'Yuri Oganessian et al. (JINR Dubna & LLNL)', '2000', 'Named in honor of Lawrence Livermore National Laboratory and the city of Livermore, California.', ['Superheavy chalcogen nuclear synthesis']],
  [117, 'Ts', 'Tennessine', 294, 'halogen', 17, 7, 7, 17, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', [2, 8, 18, 32, 32, 18, 7], null, null, 743, 7.2, 723, 883, 'Synthetic', '-1, +1, +3', '#EB0026', 'JINR, ORNL, Vanderbilt University & LLNL', '2010', 'Named after the state of Tennessee (home to Oak Ridge National Laboratory and Vanderbilt University, which supplied the rare Bk-249 target).', ['Relativistic metalloid-like halogen behavior modeling']],
  [118, 'Og', 'Oganesson', 294, 'noble-gas', 18, 7, 7, 18, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', [2, 8, 18, 32, 32, 18, 8], null, null, 860, 7.2, 325, 450, 'Synthetic', '0, +2, +4', '#EB0026', 'Yuri Oganessian et al. (JINR Dubna & LLNL)', '2002', 'Completes the 7th period of the periodic table; named in honor of nuclear physicist Yuri Oganessian. Predicted by relativistic Dirac-Fock calculations to be a solid semiconductor at STP rather than a gas.', ['Relativistic Fermi-gas electron localization studies']],
];

export const ELEMENTS: ChemicalElement[] = RAW_ELEMENTS.map((r) => ({
  number: r[0],
  symbol: r[1],
  name: r[2],
  atomicMass: r[3],
  category: r[4],
  group: r[5],
  period: r[6],
  gridRow: r[7],
  gridCol: r[8],
  block: r[9],
  electronConfig: r[10],
  shells: r[11],
  electronegativity: r[12],
  atomicRadius: r[13],
  ionizationEnergy: r[14],
  density: r[15],
  meltingPoint: r[16],
  boilingPoint: r[17],
  standardState: r[18],
  oxidationStates: r[19],
  cpkColor: r[20],
  discoveredBy: r[21],
  discoveryYear: r[22],
  history: r[23],
  applications: r[24],
}));

export const ELEMENT_BY_SYMBOL: Record<string, ChemicalElement> = Object.fromEntries(
  ELEMENTS.map((el) => [el.symbol, el])
);

export const ELEMENT_BY_NUMBER: Record<number, ChemicalElement> = Object.fromEntries(
  ELEMENTS.map((el) => [el.number, el])
);

export function getPhaseAtTemperature(
  el: ChemicalElement,
  tempK: number
): 'Solid' | 'Liquid' | 'Gas' | 'Unknown' {
  if (el.meltingPoint === null) {
    return el.standardState === 'Synthetic' ? 'Unknown' : el.standardState;
  }
  if (tempK < el.meltingPoint) return 'Solid';
  if (el.boilingPoint === null || tempK < el.boilingPoint) return 'Liquid';
  return 'Gas';
}
