import type { DataLabel, LatLng, MaterialState, MaterialStateSpec } from '@/lib/viability/types';

export interface Source {
  id: string;
  title: string;
  url: string;
  /** Fecha del dato (ISO yyyy-mm o yyyy-mm-dd). */
  date: string;
}

/** Valor con trazabilidad: etiqueta, fuente y nota de cómo se obtuvo. */
export interface Tagged<T = number> {
  value: T;
  tag: DataLabel;
  sourceIds: string[];
  note?: string;
}

export type MaterialId = 'aserrin' | 'chips' | 'costaneros' | 'cascarilla';

export interface Material {
  id: MaterialId;
  name: string;
  /** Humedad típica del material crudo en origen (0–1). */
  rawMoisture: Tagged;
  states: Partial<Record<MaterialState, TaggedStateSpec>>;
}

/** Cada campo del estado lleva su propia trazabilidad. */
export type TaggedStateSpec = { [K in keyof MaterialStateSpec]: Tagged };

export type GeneratorKind = 'aserradero' | 'molino_arrocero' | 'foresto_industria';

export interface Generator {
  id: string;
  name: string;
  kind: GeneratorKind;
  locality: string;
  location: LatLng;
  locationNote: string;
  materialId: MaterialId;
  tonsPerMonth: Tagged;
  seasonality: string;
  sourceIds: string[];
}

export type BuyerSector =
  | 'yerbatera'
  | 'central_biomasa'
  | 'citricola'
  | 'secadero_granos'
  | 'frigorifico';

export type AlternativeId = 'glp' | 'lena';

export interface Buyer {
  id: string;
  name: string;
  sector: BuyerSector;
  locality: string;
  location: LatLng;
  locationNote: string;
  /** Combustible que usa hoy (clave de `alternatives`). */
  currentAlternative: AlternativeId;
  currentAlternativeTag: Tagged<AlternativeId>;
  demandTonsPerMonth: Tagged;
  accepts: MaterialId[];
  sourceIds: string[];
}

/** Combustible actual del comprador (alternativa de tipo energía del modelo). */
export interface Alternative {
  id: AlternativeId;
  name: string;
  /** Unidad de compra (kg, t...). */
  unit: string;
  pricePerUnit: Tagged;
  lhvMJPerUnit: Tagged;
  efficiency: Tagged;
  biomassEfficiency: Tagged;
}

export type { DataLabel, LatLng, MaterialState };
