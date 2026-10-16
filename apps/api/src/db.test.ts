import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import type { CatalogResponse } from '@mapa/core/api';
import { getListing, loadDataSet, loadListings, seedDatabase } from '@mapa/db';
import { createTestDb } from '@mapa/db/testing';

// La API real, con un DataSource real (loadDataSet) respaldado por PGlite en lugar de postgres.js.
const ctx = vi.hoisted(() => ({ db: undefined as undefined | Awaited<ReturnType<typeof import('@mapa/db/testing').createTestDb>> }));

vi.mock('@mapa/db', async (importActual) => {
  const actual = await importActual<typeof import('@mapa/db')>();
  return {
    ...actual,
    createDbDataSource: () => ({ load: () => actual.loadDataSet(ctx.db!.db) }),
    createDbListingSource: () => ({
      list: () => actual.loadListings(ctx.db!.db),
      get: (id: string) => actual.getListing(ctx.db!.db, id),
      add: (input: never, ipHash: string) => actual.insertListing(ctx.db!.db, input, ipHash),
    }),
  };
});

const { default: app } = await import('./index');
const request = (path: string, env: object) => Promise.resolve(app.request(new Request(`http://localhost${path}`), undefined, env));

beforeAll(async () => {
  ctx.db = await createTestDb();
  await seedDatabase(ctx.db.db, { sources, materials, alternatives, assumptions, generators, buyers });
});
afterAll(async () => {
  await ctx.db?.client.close();
});

describe('API con DATABASE_URL', () => {
  it('GET /api/catalog lee de la base y responde origin database', async () => {
    const res = await request('/api/catalog', { DATABASE_URL: 'postgres://fake' });
    const body = (await res.json()) as CatalogResponse;
    expect(res.status).toBe(200);
    expect(body.origin).toBe('database');
    expect(body.generators).toHaveLength(generators.length);
    expect(body.buyers).toHaveLength(buyers.length);
    expect(body.materials).toHaveLength(materials.length);
  });

  it('el catálogo de la base equivale al de core (misma información)', async () => {
    const res = await request('/api/catalog', { DATABASE_URL: 'postgres://fake' });
    const { origin, ...fromDb } = (await res.json()) as CatalogResponse;
    expect(origin).toBe('database');
    expect(fromDb).toEqual(JSON.parse(JSON.stringify({ ...(await loadDataSet(ctx.db!.db)) })));
  });

  it('sin DATABASE_URL usa los datos locales', async () => {
    const body = (await (await request('/api/catalog', {})).json()) as CatalogResponse;
    expect(body.origin).toBe('local');
  });
});

describe('publicaciones con DATABASE_URL', () => {
  const env = { DATABASE_URL: 'postgres://fake', IP_SALT: 'test' };
  const body = {
    kind: 'oferta',
    name: 'Aserradero Don Pepe',
    lat: -27.58,
    lng: -56.69,
    materialId: 'aserrin',
    tonsPerMonth: 120,
    contact: { phone: '379 412-3456' },
  };
  const post = (ip: string) =>
    Promise.resolve(
      app.request(
        new Request('http://localhost/api/listings', {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'cf-connecting-ip': ip },
        }),
        undefined,
        env,
      ),
    );

  it('POST guarda en Postgres, aparece en el catálogo y su contacto se pide por id', async () => {
    const res = await post('20.0.0.1');
    const created = (await res.json()) as { origin: string; listing: { id: string } };
    expect(res.status).toBe(201);
    expect(created.origin).toBe('database');
    const stored = await loadListings(ctx.db!.db);
    expect(stored).toHaveLength(1);
    expect(await getListing(ctx.db!.db, stored[0].id)).toBeDefined();
    expect(created.listing.id).toBe(`pub-${stored[0].id}`);

    const catalog = (await (await request('/api/catalog', env)).json()) as CatalogResponse;
    expect(catalog.origin).toBe('database');
    expect(catalog.generators).toHaveLength(generators.length + 1);
    expect(JSON.stringify(catalog)).not.toContain('412-3456');

    const contact = await request(`/api/listings/${created.listing.id}/contact`, env);
    expect(contact.status).toBe(200);
    expect(((await contact.json()) as { phone: string }).phone).toBe('379 412-3456');
  });

  it('el hash de la IP se guarda, no la IP', async () => {
    const r = await ctx.db!.client.query<{ ip_hash: string }>('select ip_hash from listings');
    expect(r.rows[0].ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(r.rows[0].ip_hash).not.toContain('20.0.0.1');
  });

  it('si la base de publicaciones falla, /api/catalog devuelve lo curado', async () => {
    await ctx.db!.client.exec('alter table listings rename to listings_off');
    try {
      const res = await request('/api/catalog', env);
      const catalog = (await res.json()) as CatalogResponse;
      expect(res.status).toBe(200);
      expect(catalog.generators).toHaveLength(generators.length);
    } finally {
      await ctx.db!.client.exec('alter table listings_off rename to listings');
    }
  });
});
