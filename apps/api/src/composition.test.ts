import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { alternatives, assumptions, buyers, curatedContacts, generators, materials, sources } from '@mapa/core/data';
import type { CatalogRepository, ContactDirectory, ListingRepository } from '@mapa/core/ports';
import { seedDatabase, type AnyDb } from '@mapa/db';
import { createTestDb } from '@mapa/db/testing';
import { createApp } from './app';
import { catalogWithFallback, contactsWithFallback, createComposition, listingsWithFallback } from './composition';
import { fakeCatalog, localCatalog } from './test/fakes';

const boom = async (): Promise<never> => {
  throw new Error('boom');
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('degradación (un solo lugar)', () => {
  it('catálogo: si la base falla, usa los datos locales y lo registra', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing: CatalogRepository = { load: boom, ping: boom };
    const repo = catalogWithFallback(failing, fakeCatalog());
    expect((await repo.load()).buyers).toHaveLength(buyers.length);
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'boom');
  });

  it('catálogo: ping refleja la base (false si falla), nunca el respaldo', async () => {
    expect(await catalogWithFallback({ load: boom, ping: boom }, fakeCatalog()).ping()).toBe(false);
    expect(await catalogWithFallback(fakeCatalog(localCatalog(), true), fakeCatalog()).ping()).toBe(true);
  });

  it('publicaciones: si listar falla, lista vacía; crear y leer por id no se disimulan', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing: ListingRepository = { list: boom, get: boom, add: boom };
    const repo = listingsWithFallback(failing);
    expect(await repo.list()).toEqual([]);
    await expect(repo.get('x')).rejects.toThrow('boom');
    await expect(repo.add({} as never, 'h')).rejects.toThrow('boom');
  });

  it('contactos: si la base falla, los curados locales', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const local: ContactDirectory = { get: async (id) => curatedContacts.find((c) => c.entityId === id) };
    const repo = contactsWithFallback({ get: boom }, local);
    expect(await repo.get('molinos-ala-mercedes')).toEqual(curatedContacts[0]);
  });
});

describe('createComposition sin DATABASE_URL', () => {
  it('no abre conexiones y usa lo local', async () => {
    const connect = vi.fn();
    const scope = createComposition({ connect })({ DATABASE_URL: '' });
    expect(connect).not.toHaveBeenCalled();
    expect(scope.deps.origin).toBe('local');
    expect((await scope.deps.catalog.load()).generators).toHaveLength(generators.length);
    await scope.close();
  });

  it('las publicaciones en memoria persisten entre requests del mismo isolate', async () => {
    const make = createComposition();
    const input = { kind: 'oferta', name: 'X', lat: -27.5, lng: -56.7, materialId: 'aserrin', tonsPerMonth: 10, contact: { phone: '379 412-3456' } } as const;
    await make({}).deps.listings.add(input, 'h');
    expect(await make({}).deps.listings.list()).toHaveLength(1);
  });
});

describe('createComposition con Postgres (PGlite): conexiones por request (D4)', () => {
  let ctx: Awaited<ReturnType<typeof createTestDb>>;
  beforeAll(async () => {
    ctx = await createTestDb();
    await seedDatabase(ctx.db, { sources, materials, alternatives, assumptions, generators, buyers, contacts: curatedContacts });
  });
  afterAll(async () => {
    await ctx.client.close();
  });

  /** `connect` que entrega la base PGlite y lleva la cuenta de conexiones abiertas. */
  function countingConnect() {
    const stats = { opened: 0, closed: 0 };
    const connect = () => {
      stats.opened++;
      let closed = false;
      return {
        db: ctx.db as unknown as AnyDb,
        close: async () => {
          if (!closed) stats.closed++;
          closed = true;
        },
      };
    };
    return { connect, stats };
  }

  it('cada request abre una conexión y la cierra al terminar: no quedan clientes abiertos', async () => {
    const { connect, stats } = countingConnect();
    const app = createApp(createComposition({ connect }));
    const env = { DATABASE_URL: 'postgres://pglite', IP_SALT: 't', ENVIRONMENT: 'development', RATE_LIMIT_DISABLED: '1' };
    const paths = ['/api/health', '/api/catalog', '/api/generators', '/api/buyers', '/api/listings/molinos-ala-mercedes/contact', '/api/nada'];
    for (const p of paths) expect((await app.request(`http://localhost${p}`, undefined, env)).status).toBeLessThan(500);
    expect(stats.opened).toBe(paths.length);
    expect(stats.closed).toBe(stats.opened);
  });

  it('también cierra cuando la ruta responde con error', async () => {
    const { connect, stats } = countingConnect();
    const app = createApp(createComposition({ connect }));
    const res = await app.request('http://localhost/api/generators?material=oro', undefined, { DATABASE_URL: 'postgres://pglite' });
    expect(res.status).toBe(400);
    expect(stats).toEqual({ opened: 1, closed: 1 });
  });

  it('health informa database sin cargar el catálogo', async () => {
    const { connect } = countingConnect();
    const res = await createApp(createComposition({ connect })).request('http://localhost/api/health', undefined, {
      DATABASE_URL: 'postgres://pglite',
    });
    expect(await res.json()).toEqual({ ok: true, origin: 'database' });
  });
});
