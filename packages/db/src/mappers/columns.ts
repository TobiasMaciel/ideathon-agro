import { getTableColumns } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

// Drizzle usa claves camelCase en TypeScript y nombres snake_case en SQL; las filas de ./catalog-rows
// (toRows/fromRows) usan los nombres SQL. Estos helpers traducen en ambos sentidos a partir del esquema.

/** { camelCase } (Drizzle) -> { snake_case } (filas de catalog-rows). */
export function toSqlNames<T>(table: PgTable, row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [key, col] of Object.entries(getTableColumns(table))) out[col.name] = row[key];
  return out as T;
}

/** { snake_case } (filas de catalog-rows) -> { camelCase } (Drizzle). */
export function toTsKeys(table: PgTable, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, col] of Object.entries(getTableColumns(table))) out[key] = row[col.name];
  return out;
}
