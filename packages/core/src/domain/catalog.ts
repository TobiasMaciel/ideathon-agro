// Entidades del catálogo (datos curados y publicaciones mapeadas). Sin I/O ni dependencias externas.
import type { AlternativeId, BuyerSector, DataLabel, GeneratorKind, MaterialId, MaterialState } from './enums';
import type { LatLng, MaterialStateSpec } from './viability/types';

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

export interface Material {
  id: MaterialId;
  name: string;
  /** Humedad típica del material crudo en origen (0–1). */
  rawMoisture: Tagged;
  states: Partial<Record<MaterialState, TaggedStateSpec>>;
}

/** Cada campo del estado lleva su propia trazabilidad. */
export type TaggedStateSpec = { [K in keyof MaterialStateSpec]: Tagged };

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
  /** 'curado' (dato del catálogo) o 'publicacion' (declarado por un usuario). Ausente = curado. */
  origin?: 'curado' | 'publicacion';
  /** false en publicaciones abiertas (sin verificar). Ausente = dato curado con fuentes. */
  verified?: boolean;
  /** Alta de la publicación (ISO). Solo en publicaciones. */
  createdAt?: string;
}

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
  /** 'curado' (dato del catálogo) o 'publicacion' (declarado por un usuario). Ausente = curado. */
  origin?: 'curado' | 'publicacion';
  /** false en publicaciones abiertas (sin verificar). Ausente = dato curado con fuentes. */
  verified?: boolean;
  /** Alta de la publicación (ISO). Solo en publicaciones. */
  createdAt?: string;
}

/**
 * Contacto corporativo público de un establecimiento curado (nunca de una persona). No forma parte de
 * `Generator`/`Buyer`: no viaja en el catálogo, se sirve con GET /api/listings/:id/contact.
 */
export interface CuratedContact {
  /** Id del generador o comprador curado. */
  entityId: string;
  /** Nombre del área o de la empresa. */
  name: string;
  website?: string;
  phone?: string;
  email?: string;
  /** Páginas oficiales de donde sale cada dato. */
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

export type AssumptionKey =
  | 'costPerKm'
  | 'truckMaxTons'
  | 'truckVolumeM3'
  | 'routeFactor'
  | 'greenThreshold'
  | 'usdArs';

/** Supuesto del modelo con trazabilidad (editable en la UI solo para la sesión). */
export interface Assumption extends Tagged {
  key: AssumptionKey;
  label: string;
  unit: string;
}

/** Todo lo que necesita el modelo para calcular: datos curados (y, en la API, las publicaciones mezcladas). */
export interface Catalog {
  sources: Source[];
  materials: Material[];
  alternatives: Alternative[];
  assumptions: Assumption[];
  generators: Generator[];
  buyers: Buyer[];
}

export type { LatLng };
// Los enums (valores y tipos) viajan con las entidades: `@mapa/core/catalog` es la puerta de entrada al modelo.
export * from './enums';
