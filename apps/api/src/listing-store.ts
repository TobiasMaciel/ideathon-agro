import { createDbContactSource, createDbListingSource } from '@mapa/db';
import { curatedContacts } from '@mapa/core/data';
import type { CuratedContact } from '@mapa/core/data';
import type { ListingInput, StoredListing } from '@mapa/core/listings';
import type { Env } from './env';

/** Dónde viven las publicaciones abiertas: Postgres (con DATABASE_URL) o memoria del isolate (modo demo). */
export interface ListingStore {
  list(): Promise<StoredListing[]>;
  /** `id` es el uuid sin el prefijo `pub-`. */
  get(id: string): Promise<StoredListing | undefined>;
  add(input: ListingInput, ipHash: string): Promise<StoredListing>;
}

export const MEMORY_LISTINGS_MAX = 500;

const memory: StoredListing[] = [];

/**
 * Modo demo: módulo singleton en memoria del isolate (se pierde al reiniciar y no se comparte entre isolates).
 * Tope de 500: al llegar, descarta la más antigua.
 */
export const memoryListingStore: ListingStore & { clear(): void } = {
  async list() {
    return [...memory];
  },
  async get(id) {
    return memory.find((l) => l.id === id);
  },
  async add(input) {
    const stored: StoredListing = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), input };
    memory.push(stored);
    if (memory.length > MEMORY_LISTINGS_MAX) memory.splice(0, memory.length - MEMORY_LISTINGS_MAX);
    return stored;
  },
  clear() {
    memory.length = 0;
  },
};

export function createDbListingStore(url: string): ListingStore {
  return createDbListingSource(url);
}

/** Con `DATABASE_URL` usa Postgres; si no, la memoria. */
export const getListingStore = (env: Pick<Env, 'DATABASE_URL'>): ListingStore =>
  env.DATABASE_URL ? createDbListingStore(env.DATABASE_URL) : memoryListingStore;

/** Contactos corporativos de los establecimientos curados (nunca viajan en /api/catalog). */
export interface ContactStore {
  get(entityId: string): Promise<CuratedContact | undefined>;
}

/** Con `DATABASE_URL` lee la tabla `contacts`; si no, los de @mapa/core. */
export const getContactStore = (env: Pick<Env, 'DATABASE_URL'>): ContactStore =>
  env.DATABASE_URL
    ? createDbContactSource(env.DATABASE_URL)
    : { get: async (id) => curatedContacts.find((c) => c.entityId === id) };
