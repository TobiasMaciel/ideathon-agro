import { describe, expect, it } from 'vitest';
import type { CatalogResponse } from '@mapa/core/api';
import { alternatives, assumptions, buyers, generators, materials, sources, type Buyer, type Generator } from '@mapa/core/data';
import { matchesForListing } from './matches';

const base: CatalogResponse = { origin: 'local', sources, materials, alternatives, assumptions, generators, buyers };
const mercedes = generators.find((g) => g.id === 'molinos-ala-mercedes')!;
const curuzu = buyers.find((b) => b.id === 'duhalde-curuzu')!;

const myOffer: Generator = {
  ...mercedes,
  id: 'pub-oferta-1',
  name: 'Mi cascarilla',
  origin: 'publicacion',
  verified: false,
  createdAt: '2026-10-01T00:00:00.000Z',
};
const myDemand: Buyer = {
  ...curuzu,
  id: 'pub-demanda-1',
  name: 'Mi frigorífico',
  origin: 'publicacion',
  verified: false,
  createdAt: '2026-10-01T00:00:00.000Z',
};

describe('matchesForListing', () => {
  it('oferta de cascarilla en Mercedes: incluye duhalde-curuzu en verde y solo compradores que aceptan cascarilla', () => {
    const catalog = { ...base, generators: [...generators, myOffer] };
    const items = matchesForListing({ listingId: 'pub-oferta-1', catalog });
    const duhalde = items.find((i) => i.counterpartId === 'duhalde-curuzu');
    expect(duhalde?.light).toBe('verde');
    expect(['compactado', 'pellet']).toContain(duhalde?.state);
    expect(duhalde?.counterpartKind).toBe('buyer');
    const noAccept = buyers.filter((b) => !b.accepts.includes('cascarilla')).map((b) => b.id);
    expect(items.some((i) => noAccept.includes(i.counterpartId))).toBe(false);
    expect(items.every((i) => i.light === 'verde' || i.light === 'amarillo')).toBe(true);
  });

  it('demanda de frigorífico en Curuzú que acepta cascarilla: incluye molinos-ala-mercedes', () => {
    const catalog = { ...base, buyers: [...buyers, myDemand] };
    const items = matchesForListing({ listingId: 'pub-demanda-1', catalog });
    const molino = items.find((i) => i.counterpartId === 'molinos-ala-mercedes');
    expect(molino).toBeDefined();
    expect(molino?.counterpartKind).toBe('generator');
    expect(molino?.light).toBe('verde');
  });

  it('ordena verde primero y luego por margen descendente', () => {
    const catalog = { ...base, generators: [...generators, myOffer] };
    const items = matchesForListing({ listingId: 'pub-oferta-1', catalog });
    for (let i = 1; i < items.length; i++) {
      const a = items[i - 1];
      const b = items[i];
      if (a.light === b.light) expect(a.marginPerMonth).toBeGreaterThanOrEqual(b.marginPerMonth);
      else expect(a.light).toBe('verde');
    }
  });

  it('devuelve un solo ítem por contraparte (el mejor estado)', () => {
    const catalog = { ...base, generators: [...generators, myOffer] };
    const items = matchesForListing({ listingId: 'pub-oferta-1', catalog });
    expect(new Set(items.map((i) => i.counterpartId)).size).toBe(items.length);
  });

  it('id inexistente devuelve lista vacía', () => {
    expect(matchesForListing({ listingId: 'no-existe', catalog: base })).toEqual([]);
  });
});
