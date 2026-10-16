import { drizzle } from 'drizzle-orm/postgres-js';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import * as schema from './schema';

/** Cualquier base Drizzle/Postgres con este esquema (postgres.js en producción, PGlite en tests). */
export type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

/** Conexión abierta: quien la abre la cierra (en la API, la composición, una vez por request). */
export interface DbConnection {
  db: AnyDb;
  /** Cierra el cliente (espera hasta 5 s a que terminen las consultas en curso). Idempotente. */
  close(): Promise<void>;
}

/**
 * Cliente Drizzle sobre postgres.js, apto para Cloudflare Workers (requiere el flag `nodejs_compat`).
 *
 * - `max: 1`: un Worker atiende una request por isolate; una sola conexión evita agotar el límite de
 *   conexiones de la base.
 * - `prepare: false`: sin prepared statements con nombre, necesario detrás de poolers en modo transacción
 *   (pgbouncer, Hyperdrive, etc.). En Workers conviene una URL de pooler o de Hyperdrive.
 * - postgres.js conecta en la primera consulta: crear la conexión sin usarla no abre un socket.
 */
export function createDb(url: string): DbConnection {
  const client = postgres(url, { max: 1, prepare: false });
  return { db: drizzle(client, { schema }), close: () => client.end({ timeout: 5 }) };
}
