import type { Assumption } from '../data/assumptions';
import type {
  Alternative,
  AlternativeId,
  Buyer,
  BuyerSector,
  DataLabel,
  Generator,
  GeneratorKind,
  Material,
  MaterialId,
  MaterialState,
  Source,
  Tagged,
  TaggedStateSpec,
} from '../data/types';

// Trazabilidad en la base: cada fila de las tablas con valores etiquetados tiene una columna
// `meta jsonb` con un objeto { campo: { tag, sourceIds, note } } (nombres de campo en camelCase,
// igual que en src/data). `assumptions` tiene columnas planas porque es un solo valor por fila.

export interface MetaEntry {
  tag: DataLabel;
  sourceIds: string[];
  note?: string;
}
export type Meta = Record<string, MetaEntry>;

export interface SourceRow {
  id: string;
  title: string;
  url: string;
  date: string;
}
export interface MaterialRow {
  id: MaterialId;
  name: string;
  raw_moisture: number;
  meta: Meta;
}
export interface MaterialStateRow {
  material_id: MaterialId;
  state: MaterialState;
  bulk_density_t_per_m3: number;
  moisture: number;
  lhv_mj_per_kg: number;
  price_per_ton: number;
  conditioning_cost_per_ton: number;
  meta: Meta;
}
export interface AlternativeRow {
  id: AlternativeId;
  name: string;
  unit: string;
  price_per_unit: number;
  lhv_mj_per_unit: number;
  efficiency: number;
  biomass_efficiency: number;
  meta: Meta;
}
export interface AssumptionRow {
  key: string;
  label: string;
  unit: string;
  value: number;
  tag: DataLabel;
  source_ids: string[];
  note: string | null;
}
export interface GeneratorRow {
  id: string;
  name: string;
  kind: GeneratorKind;
  locality: string;
  lat: number;
  lng: number;
  location_note: string;
  material_id: MaterialId;
  tons_per_month: number;
  seasonality: string;
  source_ids: string[];
  meta: Meta;
}
export interface BuyerRow {
  id: string;
  name: string;
  sector: BuyerSector;
  locality: string;
  lat: number;
  lng: number;
  location_note: string;
  current_alternative: AlternativeId;
  demand_tons_per_month: number;
  accepts: MaterialId[];
  source_ids: string[];
  meta: Meta;
}

export interface DataSet {
  sources: Source[];
  materials: Material[];
  alternatives: Alternative[];
  assumptions: Assumption[];
  generators: Generator[];
  buyers: Buyer[];
}

export interface DbRows {
  sources: SourceRow[];
  materials: MaterialRow[];
  material_states: MaterialStateRow[];
  alternatives: AlternativeRow[];
  assumptions: AssumptionRow[];
  generators: GeneratorRow[];
  buyers: BuyerRow[];
}

const STATES: MaterialState[] = ['suelto', 'compactado', 'pellet'];

const metaOf = (t: Tagged<unknown>): MetaEntry => {
  const e: MetaEntry = { tag: t.tag, sourceIds: [...t.sourceIds] };
  if (t.note !== undefined) e.note = t.note;
  return e;
};
const tagged = <T>(value: T, m: MetaEntry): Tagged<T> => {
  const t: Tagged<T> = { value, tag: m.tag, sourceIds: [...m.sourceIds] };
  if (m.note !== undefined) t.note = m.note;
  return t;
};

