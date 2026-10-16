// Acceso seguro a localStorage: si falla (modo privado, cuota, almacenamiento bloqueado), no rompe.
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

export function readString(key: string, storage: Pick<KeyValueStorage, 'getItem'> | undefined = defaultStorage()): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string, storage: Pick<KeyValueStorage, 'setItem'> | undefined = defaultStorage()): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // Sin persistencia: se sigue funcionando en memoria.
  }
}

export function readJson<T>(key: string, storage: KeyValueStorage | undefined = defaultStorage()): T | undefined {
  try {
    const raw = readString(key, storage);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeJson(key: string, value: unknown, storage: KeyValueStorage | undefined = defaultStorage()): void {
  writeString(key, JSON.stringify(value), storage);
}
