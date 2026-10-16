// Acceso seguro a storage: si falla (modo privado, cuota, SSR), no rompe.
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function defaultStorage(): KeyValueStorage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function readJson<T>(key: string, storage: KeyValueStorage | undefined = defaultStorage()): T | undefined {
  try {
    const raw = storage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeJson(key: string, value: unknown, storage: KeyValueStorage | undefined = defaultStorage()): void {
  try {
    storage?.setItem(key, JSON.stringify(value));
  } catch {
    // Sin persistencia: se sigue funcionando en memoria.
  }
}
