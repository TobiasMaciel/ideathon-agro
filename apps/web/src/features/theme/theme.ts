import { useSyncExternalStore } from 'react';
import { readString, writeString, type KeyValueStorage } from '@/shared/storage';

/**
 * Tema claro / oscuro. El valor inicial lo pone un script inline en index.html (antes del primer paint, sin parpadeo)
 * como `data-theme` en <html>; los tokens de index.css se redefinen bajo `[data-theme="light"]`.
 * Esta lógica es el espejo de ese script: si cambia una, cambia la otra. Default: claro.
 */
export type Theme = 'dark' | 'light';

export const THEME_KEY = 'theme';

/** Preferencia guardada, o null si no hay, es inválida o el almacenamiento está bloqueado. */
export function readStoredTheme(storage?: Pick<KeyValueStorage, 'getItem'>): Theme | null {
  const v = readString(THEME_KEY, storage);
  return v === 'light' || v === 'dark' ? v : null;
}

/** Recuerda la elección (con el almacenamiento bloqueado, el tema vale solo para esta visita). */
export function storeTheme(theme: Theme, storage?: Pick<KeyValueStorage, 'setItem'>): void {
  writeString(THEME_KEY, theme, storage);
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
