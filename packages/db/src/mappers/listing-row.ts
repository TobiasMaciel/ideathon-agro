import type { ListingInput, StoredListing } from '@mapa/core/listings';
import type { listings } from '../schema';

export type ListingRow = typeof listings.$inferSelect;
export type NewListingRow = typeof listings.$inferInsert;

/** Fila de `listings` -> publicación del dominio (los null de SQL se omiten). */
export function listingFromRow(r: ListingRow): StoredListing {
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

/** Publicación validada -> fila a insertar (los opcionales ausentes van como null). */
export function listingToRow(input: ListingInput, ipHash: string): NewListingRow {
  return {
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
  };
}