export function toRows(data: DataSet): DbRows {
  const material_states: MaterialStateRow[] = [];
  for (const m of data.materials) {
    for (const state of STATES) {
      const s = m.states[state];
      if (!s) continue;
      material_states.push({
        material_id: m.id,
        state,
        bulk_density_t_per_m3: s.bulkDensityTPerM3.value,
        moisture: s.moisture.value,
        lhv_mj_per_kg: s.lhvMJPerKg.value,
        price_per_ton: s.pricePerTon.value,
        conditioning_cost_per_ton: s.conditioningCostPerTon.value,
        meta: {
          bulkDensityTPerM3: metaOf(s.bulkDensityTPerM3),
          moisture: metaOf(s.moisture),
          lhvMJPerKg: metaOf(s.lhvMJPerKg),
          pricePerTon: metaOf(s.pricePerTon),
          conditioningCostPerTon: metaOf(s.conditioningCostPerTon),
        },
      });
    }
  }
  return {
    sources: data.sources.map((s) => ({ id: s.id, title: s.title, url: s.url, date: s.date })),
    materials: data.materials.map((m) => ({
      id: m.id,
      name: m.name,
      raw_moisture: m.rawMoisture.value,
      meta: { rawMoisture: metaOf(m.rawMoisture) },
    })),
    material_states,
    alternatives: data.alternatives.map((a) => ({
      id: a.id,
      name: a.name,
      unit: a.unit,
      price_per_unit: a.pricePerUnit.value,
      lhv_mj_per_unit: a.lhvMJPerUnit.value,
      efficiency: a.efficiency.value,
      biomass_efficiency: a.biomassEfficiency.value,
      meta: {
        pricePerUnit: metaOf(a.pricePerUnit),
        lhvMJPerUnit: metaOf(a.lhvMJPerUnit),
        efficiency: metaOf(a.efficiency),
        biomassEfficiency: metaOf(a.biomassEfficiency),
      },
    })),
    assumptions: data.assumptions.map((a) => ({
      key: a.key,
      label: a.label,
      unit: a.unit,
      value: a.value,
      tag: a.tag,
      source_ids: [...a.sourceIds],
      note: a.note ?? null,
    })),
    generators: data.generators.map((g) => ({
      id: g.id,
      name: g.name,
      kind: g.kind,
      locality: g.locality,
      lat: g.location.lat,
      lng: g.location.lng,
      location_note: g.locationNote,
      material_id: g.materialId,
      tons_per_month: g.tonsPerMonth.value,
      seasonality: g.seasonality,
      source_ids: [...g.sourceIds],
      meta: { tonsPerMonth: metaOf(g.tonsPerMonth) },
    })),
    buyers: data.buyers.map((b) => ({
      id: b.id,
      name: b.name,
      sector: b.sector,
      locality: b.locality,
      lat: b.location.lat,
      lng: b.location.lng,
      location_note: b.locationNote,
      current_alternative: b.currentAlternative,
      demand_tons_per_month: b.demandTonsPerMonth.value,
      accepts: [...b.accepts],
      source_ids: [...b.sourceIds],
      meta: {
        currentAlternative: metaOf(b.currentAlternativeTag),
        demandTonsPerMonth: metaOf(b.demandTonsPerMonth),
      },
    })),
  };
}

/** Solo se confía en URLs http(s); cualquier otra (javascript:, data:) se reemplaza por '#'. */
const safeUrl = (url: string): string => (/^https?:\/\//i.test(url) ? url : '#');

export function fromRows(rows: DbRows): DataSet {
  return {
    sources: rows.sources.map((s) => ({ id: s.id, title: s.title, url: safeUrl(s.url), date: s.date })),
    materials: rows.materials.map((m): Material => {
      const states: Material['states'] = {};
      for (const r of rows.material_states.filter((x) => x.material_id === m.id)) {
        const spec: TaggedStateSpec = {
          bulkDensityTPerM3: tagged(r.bulk_density_t_per_m3, r.meta.bulkDensityTPerM3),
          moisture: tagged(r.moisture, r.meta.moisture),
          lhvMJPerKg: tagged(r.lhv_mj_per_kg, r.meta.lhvMJPerKg),
          pricePerTon: tagged(r.price_per_ton, r.meta.pricePerTon),
          conditioningCostPerTon: tagged(r.conditioning_cost_per_ton, r.meta.conditioningCostPerTon),
        };
        states[r.state] = spec;
      }
      return { id: m.id, name: m.name, rawMoisture: tagged(m.raw_moisture, m.meta.rawMoisture), states };
    }),
    alternatives: rows.alternatives.map((a) => ({
      id: a.id,
      name: a.name,
      unit: a.unit,
      pricePerUnit: tagged(a.price_per_unit, a.meta.pricePerUnit),
      lhvMJPerUnit: tagged(a.lhv_mj_per_unit, a.meta.lhvMJPerUnit),
      efficiency: tagged(a.efficiency, a.meta.efficiency),
      biomassEfficiency: tagged(a.biomass_efficiency, a.meta.biomassEfficiency),
    })),
    assumptions: rows.assumptions.map((a): Assumption => {
      const out: Assumption = {
        key: a.key as Assumption['key'],
        label: a.label,
        unit: a.unit,
        value: a.value,
        tag: a.tag,
        sourceIds: [...a.source_ids],
      };
      if (a.note !== null) out.note = a.note;
      return out;
    }),
    generators: rows.generators.map((g) => ({
      id: g.id,
      name: g.name,
      kind: g.kind,
      locality: g.locality,
      location: { lat: g.lat, lng: g.lng },
      locationNote: g.location_note,
      materialId: g.material_id,
      tonsPerMonth: tagged(g.tons_per_month, g.meta.tonsPerMonth),
      seasonality: g.seasonality,
      sourceIds: [...g.source_ids],
    })),
    buyers: rows.buyers.map((b) => ({
      id: b.id,
      name: b.name,
      sector: b.sector,
      locality: b.locality,
      location: { lat: b.lat, lng: b.lng },
      locationNote: b.location_note,
      currentAlternative: b.current_alternative,
      currentAlternativeTag: tagged(b.current_alternative, b.meta.currentAlternative),
      demandTonsPerMonth: tagged(b.demand_tons_per_month, b.meta.demandTonsPerMonth),
      accepts: [...b.accepts],
      sourceIds: [...b.source_ids],
    })),
  };
}
