// Lógica pura de la portada: un ejemplo por planta (qué pasa al venderla suelta, compactada o en pellet) y las cifras del catálogo.
import type { CatalogResponse, Generator, MaterialState } from '@mapa/core/contracts';
import { assumptionValues, availableStates, orderRanking, rankBuyers, viableRadiusMapKm, type RankedBuyer } from '@mapa/core/match';

export interface StateRow {
  state: MaterialState;
  roadKm: number;
  closes: number;
  buyers: number;
}

export interface Example {
  generator: Generator;
  rows: StateRow[];
  /** El mejor negocio de la planta (el de más margen entre los que cierran); null si ninguno cierra. */
  best: { state: MaterialState; match: RankedBuyer } | null;
}

export function buildExample(catalog: CatalogResponse, generator: Generator): Example | null {
  const material = catalog.materials.find((m) => m.id === generator.materialId);
  if (!material) return null;
  const values = assumptionValues(catalog.assumptions);
  const rows: StateRow[] = [];
  let best: Example['best'] = null;
  for (const state of availableStates(material)) {
    const ranking = orderRanking(
      rankBuyers({ generator, state, buyers: catalog.buyers, materials: catalog.materials, alternatives: catalog.alternatives, assumptions: catalog.assumptions }),
    );
    const closing = ranking.filter((r) => r.result.light === 'verde');
    rows.push({ state, roadKm: viableRadiusMapKm(material, state, catalog.assumptions) * values.routeFactor, closes: closing.length, buyers: ranking.length });
    const top = closing[0];
    if (top && (!best || top.result.marginPerMonth > best.match.result.marginPerMonth)) best = { state, match: top };
  }
  return { generator, rows, best };
}

/** Plantas curadas con al menos un negocio que cierra, la de la demo primero; como mucho `max`. */
export function pickExamples(catalog: CatalogResponse, first: string, max = 5): Example[] {
  const ordered = [...catalog.generators.filter((g) => g.id === first), ...catalog.generators.filter((g) => g.id !== first && g.origin !== 'publicacion')];
  const out: Example[] = [];
  for (const g of ordered) {
    if (out.length >= max) break;
    const ex = buildExample(catalog, g);
    if (ex?.best) out.push(ex);
  }
  return out;
}

export interface Figures {
  plants: number;
  tonsPerMonth: number;
  buyers: number;
  /** Plantas que tienen al menos un comprador con el que cierra, en su mejor forma de venta. */
  plantsThatClose: number;
}

export function catalogFigures(catalog: CatalogResponse): Figures {
  return {
    plants: catalog.generators.length,
    tonsPerMonth: catalog.generators.reduce((sum, g) => sum + g.tonsPerMonth.value, 0),
    buyers: catalog.buyers.length,
    plantsThatClose: catalog.generators.filter((g) => buildExample(catalog, g)?.best).length,
  };
}
