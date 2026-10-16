// Dobles para tests: implementan los puertos en memoria, sin Hono ni Postgres.
import type { Catalog } from '@mapa/core/catalog';
import { alternatives, assumptions, buyers, curatedContacts, generators, materials, sources } from '@mapa/core/data';
import type { ListingInput, StoredListing } from '@mapa/core/listings';
import type { CatalogRepository, ContactDirectory, ListingRepository, RateLimiter } from '@mapa/core/ports';
import type { Deps } from '../application/deps';
import type { MakeDeps } from '../http/middlewares/deps';

export const localCatalog = (): Catalog => ({ sources, materials, alternatives, assumptions, generators, buyers });

export function fakeCatalog(catalog: Catalog = localCatalog(), up = true): CatalogRepository {
  return { load: async () => catalog, ping: async () => up };
}

/** Publicaciones en un array, con ids deterministas (`00000000-0000-4000-8000-00000000000N`). */
export function fakeListings(initial: StoredListing[] = []): ListingRepository & { items: StoredListing[]; hashes: string[] } {
  const items = [...initial];
  const hashes: string[] = [];
  return {
    items,
    hashes,
    list: async () => [...items],
    get: async (id) => items.find((l) => l.id === id),
    add: async (input: ListingInput, ipHash: string) => {
      const n = String(items.length + 1).padStart(12, '0');
      const stored = { id: `00000000-0000-4000-8000-${n}`, createdAt: '2026-10-16T12:00:00.000Z', input };
      items.push(stored);
      hashes.push(ipHash);
      return stored;
    },
  };
}

export const fakeContacts = (): ContactDirectory => ({
  get: async (id) => curatedContacts.find((c) => c.entityId === id),
});

/** Permite `max` intentos por bucket+clave (por defecto, sin límite). */
export function fakeRateLimiter(max = Infinity): RateLimiter {
  const count = new Map<string, number>();
  return {
    allow: async (bucket, key) => {
      const k = `${bucket}:${key}`;
      const n = count.get(k) ?? 0;
      if (n >= max) return false;
      count.set(k, n + 1);
      return true;
    },
  };
}

export function fakeDeps(overrides: Partial<Deps> = {}): Deps {
  return {
    origin: 'local',
    catalog: fakeCatalog(),
    listings: fakeListings(),
    contacts: fakeContacts(),
    rateLimiter: fakeRateLimiter(),
    hashIp: async (ip) => `hash(${ip})`,
    platformContact: { name: 'Circular NEA' },
    ...overrides,
  };
}

/** `MakeDeps` que siempre entrega las mismas deps y cuenta cuántas veces se cerró el scope del request. */
export function fakeMakeDeps(deps: Deps = fakeDeps()): MakeDeps & { opened: number; closed: number } {
  const make = Object.assign(
    () => {
      make.opened++;
      return {
        deps,
        close: async () => {
          make.closed++;
        },
      };
    },
    { opened: 0, closed: 0 },
  );
  return make;
}
