// Qué queda elegido después de crear una publicación (lógica pura).
import type { Buyer, CatalogResponse, ListingCreatedResponse } from '@mapa/core/contracts';
import { haversineKm } from '@mapa/core/viability';

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
