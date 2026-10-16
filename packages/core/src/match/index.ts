import type { Assumption, AssumptionKey } from '../data/assumptions';
import type { Alternative, Buyer, Generator, Material } from '../data/types';
import {
  evaluateViability,
  maxViableDistanceKm,
  type MaterialState,
  type MaterialStateSpec,
  type ViabilityInput,
  type ViabilityResult,
} from '../viability';

/** Supuestos editados en la UI (solo para la sesión). */
export type Overrides = Partial<Record<AssumptionKey, number>>;

const STATE_ORDER: MaterialState[] = ['suelto', 'compactado', 'pellet'];

export function assumptionValues(assumptions: Assumption[], overrides: Overrides = {}): Record<AssumptionKey, number> {
  const values = {} as Record<AssumptionKey, number>;
  for (const a of assumptions) values[a.key] = overrides[a.key] ?? a.value;
  return values;
}

export function availableStates(material: Material): MaterialState[] {
  return STATE_ORDER.filter((s) => material.states[s] !== undefined);
}

/** Estado del material con el `.value` de cada campo. */
function plainState(material: Material, state: MaterialState): MaterialStateSpec {
  const spec = material.states[state];
  if (!spec) throw new Error(`El material "${material.id}" no tiene el estado "${state}"`);
  return {
    bulkDensityTPerM3: spec.bulkDensityTPerM3.value,
    moisture: spec.moisture.value,
    lhvMJPerKg: spec.lhvMJPerKg.value,
    pricePerTon: spec.pricePerTon.value,
    conditioningCostPerTon: spec.conditioningCostPerTon.value,
  };
}

function freightFrom(values: Record<AssumptionKey, number>) {
  return {
    truck: { maxTons: values.truckMaxTons, volumeM3: values.truckVolumeM3 },
    costPerKm: values.costPerKm,
    routeFactor: values.routeFactor,
  };
}

interface MatchArgs {
  generator: Generator;
  buyer: Buyer;
  material: Material;
  state: MaterialState;
  alternatives: Alternative[];
  assumptions: Assumption[];
  overrides?: Overrides;
}

export function buildViabilityInput(args: MatchArgs): ViabilityInput {
  const { generator, buyer, material, state, alternatives, assumptions, overrides } = args;
  const values = assumptionValues(assumptions, overrides);
  const alt = alternatives.find((a) => a.id === buyer.currentAlternative);
  if (!alt) throw new Error(`No hay alternativa "${buyer.currentAlternative}" para el comprador "${buyer.id}"`);
  if (alt.unit !== 'kg') {
    throw new Error(`La unidad "${alt.unit}" de la alternativa "${alt.id}" no está soportada (solo kg)`);
  }
  const productState = plainState(material, state);
  // La demanda del comprador está en t de SU combustible actual. Se convierte a t de este producto por
  // equivalencia energética (MJ útiles): t_alt × PCI_alt × ef_alt = t_prod × PCI_prod × ef_biomasa.
  // Como el PCI es por kg, la proporción es la misma por tonelada.
  const demandInProductTons =
    (buyer.demandTonsPerMonth.value * alt.lhvMJPerUnit.value * alt.efficiency.value) /
    (productState.lhvMJPerKg * alt.biomassEfficiency.value);
  return {
    origin: generator.location,
    destination: buyer.location,
    rawTonsPerMonth: generator.tonsPerMonth.value,
    rawMoisture: material.rawMoisture.value,
    buyerMaxTonsPerMonth: demandInProductTons,
    state: productState,
    freight: freightFrom(values),
    alternative: {
      kind: 'energia',
      pricePerUnit: alt.pricePerUnit.value,
      lhvMJPerUnit: alt.lhvMJPerUnit.value,
      efficiency: alt.efficiency.value,
      biomassEfficiency: alt.biomassEfficiency.value,
    },
    greenThreshold: values.greenThreshold,
  };
}

export function evaluateMatch(args: MatchArgs): ViabilityResult {
  return evaluateViability(buildViabilityInput(args));
}

export interface RankedBuyer {
  buyer: Buyer;
  result: ViabilityResult;
}

/** Compradores que aceptan el material del generador, de mejor a peor margen mensual. */
export function rankBuyers(args: {
  generator: Generator;
  state: MaterialState;
  buyers: Buyer[];
  materials: Material[];
  alternatives: Alternative[];
  assumptions: Assumption[];
  overrides?: Overrides;
}): RankedBuyer[] {
  const { generator, state, buyers, materials, ...rest } = args;
  const material = materials.find((m) => m.id === generator.materialId);
  if (!material) throw new Error(`No existe el material "${generator.materialId}"`);
  return buyers
    .filter((b) => b.accepts.includes(material.id))
    .map((buyer) => ({ buyer, result: evaluateMatch({ generator, buyer, material, state, ...rest }) }))
    .sort((a, b) => b.result.marginPerMonth - a.result.marginPerMonth);
}

/** Radio en línea recta para dibujar en el mapa: radio por ruta / factor de ruta, acotado a [0, 1500] km. */
export function viableRadiusMapKm(
  material: Material,
  state: MaterialState,
  assumptions: Assumption[],
  overrides?: Overrides,
): number {
  const values = assumptionValues(assumptions, overrides);
  const freight = freightFrom(values);
  const km = maxViableDistanceKm(plainState(material, state), freight) / freight.routeFactor;
  return Number.isFinite(km) ? Math.min(1500, Math.max(0, km)) : 0;
}
