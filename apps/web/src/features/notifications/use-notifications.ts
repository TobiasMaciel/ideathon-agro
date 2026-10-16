import { useCallback, useMemo, useState } from 'react';
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/contracts';
import { computeNotifications, loadSeen, markAllSeen, markIdsSeen, markSeen, newMatchNotice, notificationId } from './inbox';
import { matchesForListing, type MatchItem } from './matches';
import { loadMyListings, rememberListing, type MyListing } from './my-listings';
import type { CatalogDiff } from './poll';

/** Fecha del servidor si se puede leer; si no, ahora. */
function serverDate(iso: string | undefined): Date {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? new Date() : new Date(t);
}

/** Mis publicaciones (en este navegador), sus matches como notificaciones y qué ya leí. */
export function useNotifications(catalog: CatalogResponse) {
  const [mine, setMine] = useState<MyListing[]>(() => loadMyListings());
  const [seen, setSeen] = useState<Set<string>>(() => loadSeen());
  const notifications = useMemo(() => computeNotifications({ myListings: mine, catalog, seen }), [mine, catalog, seen]);
  const unread = notifications.filter((n) => n.isNew).length;

  /** Recuerda la publicación recién creada y devuelve sus matches; como se muestran en ese momento, quedan leídos. */
  const remember = useCallback((created: ListingCreatedResponse, next: CatalogResponse): MatchItem[] => {
    const id = created.listing.id;
    setMine(rememberListing(id, created.kind, undefined, serverDate(created.listing.createdAt)));
    const matches = matchesForListing({ listingId: id, catalog: next });
    setSeen((s) => markIdsSeen(matches.map((m) => notificationId(id, m.counterpartId)), s));
    return matches;
  }, []);

  /** Texto del aviso si la consulta trajo un match nuevo para mis publicaciones; si no, null. */
  const announce = useCallback(
    (next: CatalogResponse, diff: CatalogDiff) => newMatchNotice(computeNotifications({ myListings: mine, catalog: next, seen: new Set() }), diff),
    [mine],
  );

  const markRead = useCallback((id: string) => setSeen((s) => markSeen(id, s)), []);
  const markAllRead = useCallback(() => setSeen((s) => markAllSeen(notifications, s)), [notifications]);

  return { notifications, unread, remember, announce, markRead, markAllRead };
}
