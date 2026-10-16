import { asc, eq } from 'drizzle-orm';
import type { ListingInput, StoredListing } from '@mapa/core/listings';
import type { ListingRepository } from '@mapa/core/ports';
import type { AnyDb } from '../client';
import { listingFromRow, listingToRow } from '../mappers/listing-row';
import { listings } from '../schema';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Publicaciones abiertas, de la más antigua a la más nueva. `loadCatalog` sigue devolviendo solo lo curado. */
export async function loadListings(db: AnyDb): Promise<StoredListing[]> {
  const rows = await db.select().from(listings).orderBy(asc(listings.createdAt), asc(listings.id));
  return rows.map(listingFromRow);
}

/** Una publicación por id (uuid sin el prefijo `pub-`), o undefined si no existe o el id no es un uuid. */
export async function getListing(db: AnyDb, id: string): Promise<StoredListing | undefined> {
  if (!UUID.test(id)) return undefined;
  const [row] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return row ? listingFromRow(row) : undefined;
}

/** Inserta una publicación ya validada. `ipHash` es el hash salado de la IP (nunca la IP en claro). */
export async function insertListing(db: AnyDb, input: ListingInput, ipHash: string): Promise<StoredListing> {
  const [row] = await db.insert(listings).values(listingToRow(input, ipHash)).returning();
  return listingFromRow(row);
}

/** Publicaciones en Postgres. Recibe una conexión abierta: no la abre ni la cierra. */
export function createPgListingRepository(db: AnyDb) {
  return {
    list: () => loadListings(db),
    get: (id: string) => getListing(db, id),
    add: (input: ListingInput, ipHash: string) => insertListing(db, input, ipHash),
  } satisfies ListingRepository;
}
