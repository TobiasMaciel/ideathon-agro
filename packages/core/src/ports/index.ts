// Puertos: lo que los casos de uso necesitan del mundo exterior. Los implementan los adaptadores
// `memory-*` / `local-*` (apps/api/src/adapters) y `pg-*` (@mapa/db), siempre con `satisfies`.
import type { Catalog, CuratedContact } from '../domain/catalog';
import type { ListingInput, StoredListing } from '../domain/listings/types';

/** Catálogo curado (sin publicaciones ni contactos). */
export interface CatalogRepository {
  load(): Promise<Catalog>;
  /** true si el origen responde, sin cargar el catálogo (para /api/health). */
  ping(): Promise<boolean>;
}

/** Publicaciones abiertas. */
export interface ListingRepository {
  /** De la más antigua a la más nueva. */
  list(): Promise<StoredListing[]>;
  /** `id` es el uuid sin el prefijo `pub-`; undefined si no existe. */
  get(id: string): Promise<StoredListing | undefined>;
  /** `ipHash` es el hash salado de la IP (nunca la IP en claro). */
  add(input: ListingInput, ipHash: string): Promise<StoredListing>;
}

/** Contactos corporativos públicos de los establecimientos curados. */
export interface ContactDirectory {
  get(entityId: string): Promise<CuratedContact | undefined>;
}

/** Acciones con límite por cliente. */
export type RateLimitBucket = 'create' | 'contact';

export interface RateLimiter {
  /** Registra un intento de `key` en `bucket`; false si superó el límite (los rechazados no cuentan). */
  allow(bucket: RateLimitBucket, key: string): Promise<boolean>;
}
