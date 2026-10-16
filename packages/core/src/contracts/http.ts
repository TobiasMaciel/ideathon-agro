// Contrato HTTP de la API (back) consumida por el front. Solo tipos: depende únicamente de domain.
import type {
  Alternative,
  Assumption,
  AssumptionKey,
  Buyer,
  Generator,
  Material,
  Source,
} from '../domain/catalog';
import type { ContactCard } from '../domain/contact/resolve-contact';
import type { ListingKind } from '../domain/enums';
import type { MaterialState, ViabilityResult } from '../domain/viability/types';

// Entidades que viajan dentro de las respuestas (la web las toma de acá, no de core/data).
export type * from '../domain/catalog';
export type { ListingKind } from '../domain/enums';
export type { ListingInput } from '../domain/listings/types';
export type { DataLabel, LatLng, MaterialState, TrafficLight, ViabilityResult } from '../domain/viability/types';

/** De dónde salen los datos: la base de datos si está configurada y responde; si no, los datos locales de core. */
export type DataOrigin = 'database' | 'local';

/** GET /api/health — el único endpoint que informa el origen de los datos. */
export interface HealthResponse {
  ok: true;
  origin: DataOrigin;
}

/**
 * `origin` ya no se envía fuera de /api/health. Queda opcional (y obsoleto) solo para que compilen los fixtures
 * de la web que todavía lo setean; se borra cuando la web deje de usarlo.
 * @deprecated
 */
interface LegacyOrigin {
  /** @deprecated solo `GET /api/health` informa el origen. */
  origin?: DataOrigin;
}

/** GET /api/catalog — todo lo que necesita el front para calcular en el cliente. */
export interface CatalogResponse extends LegacyOrigin {
  sources: Source[];
  materials: Material[];
  alternatives: Alternative[];
  assumptions: Assumption[];
  generators: Generator[];
  buyers: Buyer[];
}

/** GET /api/generators?material=<MaterialId> */
export interface GeneratorsResponse extends LegacyOrigin {
  generators: Generator[];
}

/** GET /api/buyers?sector=<BuyerSector>&accepts=<MaterialId> */
export interface BuyersResponse extends LegacyOrigin {
  buyers: Buyer[];
}

/** POST /api/viability */
export interface ViabilityRequest {
  generatorId: string;
  buyerId: string;
  state: MaterialState;
  overrides?: Partial<Record<AssumptionKey, number>>;
}

export interface ViabilityResponse extends LegacyOrigin {
  request: ViabilityRequest;
  result: ViabilityResult;
}

export interface ApiError {
  error: string;
}

/** POST /api/listings (201). */
export interface ListingCreatedResponse extends LegacyOrigin {
  kind: ListingKind;
  /** Generator si es oferta, Buyer si es demanda; con `origin: 'publicacion'` y `verified: false` (sin contacto). */
  listing: Generator | Buyer;
}

/** POST /api/listings (400): validación. */
export interface ListingValidationError extends ApiError {
  details: string[];
}

/** GET /api/listings/:id/contact */
export type ListingContactResponse = ContactCard;
