// Contrato de la API (back) consumida por el front.
import type { Alternative, Buyer, Generator, Material, Source } from '@/data/types';
import type { Assumption, AssumptionKey } from '@/data/assumptions';
import type { MaterialState, ViabilityResult } from '@/lib/viability/types';

/** De dónde salen los datos: Supabase si está configurado; si no, el módulo src/data. */
export type DataOrigin = 'supabase' | 'local';

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
