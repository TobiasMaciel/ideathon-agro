import { eq } from 'drizzle-orm';
import type { CuratedContact } from '@mapa/core/data';
import { createDb, type AnyDb } from './client';
import { contacts } from './schema';

/** Contacto corporativo curado de un generador/comprador, o undefined si no tiene. */
export async function getCuratedContact(db: AnyDb, id: string): Promise<CuratedContact | undefined> {
  const [r] = await db.select().from(contacts).where(eq(contacts.entityId, id)).limit(1);
  if (!r) return undefined;
  return {
    entityId: r.entityId,
    name: r.name,
    ...(r.website !== null && { website: r.website }),
    ...(r.phone !== null && { phone: r.phone }),
    ...(r.email !== null && { email: r.email }),
    sourceIds: r.sourceIds,
  };
}

/** Lectura de contactos curados sobre Postgres. Una conexión por operación (Workers). */
export function createDbContactSource(url: string) {
  return { get: (id: string) => getCuratedContact(createDb(url), id) };
}
