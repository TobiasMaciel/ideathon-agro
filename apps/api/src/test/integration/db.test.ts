import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { alternatives, assumptions, buyers, curatedContacts, generators, materials, sources } from '@mapa/core/data';
import type { CatalogResponse, ListingContactResponse, ListingCreatedResponse } from '@mapa/core/contracts';
import { createPgRepositories, seedDatabase, type AnyDb } from '@mapa/db';
import { createTestDb } from '@mapa/db/testing';
import { createApp } from '../../app';
import { createComposition } from '../../composition';

// La API real con la composición real; solo cambia cómo se abre la conexión: PGlite en lugar de postgres.js.
// Sin vi.mock: la base se inyecta por `connect`.
let ctx: Awaited<ReturnType<typeof createTestDb>>;
let app: ReturnType<typeof createApp>;
const repos = () => createPgRepositories(ctx.db as unknown as AnyDb);

beforeAll(async () => {
  ctx = await createTestDb();
  await seedDatabase(ctx.db, { sources, materials, alternatives, assumptions, generators, buyers, contacts: curatedContacts });
  app = createApp(createComposition({ connect: () => ({ db: ctx.db as unknown as AnyDb, close: async () => {} }) }));
});
afterAll(async () => {
  await ctx.client.close();
});

const request = (path: string, env: object) => Promise.resolve(app.request(new Request(`http://localhost${path}`), undefined, env));

describe('API con DATABASE_URL', () => {
  const env = { DATABASE_URL: 'postgres://pglite' };

  it('GET /api/catalog lee de la base', async () => {
    const res = await request('/api/catalog', env);
    const body = (await res.json()) as CatalogResponse;
    expect(res.status).toBe(200);
    expect(body.generators).toHaveLength(generators.length);
    expect(body.buyers).toHaveLength(buyers.length);
    expect(body.materials).toHaveLength(materials.length);
  });

  it('el catálogo de la base equivale al de core (misma información)', async () => {
    const fromApi = (await (await request('/api/catalog', env)).json()) as CatalogResponse;
    expect(fromApi).toEqual(JSON.parse(JSON.stringify(await repos().catalog.load())));
  });

  it('GET /api/health informa database', async () => {
    expect(await (await request('/api/health', env)).json()).toEqual({ ok: true, origin: 'database' });
  });

  it('sin DATABASE_URL informa local', async () => {
    expect(await (await request('/api/health', {})).json()).toEqual({ ok: true, origin: 'local' });
  });
});

describe('publicaciones con DATABASE_URL', () => {
  const env = { DATABASE_URL: 'postgres://pglite', IP_SALT: 'test' };
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
    const created = (await res.json()) as ListingCreatedResponse;
    expect(res.status).toBe(201);
    const stored = await repos().listings.list();
    expect(stored).toHaveLength(1);
    expect(created.listing.id).toBe(`pub-${stored[0].id}`);

    const catalog = (await (await request('/api/catalog', env)).json()) as CatalogResponse;
    expect(catalog.generators).toHaveLength(generators.length + 1);
    expect(JSON.stringify(catalog)).not.toContain('412-3456');

    const contact = await request(`/api/listings/${created.listing.id}/contact`, env);
    expect(contact.status).toBe(200);
    expect(((await contact.json()) as ListingContactResponse).phone).toBe('379 412-3456');
  });

  it('el hash de la IP se guarda, no la IP', async () => {
    const r = await ctx.client.query<{ ip_hash: string }>('select ip_hash from listings');
    expect(r.rows[0].ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(r.rows[0].ip_hash).not.toContain('20.0.0.1');
  });

  it('si la base de publicaciones falla, /api/catalog devuelve lo curado', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await ctx.client.exec('alter table listings rename to listings_off');
    try {
      const res = await request('/api/catalog', env);
      const catalog = (await res.json()) as CatalogResponse;
      expect(res.status).toBe(200);
      expect(catalog.generators).toHaveLength(generators.length);
    } finally {
      await ctx.client.exec('alter table listings_off rename to listings');
      vi.restoreAllMocks();
    }
  });
});

describe('contacto de curados con DATABASE_URL', () => {
  const env = { DATABASE_URL: 'postgres://pglite', IP_SALT: 'test', RATE_LIMIT_DISABLED: '1', ENVIRONMENT: 'development' };

  it('lee el contacto corporativo de la tabla contacts', async () => {
    const res = await request('/api/listings/molinos-ala-mercedes/contact', env);
    const body = (await res.json()) as ListingContactResponse;
    expect(res.status).toBe(200);
    expect(body.via).toBe('empresa');
    expect(body.email).toBe('info_ar@adecoagro.com');
    expect(body.sourceUrl).toBe('https://adecoagro.com/sugerencias-y-consultas/');
  });

  it('un curado sin contacto da 404 y /api/catalog no expone contactos', async () => {
    expect((await request('/api/listings/duhalde-curuzu/contact', env)).status).toBe(404);
    const raw = await (await request('/api/catalog', env)).text();
    expect(raw).not.toContain('info_ar@adecoagro.com');
    expect(raw).not.toContain('4836 8600');
  });
});
