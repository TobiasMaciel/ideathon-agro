// Raíz de composición: el ÚNICO lugar que conoce @mapa/db y los adaptadores. Decide por request si los
// repositorios son Postgres o memoria/local, y define la degradación cuando la base falla.
import type { CatalogRepository, ContactDirectory, ListingRepository } from '@mapa/core/ports';
import { createDb, createPgRepositories, type DbConnection } from '@mapa/db';
import { hashIp } from './adapters/ip-hash';
import { createLocalCatalogRepository } from './adapters/local-catalog-repository';
import { createLocalContactDirectory } from './adapters/local-contact-directory';
import { createMemoryListingRepository } from './adapters/memory-listing-repository';
import { createMemoryRateLimiter, unlimitedRateLimiter } from './adapters/memory-rate-limiter';
import type { Deps } from './application/deps';
import { parseConfig } from './config';
import type { MakeDeps } from './http/middlewares/deps';

const reason = (e: unknown) => (e instanceof Error ? e.message : String(e));

// --- Degradación (D6): si Postgres falla, la lectura sigue con lo local; la escritura no se esconde. ---

/** Catálogo: si la base falla al cargar, los datos curados de core. */
export const catalogWithFallback = (primary: CatalogRepository, fallback: CatalogRepository): CatalogRepository => ({
  async load() {
    try {
      return await primary.load();
    } catch (e) {
      console.error('Base de datos no disponible, uso datos locales:', reason(e));
      return fallback.load();
    }
  },
  ping: () => primary.ping().catch(() => false),
});

/** Publicaciones: si la base falla al listar, el catálogo sale solo con lo curado. `get`/`add` no se disimulan. */
export const listingsWithFallback = (primary: ListingRepository): ListingRepository => ({
  async list() {
    try {
      return await primary.list();
    } catch (e) {
      console.error('Publicaciones no disponibles, devuelvo solo lo curado:', reason(e));
      return [];
    }
  },
  get: (id) => primary.get(id),
  add: (input, ipHash) => primary.add(input, ipHash),
});

/** Contactos curados: si la base falla, los de core. */
export const contactsWithFallback = (primary: ContactDirectory, fallback: ContactDirectory): ContactDirectory => ({
  async get(id) {
    try {
      return await primary.get(id);
    } catch (e) {
      console.error('Contactos no disponibles en la base, uso los locales:', reason(e));
      return fallback.get(id);
    }
  },
});

export interface CompositionOptions {
  /** Abre la conexión a Postgres (en tests, PGlite o un fake). */
  connect?: (url: string) => DbConnection;
}

/**
 * Arma `MakeDeps`. El estado en memoria (publicaciones del modo demo y límites por IP) vive una vez por
 * isolate; la conexión a Postgres se abre por request y se cierra al terminarlo (D4).
 */
export function createComposition({ connect = createDb }: CompositionOptions = {}): MakeDeps {
  const localCatalog = createLocalCatalogRepository();
  const localContacts = createLocalContactDirectory();
  const memoryListings = createMemoryListingRepository();
  const rateLimiter = createMemoryRateLimiter();

  return (env) => {
    const config = parseConfig(env);
    const common: Pick<Deps, 'rateLimiter' | 'hashIp' | 'platformContact'> = {
      rateLimiter: config.rateLimitDisabled ? unlimitedRateLimiter : rateLimiter,
      hashIp: (ip) => hashIp(ip, config.ipSalt),
      platformContact: config.platformContact,
    };
    if (!config.databaseUrl) {
      const deps: Deps = { ...common, origin: 'local', catalog: localCatalog, listings: memoryListings, contacts: localContacts };
      return { deps, close: async () => {} };
    }
    const { db, close } = connect(config.databaseUrl);
    const pg = createPgRepositories(db);
    const deps: Deps = {
      ...common,
      origin: 'database',
      catalog: catalogWithFallback(pg.catalog, localCatalog),
      listings: listingsWithFallback(pg.listings),
      contacts: contactsWithFallback(pg.contacts, localContacts),
    };
    return { deps, close };
  };
}

/** Composición del Worker: una por isolate. */
export const defaultDeps = createComposition();
