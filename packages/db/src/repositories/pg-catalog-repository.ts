import { asc, sql } from 'drizzle-orm';
import type { Catalog } from '@mapa/core/catalog';
import type { CatalogRepository } from '@mapa/core/ports';
import type { AnyDb } from '../client';
import { fromRows, type DbRows } from '../mappers/catalog-rows';
import { toSqlNames } from '../mappers/columns';
import * as t from '../schema';

/**
 * Lee las 7 tablas y arma el catálogo. El orden es estable (por clave primaria), no el de inserción:
 * el resultado es determinista aunque la base reordene las filas.
 */
export async function loadCatalog(db: AnyDb): Promise<Catalog> {
  const [sources, materials, materialStates, alternatives, assumptions, generators, buyers] = await Promise.all([
    db.select().from(t.sources).orderBy(asc(t.sources.id)),
    db.select().from(t.materials).orderBy(asc(t.materials.id)),
    db.select().from(t.materialStates).orderBy(asc(t.materialStates.materialId), asc(t.materialStates.state)),
    db.select().from(t.alternatives).orderBy(asc(t.alternatives.id)),
    db.select().from(t.assumptions).orderBy(asc(t.assumptions.key)),
    db.select().from(t.generators).orderBy(asc(t.generators.id)),
    db.select().from(t.buyers).orderBy(asc(t.buyers.id)),
  ]);
  const rows: DbRows = {
    sources: sources.map((r) => toSqlNames(t.sources, r)),
    materials: materials.map((r) => toSqlNames(t.materials, r)),
    material_states: materialStates.map((r) => toSqlNames(t.materialStates, r)),
    alternatives: alternatives.map((r) => toSqlNames(t.alternatives, r)),
    assumptions: assumptions.map((r) => toSqlNames(t.assumptions, r)),
    generators: generators.map((r) => toSqlNames(t.generators, r)),
    buyers: buyers.map((r) => toSqlNames(t.buyers, r)),
  };
  return fromRows(rows);
}

/** Catálogo curado en Postgres. Recibe una conexión abierta: no la abre ni la cierra. */
export function createPgCatalogRepository(db: AnyDb) {
  return {
    load: () => loadCatalog(db),
    async ping() {
      try {
        await db.execute(sql`select 1`);
        return true;
      } catch {
        return false;
      }
    },
  } satisfies CatalogRepository;
}
