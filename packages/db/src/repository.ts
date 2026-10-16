import { asc } from 'drizzle-orm';
import type { DataSet, DbRows } from '@mapa/core/db';
import { fromRows } from '@mapa/core/db';
import { toSqlNames } from './columns';
import { createDb, type AnyDb } from './client';
import * as t from './schema';

/** Contrato mínimo de la API (coincide con `DataSource` de apps/api/src/repository.ts). */
export interface DataSource {
  load(): Promise<DataSet>;
}

/**
 * Lee las 7 tablas y arma el `DataSet`. El orden es estable (por clave primaria), no el de inserción:
 * el resultado es determinista aunque la base reordene las filas.
 */
export async function loadDataSet(db: AnyDb): Promise<DataSet> {
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

/** `DataSource` respaldado por Postgres. La conexión se crea al cargar (una por request en Workers). */
export function createDbDataSource(url: string): DataSource {
  return { load: () => loadDataSet(createDb(url)) };
}
