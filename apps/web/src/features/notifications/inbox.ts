// Centro de notificaciones: matches de mis publicaciones + qué ya vi (localStorage, sin cuenta).
import type { CatalogResponse } from '@mapa/core/api';
import type { Overrides } from '@mapa/core/match';
import type { MaterialState } from '@mapa/core/viability';
import { matchesForListing, type MatchItem } from './matches';
import type { MyListing } from './my-listings';
import { readJson, writeJson, type KeyValueStorage } from './storage';

export const SEEN_KEY = 'circular-nea:seen:v1';
export const MAX_SEEN = 500;

export type NotificationType = 'nuevo-match' | 'match-inicial';

export interface Notification {
  /** Estable: `${myListingId}:${counterpartId}`. */
  id: string;
  type: NotificationType;
  myListingId: string;
  counterpartId: string;
  counterpartKind: MatchItem['counterpartKind'];
  isNew: boolean;
  /** Texto listo para mostrar. */
  text: string;
  match: MatchItem;
}

function describe(match: MatchItem, nuevo: boolean): string {
  const noun = match.counterpartKind === 'buyer' ? 'demanda' : 'oferta';
  const prefix = nuevo ? `Nueva ${noun} compatible` : `${noun[0].toUpperCase()}${noun.slice(1)} compatible`;
  const pct = Math.round(match.marginPct * 100);
  const state: MaterialState = match.state;
  return `${prefix}: ${match.counterpartName} te cierra al ${pct} % (${state}, ${Math.round(match.distanceKm)} km)`;
}

/** Un match por cada contraparte compatible de cada una de mis publicaciones que siga en el catálogo. */
export function computeNotifications(args: {
  myListings: MyListing[];
  catalog: CatalogResponse;
  seen: Set<string>;
  overrides?: Overrides;
}): Notification[] {
  const { myListings, catalog, seen, overrides } = args;
  const out: Notification[] = [];
  for (const mine of myListings) {
    for (const match of matchesForListing({ listingId: mine.id, catalog, overrides })) {
      const nuevo = !!match.counterpartCreatedAt && match.counterpartCreatedAt > mine.createdAt;
      const id = `${mine.id}:${match.counterpartId}`;
      out.push({
        id,
        type: nuevo ? 'nuevo-match' : 'match-inicial',
        myListingId: mine.id,
        counterpartId: match.counterpartId,
        counterpartKind: match.counterpartKind,
        isNew: !seen.has(id),
        text: describe(match, nuevo),
        match,
      });
    }
  }
  // Los nuevos matches primero (las comparaciones de strings ISO son válidas).
  return out.sort((a, b) => Number(b.type === 'nuevo-match') - Number(a.type === 'nuevo-match'));
}

export function loadSeen(storage?: KeyValueStorage): Set<string> {
  const data = readJson<unknown>(SEEN_KEY, storage);
  return new Set(Array.isArray(data) ? data.filter((x): x is string => typeof x === 'string') : []);
}

/** Guarda los últimos 500 ids vistos. */
export function saveSeen(seen: Set<string>, storage?: KeyValueStorage): void {
  writeJson(SEEN_KEY, [...seen].slice(-MAX_SEEN), storage);
}

export function markSeen(id: string, seen: Set<string>, storage?: KeyValueStorage): Set<string> {
  const next = new Set(seen);
  next.delete(id);
  next.add(id);
  const trimmed = new Set([...next].slice(-MAX_SEEN));
  saveSeen(trimmed, storage);
  return trimmed;
}

export function markAllSeen(notifications: Notification[], seen: Set<string>, storage?: KeyValueStorage): Set<string> {
  const next = new Set(seen);
  for (const n of notifications) {
    next.delete(n.id);
    next.add(n.id);
  }
  const trimmed = new Set([...next].slice(-MAX_SEEN));
  saveSeen(trimmed, storage);
  return trimmed;
}
