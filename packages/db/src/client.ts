import { drizzle } from 'drizzle-orm/postgres-js';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import * as schema from './schema';

export type Db = ReturnType<typeof createDb>;

/** Cualquier base Drizzle/Postgres con este esquema (postgres.js en producción, PGlite en tests). */
export type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

/**
 * Cliente Drizzle sobre postgres.js, apto para Cloudflare Workers (requiere el flag `nodejs_compat`).
 *
 * - `max: 1`: un Worker atiende una request por isolate; una sola conexión evita agotar el límite de
 *   conexiones de la base.
 * - `prepare: false`: sin prepared statements con nombre, necesario detrás de poolers en modo transacción
 *   (pgbouncer, Hyperdrive, etc.). En Workers conviene una URL de pooler o de Hyperdrive.
 */
export function createDb(url: string) {
  return drizzle(postgres(url, { max: 1, prepare: false }), { schema });
}
