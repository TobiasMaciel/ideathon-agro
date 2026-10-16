import type { Alternative, Material, Tagged } from '../domain/catalog';

// PCI con humedad: PCI_h = PCI_seco × (1 − h) − 2,44 × h  (MJ/kg; 2,44 = calor latente del agua).
// Madera seca ≈ 19 MJ/kg (Forest Research: chips 30% → 12,5 MJ/kg, consistente con la fórmula).
// Precios en ARS de octubre 2026. Dólar BNA $1.540.

const real = (value: number, sourceIds: string[], note?: string): Tagged => ({ value, tag: 'real', sourceIds, note });
const est = (value: number, sourceIds: string[], note: string): Tagged => ({ value, tag: 'estimado', sourceIds, note });

const INFOPRO_AJUSTE = 'precio InFoPro ago-2025 actualizado +30% a oct-2026 (inflación aprox.)';

export const materials: Material[] = [
  {
    id: 'aserrin',
    name: 'Aserrín de pino',
    rawMoisture: est(0.45, ['forest-research-cv'], 'aserrín verde de aserradero, 45% base húmeda'),
    states: {
      suelto: {
        bulkDensityTPerM3: est(0.31, ['fao-j4504e'], 'FAO 170 kg/m³ en base seca ÷ (1 − 0,45)'),
        moisture: est(0.45, ['forest-research-cv'], 'igual al crudo'),
        lhvMJPerKg: est(9.35, ['forest-research-cv'], '19 × 0,55 − 2,44 × 0,45'),
        pricePerTon: est(25_000, ['infopro-2025-08'], `chip leña $19.303/t, ${INFOPRO_AJUSTE}`),
        conditioningCostPerTon: real(0, [], 'sin acondicionamiento'),
      },
      compactado: {
        bulkDensityTPerM3: est(0.55, ['bp48-cascarilla'], 'briqueta: densidad de unidad 562–965 kg/m³ × ~0,7 de empaquetamiento'),
        moisture: est(0.1, ['dinplus-pellet'], 'secado previo a briquetear'),
        lhvMJPerKg: est(16.86, ['forest-research-cv'], '19 × 0,90 − 2,44 × 0,10'),
        pricePerTon: est(150_000, ['pellet-europa-2026', 'bna-2026-10'], '≈ USD 97/t; 65% del precio de pellet local'),
        conditioningCostPerTon: est(75_000, ['bna-2026-10'], '≈ USD 49/t secado + briqueteado (orden de magnitud de literatura)'),
      },
      pellet: {
        bulkDensityTPerM3: real(0.65, ['forest-research-cv', 'dinplus-pellet']),
        moisture: real(0.1, ['forest-research-cv']),
        lhvMJPerKg: real(17, ['forest-research-cv']),
        pricePerTon: est(230_000, ['pellet-europa-2026', 'bna-2026-10'], '≈ USD 150/t a granel en Argentina (Europa: EUR 400–430/t)'),
        conditioningCostPerTon: est(123_000, ['bna-2026-10'], '≈ USD 80/t secado + pelletizado'),
      },
    },
  },
  {
    id: 'chips',
    name: 'Chips / astillas',
    rawMoisture: est(0.4, ['forest-research-cv'], 'chip verde 35–45%'),
    states: {
      suelto: {
        bulkDensityTPerM3: est(0.25, ['forest-research-cv'], 'Forest Research: 250 kg/m³ a 30%; se usa igual a 40% (orden de magnitud)'),
        moisture: est(0.4, ['forest-research-cv'], 'igual al crudo'),
        lhvMJPerKg: est(10.42, ['forest-research-cv'], '19 × 0,60 − 2,44 × 0,40'),
        pricePerTon: est(25_000, ['infopro-2025-08'], `chip leña $19.303/t, ${INFOPRO_AJUSTE}`),
        conditioningCostPerTon: real(0, [], 'sin acondicionamiento'),
      },
      pellet: {
        bulkDensityTPerM3: real(0.65, ['forest-research-cv']),
        moisture: real(0.1, ['forest-research-cv']),
        lhvMJPerKg: real(17, ['forest-research-cv']),
        pricePerTon: est(230_000, ['pellet-europa-2026', 'bna-2026-10'], '≈ USD 150/t a granel'),
        conditioningCostPerTon: est(123_000, ['bna-2026-10'], '≈ USD 80/t secado + molienda + pelletizado'),
      },
    },
  },
  {
    id: 'costaneros',
    name: 'Costaneros / leña de aserradero',
    rawMoisture: est(0.35, ['forest-research-cv'], 'costanero oreado'),
    states: {
      suelto: {
        bulkDensityTPerM3: real(0.4, ['forest-research-cv'], 'leña estibada 350–500 kg/m³'),
        moisture: est(0.35, ['forest-research-cv'], 'igual al crudo'),
        lhvMJPerKg: est(11.5, ['forest-research-cv'], '19 × 0,65 − 2,44 × 0,35'),
        pricePerTon: est(22_000, ['infopro-2025-08'], `leña $17.374/t, ${INFOPRO_AJUSTE}`),
        conditioningCostPerTon: real(0, [], 'sin acondicionamiento'),
      },
    },
  },
  {
    id: 'cascarilla',
    name: 'Cascarilla de arroz',
    rawMoisture: est(0.1, ['bp48-cascarilla'], 'la cascarilla sale seca del molino (~10%)'),
    states: {
      suelto: {
        bulkDensityTPerM3: real(0.108, ['dyna-2012-cascarilla']),
        moisture: est(0.1, ['bp48-cascarilla'], 'igual al crudo'),
        lhvMJPerKg: real(13.8, ['bp48-cascarilla']),
        pricePerTon: est(15_000, ['bna-2026-10'], '≈ USD 10/t: sin mercado formal, sobreoferta en molinos'),
        conditioningCostPerTon: real(0, [], 'sin acondicionamiento'),
      },
      compactado: {
        bulkDensityTPerM3: est(0.55, ['bp48-cascarilla'], 'briqueta: 562–965 kg/m³ de unidad × ~0,7'),
        moisture: est(0.08, ['bp48-cascarilla'], 'briqueta'),
        lhvMJPerKg: est(14.2, ['bp48-cascarilla'], '13,8 MJ/kg corregido por menor humedad'),
        pricePerTon: est(110_000, ['bna-2026-10'], '≈ USD 71/t, por debajo de la briqueta de madera por mayor ceniza (~20%)'),
        conditioningCostPerTon: est(60_000, ['bna-2026-10'], '≈ USD 39/t briqueteado (sin secado)'),
      },
      pellet: {
        bulkDensityTPerM3: est(0.65, ['dinplus-pellet'], 'pellet de cascarilla a granel 652–693 kg/m³'),
        moisture: est(0.08, ['bp48-cascarilla'], 'pellet'),
        lhvMJPerKg: est(15, ['bp48-cascarilla'], 'pellet de cascarilla 15–16,7 MJ/kg'),
        pricePerTon: est(170_000, ['pellet-europa-2026', 'bna-2026-10'], '≈ USD 110/t: 75% del pellet de madera por mayor ceniza'),
        conditioningCostPerTon: est(110_000, ['bna-2026-10'], '≈ USD 71/t pelletizado (sin secado)'),
      },
    },
  },
];

