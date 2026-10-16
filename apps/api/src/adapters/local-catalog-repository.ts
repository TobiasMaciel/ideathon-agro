import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import type { Catalog } from '@mapa/core/catalog';
import type { CatalogRepository } from '@mapa/core/ports';

/** Catálogo curado de @mapa/core/data: sin base, o como respaldo si la base falla. */
export function createLocalCatalogRepository() {
  const catalog: Catalog = { sources, materials, alternatives, assumptions, generators, buyers };
  return {
    load: async () => catalog,
    ping: async () => true,
  } satisfies CatalogRepository;
}
