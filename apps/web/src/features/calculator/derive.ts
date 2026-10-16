// Lo que la calculadora muestra a partir del catálogo y del estado de la UI (lógica pura, sin React).
import type { CatalogResponse, Generator, Material, MaterialState, TrafficLight } from '@mapa/core/contracts';
import { assumptionValues, availableStates, orderRanking, rankBuyers, viableRadiusMapKm, type RankedBuyer } from '@mapa/core/match';
import type { DataItem } from '@/features/sources';
import { formatArs, formatNumber, formatTons } from '@/shared/format';
import type { Kpi } from './KpiStrip';
import type { AppState } from './state';
import type { StateStat } from './StateSelector';

/** Planta elegida al abrir: Molinos Ala (el guion de la demo) si está; si no, la primera. */
export const DEFAULT_GENERATOR = 'molinos-ala-mercedes';

export function defaultGeneratorId(catalog: CatalogResponse): string {
  return catalog.generators.some((g) => g.id === DEFAULT_GENERATOR) ? DEFAULT_GENERATOR : (catalog.generators[0]?.id ?? '');
}

export interface Derived {
  states: MaterialState[];
  state: MaterialState;
  ranking: RankedBuyer[];
  lights: Record<string, TrafficLight>;
  mapKm: number;
  roadKm: number;
  values: ReturnType<typeof assumptionValues>;
  buyers: CatalogResponse['buyers'];
}

export function derive(catalog: CatalogResponse, generator: Generator, material: Material, app: AppState): Derived {
  const states = availableStates(material);
  const state = states.includes(app.state) ? app.state : 'suelto';
  const buyers = catalog.buyers.filter((b) => app.sectors.length === 0 || app.sectors.includes(b.sector));
  const ranking = orderRanking(
    rankBuyers({
      generator,
      state,
      buyers,
      materials: catalog.materials,
      alternatives: catalog.alternatives,
      assumptions: catalog.assumptions,
      overrides: app.overrides,
    }),
  );
  const lights: Record<string, TrafficLight> = {};
  for (const r of ranking) lights[r.buyer.id] = r.result.light;
  const mapKm = viableRadiusMapKm(material, state, catalog.assumptions, app.overrides);
  const values = assumptionValues(catalog.assumptions, app.overrides);
  return { states, state, buyers, ranking, lights, mapKm, roadKm: mapKm * values.routeFactor, values };
}

export function countLights(ranking: RankedBuyer[]): Record<TrafficLight, number> {
  const counts = { verde: 0, amarillo: 0, rojo: 0 };
  for (const r of ranking) counts[r.result.light] += 1;
  return counts;
}

/** Qué pasaría con cada estado disponible (radio por ruta y cuántos cierran), para las cards de "Cómo lo vendés". */
export function stateStats(catalog: CatalogResponse, generator: Generator, material: Material, app: AppState, d: Derived) {
  const stats: Partial<Record<MaterialState, StateStat>> = {};
  for (const st of d.states) {
    try {
      const alt = st === d.state ? d : derive(catalog, generator, material, { ...app, state: st });
      stats[st] = { radiusKm: alt.roadKm, closes: alt.ranking.filter((r) => r.result.light === 'verde').length };
    } catch {
      /* sin dato para ese estado */
    }
  }
  return stats;
}

/** Plantas que se ven en el mapa: las de los materiales filtrados, y siempre la elegida. */
export function mapGenerators(catalog: CatalogResponse, generatorId: string, materials: AppState['materials']): Generator[] {
  return catalog.generators.filter((g) => g.id === generatorId || materials.length === 0 || materials.includes(g.materialId));
}

const STATE_WORD: Record<MaterialState, string> = { suelto: 'suelto', compactado: 'compactado', pellet: 'en pellet' };

export function buildKpis(catalog: CatalogResponse, d: Derived, onMap: number): Kpi[] {
  const closes = countLights(d.ranking).verde;
  return [
    { label: 'Plantas', value: formatNumber(catalog.generators.length), sub: `${onMap} en el mapa` },
    {
      label: 'Toneladas/mes',
      value: formatNumber(catalog.generators.reduce((sum, g) => sum + g.tonsPerMonth.value, 0)),
      sub: 'disponibles',
    },
    { label: 'Compradores', value: formatNumber(catalog.buyers.length), sub: `${d.ranking.length} para este material` },
    {
      label: 'Cierran',
      value: `${closes} de ${d.ranking.length}`,
      sub: `vendiendo ${STATE_WORD[d.state]}`,
      tone: closes > 0 ? 'ok' : 'bad',
    },
  ];
}

/** Filas de la pestaña Fuentes: cada valor usado en el cálculo, con su etiqueta real/estimado. */
export function dataItems(catalog: CatalogResponse, generator: Generator, material: Material, d: Derived, selected: RankedBuyer | undefined): DataItem[] {
  const items: DataItem[] = [];
  const spec = material.states[d.state];
  if (spec) {
    items.push(
      { label: 'Precio de venta', valueText: `${formatArs(spec.pricePerTon.value)}/t`, tagged: spec.pricePerTon },
      { label: 'Densidad', valueText: `${formatNumber(spec.bulkDensityTPerM3.value * 1000)} kg/m³`, tagged: spec.bulkDensityTPerM3 },
      { label: 'Poder calorífico (PCI)', valueText: `${formatNumber(spec.lhvMJPerKg.value, 1)} MJ/kg`, tagged: spec.lhvMJPerKg },
    );
  }
  const costPerKm = catalog.assumptions.find((a) => a.key === 'costPerKm');
  const routeFactor = catalog.assumptions.find((a) => a.key === 'routeFactor');
  if (costPerKm) items.push({ label: 'Costo por km', valueText: `${formatArs(d.values.costPerKm)}/km`, tagged: costPerKm });
  if (routeFactor) items.push({ label: 'Factor de ruta', valueText: `× ${formatNumber(d.values.routeFactor, 2)}`, tagged: routeFactor });
  if (selected) {
    // La demanda está en t/mes del combustible que el comprador usa hoy; el modelo la convierte por energía.
    const alt = catalog.alternatives.find((a) => a.id === selected.buyer.currentAlternative);
    const fuel = alt ? alt.name.split(' (')[0] : 'su combustible';
    items.push({ label: `Consumo actual del comprador (${fuel})`, valueText: `${formatTons(selected.buyer.demandTonsPerMonth.value)}/mes`, tagged: selected.buyer.demandTonsPerMonth });
    if (alt) items.push({ label: `Precio de ${fuel}`, valueText: `${formatArs(alt.pricePerUnit.value)}/${alt.unit}`, tagged: alt.pricePerUnit });
  }
  items.push({ label: 'Generación de la planta', valueText: `${formatTons(generator.tonsPerMonth.value)}/mes`, tagged: generator.tonsPerMonth });
  return items;
}