export const alternatives: Alternative[] = [
  {
    id: 'glp',
    name: 'GLP (gas envasado)',
    unit: 'kg',
    pricePerUnit: real(1_556, ['glp-misiones-2026-02'], 'garrafa 45 kg a $70.000 en Misiones (feb-2026)'),
    lhvMJPerUnit: real(46.3, ['forest-research-cv']),
    efficiency: est(0.85, [], 'caldera a gas convencional'),
    biomassEfficiency: est(0.8, ['forest-research-cv'], 'caldera a biomasa 75–85%'),
  },
  {
    id: 'lena',
    name: 'Leña / chip comprado',
    unit: 'kg',
    pricePerUnit: est(22, ['infopro-2025-08'], `leña $17.374/t, ${INFOPRO_AJUSTE}`),
    lhvMJPerUnit: est(11.5, ['forest-research-cv'], 'leña 35% de humedad: 19 × 0,65 − 2,44 × 0,35'),
    efficiency: est(
      0.5,
      ['as-de-bastos', 'secaderos-chip'],
      'derivado de As de Bastos: 1,5 kg de leña vs 0,8 kg de chip por kg de yerba → la leña rinde ~la mitad por MJ que un quemador de chip',
    ),
    biomassEfficiency: est(0.8, ['forest-research-cv'], 'caldera a biomasa 75–85%'),
  },
];
