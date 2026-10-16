// "Mis publicaciones" en este navegador (sin cuenta), guardadas en localStorage.
import { readJson, writeJson, type KeyValueStorage } from './storage';

export const MY_LISTINGS_KEY = 'circular-nea:my-listings:v1';
export const MAX_MY_LISTINGS = 50;

export type ListingKind = 'oferta' | 'demanda';

export interface MyListing {
  id: string;
  kind: ListingKind;
  /** Alta de la publicación en este navegador (ISO). */
  createdAt: string;
}

export function loadMyListings(storage?: KeyValueStorage): MyListing[] {
  const data = readJson<unknown>(MY_LISTINGS_KEY, storage);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (x): x is MyListing =>
      !!x && typeof x.id === 'string' && (x.kind === 'oferta' || x.kind === 'demanda') && typeof x.createdAt === 'string',
  );
}

/** Agrega (o reemplaza) una publicación; conserva las 50 más recientes. */
export function rememberListing(id: string, kind: ListingKind, storage?: KeyValueStorage, now: Date = new Date()): MyListing[] {
  const next = [...loadMyListings(storage).filter((l) => l.id !== id), { id, kind, createdAt: now.toISOString() }].slice(
    -MAX_MY_LISTINGS,
  );
  writeJson(MY_LISTINGS_KEY, next, storage);
  return next;
}

export function forgetListing(id: string, storage?: KeyValueStorage): MyListing[] {
  const next = loadMyListings(storage).filter((l) => l.id !== id);
  writeJson(MY_LISTINGS_KEY, next, storage);
  return next;
}
