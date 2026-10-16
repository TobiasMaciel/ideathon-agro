import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import type { DataSet } from '@mapa/core/db';
import type { DataOrigin } from '@mapa/core/api';
import type { Env } from './env';

/** Origen de datos persistente (p. ej. Postgres con Drizzle). */
export interface DataSource {
  load(): Promise<DataSet>;
}

/** Datos locales (@mapa/core/data). */
function localDataSet(): DataSet {
  return { sources, materials, alternatives, assumptions, generators, buyers };
}

/**
 * Lee el catálogo de la base si hay `source` y `env.DATABASE_URL`; si no, o si falla, usa los datos locales.
 * El env se lee en cada llamada (no en import time).
 */
export async function getDataSet(
  env: Pick<Env, 'DATABASE_URL'>,
  source?: DataSource,
): Promise<{ origin: DataOrigin; data: DataSet }> {
  if (!source || !env.DATABASE_URL) return { origin: 'local', data: localDataSet() };
  try {
    return { origin: 'database', data: await source.load() };
  } catch (e) {
    console.error('Base de datos no disponible, uso datos locales:', e instanceof Error ? e.message : String(e));
    return { origin: 'local', data: localDataSet() };
  }
}
