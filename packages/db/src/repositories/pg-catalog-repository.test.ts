import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import type { Catalog } from '@mapa/core/catalog';
import { seedDatabase } from '../seed';
import { createTestDb } from '../testing';
import { createPgCatalogRepository, loadCatalog } from './pg-catalog-repository';

const data: Catalog = { sources, materials, alternatives, assumptions, generators, buyers };
const byId = <T extends { id: string }>(list: T[]) => [...list].sort((a, b) => a.id.localeCompare(b.id));

/** loadCatalog ordena por clave primaria; el orden curado de core no se conserva. */
function normalized(d: Catalog): Catalog {
  return {
    sources: byId(d.sources),
    materials: byId(d.materials),
    alternatives: byId(d.alternatives),
    assumptions: [...d.assumptions].sort((a, b) => a.key.localeCompare(b.key)),
    generators: byId(d.generators),
    buyers: byId(d.buyers),
  };
}

let ctx: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => {
  ctx = await createTestDb();
});
afterAll(async () => {
  await ctx.client.close();
});

describe('base Postgres (PGlite) con las migraciones reales', () => {
  it('sembrar y leer devuelve los datos de @mapa/core/data', async () => {
    await seedDatabase(ctx.db, data);
    expect(await loadCatalog(ctx.db)).toEqual(normalized(data));
  });

  it('el seed es idempotente: correrlo dos veces deja lo mismo', async () => {
    await seedDatabase(ctx.db, data);
    await seedDatabase(ctx.db, data);
    const loaded = await loadCatalog(ctx.db);
    expect(loaded).toEqual(normalized(data));
    expect(loaded.generators).toHaveLength(generators.length);
  });

  it('el orden de lectura es estable (por clave primaria)', async () => {
    await seedDatabase(ctx.db, data);
    const a = await loadCatalog(ctx.db);
    const b = await loadCatalog(ctx.db);
    expect(a).toEqual(b);
    expect(a.generators.map((g) => g.id)).toEqual(a.generators.map((g) => g.id).sort());
  });

  it('un seed que falla hace rollback y no deja la base a medias', async () => {
    await seedDatabase(ctx.db, data);
    const broken: Catalog = { ...data, generators: [{ ...generators[0], materialId: 'inexistente' as never }] };
    await expect(seedDatabase(ctx.db, broken)).rejects.toThrow();
    expect(await loadCatalog(ctx.db)).toEqual(normalized(data));
  });

  it('el repositorio carga el catálogo y responde ping sin cargarlo', async () => {
    await seedDatabase(ctx.db, data);
    const repo = createPgCatalogRepository(ctx.db);
    expect(await repo.ping()).toBe(true);
    expect((await repo.load()).generators).toHaveLength(generators.length);
  });

  it('los checks de la base rechazan URLs que no son http(s)', async () => {
    await expect(
      ctx.client.query("insert into sources (id, title, url, date) values ('x', 't', 'javascript:alert(1)', 'd')"),
    ).rejects.toThrow(/sources_url_check/);
  });

  it('existe el rol mapa_readonly: puede leer y no puede escribir', async () => {
    const { rows } = await ctx.client.query<{ can_select: boolean; can_insert: boolean; can_delete: boolean; login: boolean }>(
      `select has_table_privilege('mapa_readonly', 'public.generators', 'SELECT') as can_select,
              has_table_privilege('mapa_readonly', 'public.generators', 'INSERT') as can_insert,
              has_table_privilege('mapa_readonly', 'public.generators', 'DELETE') as can_delete,
              (select rolcanlogin from pg_roles where rolname = 'mapa_readonly') as login`,
    );
    expect(rows[0]).toEqual({ can_select: true, can_insert: false, can_delete: false, login: false });
  });
});
