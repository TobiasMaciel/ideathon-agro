import type { Catalog, CuratedContact } from '@mapa/core/catalog';
import type { AnyDb } from './client';
import { toRows } from './mappers/catalog-rows';
import { toTsKeys } from './mappers/columns';
import * as t from './schema';

/** Catálogo curado más sus contactos corporativos (los contactos no viajan en el catálogo). */
export type SeedData = Catalog & { contacts?: CuratedContact[] };

/**
 * Reemplaza el contenido de la base por `data`: en una sola transacción borra y reinserta, por lo que
 * es idempotente (correrlo dos veces deja el mismo estado) y nunca deja la base a medias.
 */
export async function seedDatabase(db: AnyDb, data: SeedData): Promise<void> {
  const rows = toRows(data);
  const ins = (table: Parameters<typeof toTsKeys>[0], list: object[]) =>
    list.map((r) => toTsKeys(table, r as Record<string, unknown>));

  await db.transaction(async (tx) => {
    // Hijos primero (claves foráneas).
    await tx.delete(t.contacts);
    await tx.delete(t.buyers);
    await tx.delete(t.generators);
    await tx.delete(t.materialStates);
    await tx.delete(t.alternatives);
    await tx.delete(t.materials);
    await tx.delete(t.assumptions);
    await tx.delete(t.sources);

    // Padres primero.
    await tx.insert(t.sources).values(ins(t.sources, rows.sources) as (typeof t.sources.$inferInsert)[]);
    await tx.insert(t.materials).values(ins(t.materials, rows.materials) as (typeof t.materials.$inferInsert)[]);
    await tx
      .insert(t.materialStates)
      .values(ins(t.materialStates, rows.material_states) as (typeof t.materialStates.$inferInsert)[]);
    await tx
      .insert(t.alternatives)
      .values(ins(t.alternatives, rows.alternatives) as (typeof t.alternatives.$inferInsert)[]);
    await tx.insert(t.assumptions).values(ins(t.assumptions, rows.assumptions) as (typeof t.assumptions.$inferInsert)[]);
    await tx.insert(t.generators).values(ins(t.generators, rows.generators) as (typeof t.generators.$inferInsert)[]);
    await tx.insert(t.buyers).values(ins(t.buyers, rows.buyers) as (typeof t.buyers.$inferInsert)[]);
    if (data.contacts?.length) {
      await tx.insert(t.contacts).values(data.contacts.map((c) => ({ ...c })));
    }
  });
}
