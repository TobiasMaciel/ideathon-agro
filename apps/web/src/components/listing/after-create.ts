// Qué pasa en el estado del front después de crear una publicación (lógica pura).
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/api';
import type { Buyer, Generator } from '@mapa/core/data';
import { haversineKm } from '@mapa/core/viability';

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

/**
 * Selección tras publicar. Oferta: queda como "Tu planta". Demanda: queda como comprador elegido; si la planta actual
 * no genera un material que acepta, se cambia a la planta más cercana que sí, para que aparezca en el ranking.
 */
export function selectionAfterCreate(
  catalog: CatalogResponse,
  currentGeneratorId: string,
  created: ListingCreatedResponse,
): { generatorId: string; buyerId: string | null } {
  if (created.kind === 'oferta') return { generatorId: created.listing.id, buyerId: null };
  const buyer = created.listing as Buyer;
  const current = catalog.generators.find((g) => g.id === currentGeneratorId);
  if (current && buyer.accepts.includes(current.materialId)) return { generatorId: current.id, buyerId: buyer.id };
  const nearest = catalog.generators
    .filter((g) => buyer.accepts.includes(g.materialId))
    .map((g) => ({ g, km: haversineKm(g.location, buyer.location) }))
    .sort((a, b) => a.km - b.km)[0]?.g;
  return nearest ? { generatorId: nearest.id, buyerId: buyer.id } : { generatorId: currentGeneratorId, buyerId: null };
}
