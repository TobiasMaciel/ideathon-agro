import { BUYER_SECTORS, isOneOf } from '@mapa/core/catalog';
import type { BuyersResponse, CatalogResponse, GeneratorsResponse } from '@mapa/core/contracts';
import { storedToEntry } from '@mapa/core/listings';
import type { Deps } from './deps';
import { AppError } from './errors';

/** Catálogo curado + publicaciones abiertas (ofertas -> generators, demandas -> buyers), sin contacto. */
export async function getCatalog(deps: Pick<Deps, 'catalog' | 'listings'>): Promise<CatalogResponse> {
  const [catalog, stored] = await Promise.all([deps.catalog.load(), deps.listings.list()]);
  const generators = [...catalog.generators];
  const buyers = [...catalog.buyers];
  for (const s of stored) {
    const entry = storedToEntry(s);
    if (entry.kind === 'oferta') generators.push(entry.generator);
    else buyers.push(entry.buyer);
  }
  return { ...catalog, generators, buyers };
}

/** Generadores curados, opcionalmente filtrados por material. */
export async function listGenerators(deps: Pick<Deps, 'catalog'>, material: string | null): Promise<GeneratorsResponse> {
  const { materials, generators } = await deps.catalog.load();
  if (material !== null && !materials.some((m) => m.id === material)) {
    throw new AppError('invalid', `Material inválido: "${material}"`);
  }
  return { generators: material === null ? generators : generators.filter((g) => g.materialId === material) };
}

/** Compradores curados, opcionalmente filtrados por sector y por material aceptado. */
export async function listBuyers(
  deps: Pick<Deps, 'catalog'>,
  filter: { sector: string | null; accepts: string | null },
): Promise<BuyersResponse> {
  const { sector, accepts } = filter;
  if (sector !== null && !isOneOf(BUYER_SECTORS, sector)) throw new AppError('invalid', `Sector inválido: "${sector}"`);
  const { materials, buyers } = await deps.catalog.load();
  if (accepts !== null && !materials.some((m) => m.id === accepts)) {
    throw new AppError('invalid', `Material inválido: "${accepts}"`);
  }
  return {
    buyers: buyers.filter(
      (b) => (sector === null || b.sector === sector) && (accepts === null || b.accepts.some((m) => m === accepts)),
    ),
  };
}
