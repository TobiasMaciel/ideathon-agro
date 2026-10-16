import type { ListingInput, StoredListing } from '@mapa/core/listings';
import type { ListingRepository } from '@mapa/core/ports';

export const MEMORY_LISTINGS_MAX = 500;

/**
 * Modo demo (sin DATABASE_URL): publicaciones en memoria del isolate. Se pierden al reiniciar y no se
 * comparten entre isolates. Tope de `max`: al pasarlo, descarta la más antigua.
 */
export function createMemoryListingRepository(max = MEMORY_LISTINGS_MAX) {
  const memory: StoredListing[] = [];
  return {
    async list() {
      return [...memory];
    },
    async get(id: string) {
      return memory.find((l) => l.id === id);
    },
    async add(input: ListingInput) {
      const stored: StoredListing = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), input };
      memory.push(stored);
      if (memory.length > max) memory.splice(0, memory.length - max);
      return stored;
    },
  } satisfies ListingRepository;
}
