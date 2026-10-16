// Catálogo en memoria del front: sumar una publicación recién creada (lógica pura).
import type { Buyer, CatalogResponse, Generator, ListingCreatedResponse } from '@mapa/core/contracts';

/** Agrega la publicación devuelta por la API al catálogo (oferta -> generadores, demanda -> compradores), sin duplicar. */
export function insertListing(catalog: CatalogResponse, created: ListingCreatedResponse): CatalogResponse {
  if (created.kind === 'oferta') {
    const g = created.listing as Generator;
    if (catalog.generators.some((x) => x.id === g.id)) return catalog;
    return { ...catalog, generators: [...catalog.generators, g] };
  }
  const b = created.listing as Buyer;
  if (catalog.buyers.some((x) => x.id === b.id)) return catalog;
  return { ...catalog, buyers: [...catalog.buyers, b] };
}
