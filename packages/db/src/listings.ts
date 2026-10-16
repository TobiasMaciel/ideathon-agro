import { asc, eq } from 'drizzle-orm';
import type { ListingInput, StoredListing } from '@mapa/core/listings';
import { createDb, type AnyDb } from './client';
import { listings } from './schema';

type Row = typeof listings.$inferSelect;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toStored(r: Row): StoredListing {
  const contact = {
    ...(r.contactName !== null && { name: r.contactName }),
    ...(r.contactPhone !== null && { phone: r.contactPhone }),
    ...(r.contactEmail !== null && { email: r.contactEmail }),
  };
  const input: ListingInput = {
    kind: r.kind,
    name: r.name,
    ...(r.locality !== null && { locality: r.locality }),
    lat: r.lat,
    lng: r.lng,
    materialId: r.materialId,
    tonsPerMonth: r.tonsPerMonth,
    ...(r.moisture !== null && { moisture: r.moisture }),
    ...(r.seasonality !== null && { seasonality: r.seasonality }),
    ...(r.currentAlternative !== null && { currentAlternative: r.currentAlternative }),
    ...(r.sector !== null && { sector: r.sector }),
    contact,
  };
  return { id: r.id, createdAt: r.createdAt.toISOString(), input };
}

/** Publicaciones abiertas, de la más antigua a la más nueva. `loadDataSet` sigue devolviendo solo lo curado. */
export async function loadListings(db: AnyDb): Promise<StoredListing[]> {
  const rows = await db.select().from(listings).orderBy(asc(listings.createdAt), asc(listings.id));
  return rows.map(toStored);
}

/** Una publicación por id (uuid sin el prefijo `pub-`), o undefined si no existe o el id no es un uuid. */
export async function getListing(db: AnyDb, id: string): Promise<StoredListing | undefined> {
  if (!UUID.test(id)) return undefined;
  const [row] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return row ? toStored(row) : undefined;
}

/** Inserta una publicación ya validada. `ipHash` es el hash salado de la IP (nunca la IP en claro). */
export async function insertListing(db: AnyDb, input: ListingInput, ipHash: string): Promise<StoredListing> {
  const [row] = await db
    .insert(listings)
    .values({
      kind: input.kind,
      name: input.name,
      locality: input.locality ?? null,
      lat: input.lat,
      lng: input.lng,
      materialId: input.materialId,
      tonsPerMonth: input.tonsPerMonth,
      moisture: input.moisture ?? null,
      seasonality: input.seasonality ?? null,
      currentAlternative: input.currentAlternative ?? null,
      sector: input.sector ?? null,
      contactName: input.contact.name ?? null,
      contactPhone: input.contact.phone ?? null,
      contactEmail: input.contact.email ?? null,
      ipHash,
    })
    .returning();
  return toStored(row);
}

/** Operaciones sobre Postgres para el `ListingStore` de la API. Una conexión por operación (Workers). */
export function createDbListingSource(url: string) {
  return {
    list: () => loadListings(createDb(url)),
    get: (id: string) => getListing(createDb(url), id),
    add: (input: ListingInput, ipHash: string) => insertListing(createDb(url), input, ipHash),
  };
}
