import { useSyncExternalStore } from 'react';

/**
 * Dos pantallas con ruteo por hash (sin servidor que conozca rutas): el mapa (default, así la demo abre directo
 * en la app) y la portada en `#/inicio`.
 */
export type Route = 'mapa' | 'inicio';

export const HREF: Record<Route, string> = { mapa: '#/mapa', inicio: '#/inicio' };

export function routeFromHash(hash: string): Route {
  return hash.replace(/^#\/?/, '') === 'inicio' ? 'inicio' : 'mapa';
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => routeFromHash(window.location.hash), () => 'mapa');
}

/** Marca que la persona ya vio (o descartó) la portada: el mapa deja de invitarla. */
export const INTRO_SEEN_KEY = 'intro-seen';
