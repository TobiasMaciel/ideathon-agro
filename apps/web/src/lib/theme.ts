import { useSyncExternalStore } from 'react';

/**
 * Tema claro / oscuro. El valor inicial lo pone un script inline en index.html (antes del primer paint, sin parpadeo)
 * como `data-theme` en <html>; los tokens de index.css se redefinen bajo `[data-theme="light"]`.
 * Esta lógica es el espejo de ese script: si cambia una, cambia la otra. Default: claro.
 */
export type Theme = 'dark' | 'light';

export const THEME_KEY = 'theme';

type ReadStorage = Pick<Storage, 'getItem'>;
type WriteStorage = Pick<Storage, 'setItem'>;

function defaultStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Preferencia guardada, o null si no hay, es inválida o el almacenamiento está bloqueado. */
export function readStoredTheme(storage: ReadStorage | null = defaultStorage()): Theme | null {
  try {
    const v = storage?.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme, storage: WriteStorage | null = defaultStorage()): void {
  try {
    storage?.setItem(THEME_KEY, theme);
  } catch {
    /* modo privado o almacenamiento bloqueado: el tema vale solo para esta visita */
  }
}

/** La preferencia guardada gana; si no hay, modo claro (el principal; no sigue a prefers-color-scheme). */
export function resolveTheme(stored: Theme | null): Theme {
  return stored ?? 'light';
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

const listeners = new Set<() => void>();

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}

/** Cambia el tema elegido por la persona y lo recuerda. */
export function setTheme(theme: Theme): void {
  storeTheme(theme);
  apply(theme);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => 'light');
}
