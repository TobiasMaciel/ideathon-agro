// Matches de una publicación (oferta o demanda) contra el catálogo, usando las funciones de @mapa/core/match.
import type { CatalogResponse } from '@mapa/core/api';
import type { Buyer, Generator } from '@mapa/core/data';
import { availableStates, evaluateMatch, type Overrides } from '@mapa/core/match';
import type { MaterialState } from '@mapa/core/viability';

export interface MatchItem {
  counterpartId: string;
  counterpartName: string;
  counterpartKind: 'generator' | 'buyer';
  locality: string;
  state: MaterialState;
  light: 'verde' | 'amarillo';
  marginPct: number;
  marginPerMonth: number;
  buyerSavingsPerMonth: number;
  distanceKm: number;
  counterpartCreatedAt?: string;
  counterpartOrigin?: 'curado' | 'publicacion';
}

/** Mejor estado (mayor margen) del par generador-comprador; undefined si ningún estado queda en verde o amarillo. */
function bestOf(catalog: CatalogResponse, generator: Generator, buyer: Buyer, overrides?: Overrides) {
  const material = catalog.materials.find((m) => m.id === generator.materialId);
  if (!material) return undefined;
  let best: { state: MaterialState; result: ReturnType<typeof evaluateMatch> } | undefined;
  for (const state of availableStates(material)) {
    let result;
    try {
      result = evaluateMatch({
        generator,
        buyer,
        material,
        state,
        alternatives: catalog.alternatives,
        assumptions: catalog.assumptions,
        overrides,
      });
    } catch {
      continue; // par no evaluable (p. ej. alternativa desconocida)
    }
    if (result.light === 'rojo') continue;
    if (!best || result.marginPerMonth > best.result.marginPerMonth) best = { state, result };
  }
  return best;
}

function toItem(
  other: Generator | Buyer,
  kind: MatchItem['counterpartKind'],
  best: NonNullable<ReturnType<typeof bestOf>>,
): MatchItem {
  return {
    counterpartId: other.id,
    counterpartName: other.name,
    counterpartKind: kind,
    locality: other.locality,
    state: best.state,
    light: best.result.light as 'verde' | 'amarillo',
    marginPct: best.result.marginPct,
    marginPerMonth: best.result.marginPerMonth,
    buyerSavingsPerMonth: best.result.buyerSavingsPerMonth,
    distanceKm: best.result.distanceKm,
    counterpartCreatedAt: other.createdAt,
    counterpartOrigin: other.origin,
  };
}

/** Matches verdes/amarillos de una publicación; verde primero, luego por margen desc. */
export function matchesForListing(args: { listingId: string; catalog: CatalogResponse; overrides?: Overrides }): MatchItem[] {
  const { listingId, catalog, overrides } = args;
  const items: MatchItem[] = [];
  const generator = catalog.generators.find((g) => g.id === listingId);
  if (generator) {
    for (const buyer of catalog.buyers) {
      if (!buyer.accepts.includes(generator.materialId)) continue;
      const best = bestOf(catalog, generator, buyer, overrides);
      if (best) items.push(toItem(buyer, 'buyer', best));
    }
  } else {
    const buyer = catalog.buyers.find((b) => b.id === listingId);
    if (!buyer) return [];
    for (const g of catalog.generators) {
      if (!buyer.accepts.includes(g.materialId)) continue;
      const best = bestOf(catalog, g, buyer, overrides);
      if (best) items.push(toItem(g, 'generator', best));
    }
  }
  const rank = (i: MatchItem) => (i.light === 'verde' ? 0 : 1);
  return items.sort((a, b) => rank(a) - rank(b) || b.marginPerMonth - a.marginPerMonth);
}
