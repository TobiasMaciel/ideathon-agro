// Contrato de la API (back) consumida por el front.
import type { Alternative, Buyer, Generator, Material, Source } from '../data/types';
import type { Assumption, AssumptionKey } from '../data/assumptions';
import type { MaterialState, ViabilityResult } from '../viability/types';

/** De dónde salen los datos: la base de datos si está configurada; si no, los datos locales de core. */
export type DataOrigin = 'database' | 'local';

/** GET /api/catalog — todo lo que necesita el front para calcular en el cliente. */
export interface CatalogResponse {
  origin: DataOrigin;
  sources: Source[];
  materials: Material[];
  alternatives: Alternative[];
  assumptions: Assumption[];
  generators: Generator[];
  buyers: Buyer[];
}

/** GET /api/generators?material=<MaterialId> */
export interface GeneratorsResponse {
  origin: DataOrigin;
  generators: Generator[];
}

/** GET /api/buyers?sector=<BuyerSector>&accepts=<MaterialId> */
export interface BuyersResponse {
  origin: DataOrigin;
  buyers: Buyer[];
}

/** POST /api/viability */
export interface ViabilityRequest {
  generatorId: string;
  buyerId: string;
  state: MaterialState;
  overrides?: Partial<Record<AssumptionKey, number>>;
}

export interface ViabilityResponse {
  origin: DataOrigin;
  request: ViabilityRequest;
  result: ViabilityResult;
}

export interface ApiError {
  error: string;
}

/** POST /api/listings (201). `origin` indica dónde quedó guardada: 'database' (Postgres) o 'local' (memoria, modo demo). */
export interface ListingCreatedResponse {
  origin: DataOrigin;
  kind: 'oferta' | 'demanda';
  /** Generator si es oferta, Buyer si es demanda; con `origin: 'publicacion'` y `verified: false` (sin contacto). */
  listing: Generator | Buyer;
}

/** POST /api/listings (400): validación. */
export interface ListingValidationError extends ApiError {
  details: string[];
}

/** GET /api/listings/:id/contact */
export interface ListingContactResponse {
  /** Quién atiende: la empresa (contacto corporativo curado), quien publicó, o la plataforma como intermediaria. */
  via?: 'empresa' | 'publicacion' | 'plataforma';
  name?: string;
  phone?: string;
  email?: string;
  /** Solo si hay teléfono. */
  whatsappUrl?: string;
  /** Solo en establecimientos curados: sitio oficial. */
  website?: string;
  /** Solo en establecimientos curados: página oficial de donde sale el contacto (primera fuente). */
  sourceUrl?: string;
  /** Solo con `via: 'plataforma'`: asunto sugerido para el mailto. */
  mailtoSubject?: string;
}
