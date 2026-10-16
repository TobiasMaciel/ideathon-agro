import { describe, expect, it } from 'vitest';
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/contracts';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import { listingToBuyer, listingToGenerator, type ListingInput } from '@mapa/core/listings';
import { insertListing } from '@/features/catalog';
import { selectionAfterCreate } from './after-create';

const catalog: CatalogResponse = { origin: 'local', sources, materials, alternatives, assumptions, generators, buyers };
const contact = { phone: '3794 412345' };
const NOW = '2026-10-16T12:00:00Z';

function oferta(): ListingCreatedResponse {
  const input: ListingInput = { kind: 'oferta', name: 'Aserradero El Ceibo', lat: -28.26, lng: -58.12, materialId: 'aserrin', tonsPerMonth: 120, contact };
  return { origin: 'local', kind: 'oferta', listing: listingToGenerator(input, 'a1', NOW) };
}

function demanda(materialId: ListingInput['materialId']): ListingCreatedResponse {
  const input: ListingInput = {
    kind: 'demanda',
    name: 'Secadero La Esperanza',
    lat: -28.05,
    lng: -56,
    materialId,
    tonsPerMonth: 8,
    currentAlternative: 'glp',
    sector: 'secadero_granos',
    contact,
  };
  return { origin: 'local', kind: 'demanda', listing: listingToBuyer(input, 'b1', NOW) };
}

describe('selectionAfterCreate', () => {
  it('oferta: queda elegida como planta, sin comprador fijo', () => {
    const next = insertListing(catalog, oferta());
    expect(selectionAfterCreate(next, 'molinos-ala-mercedes', oferta())).toEqual({ generatorId: 'pub-a1', buyerId: null });
  });

  it('demanda que acepta el material de la planta actual: se mantiene la planta y se elige el comprador', () => {
    const next = insertListing(catalog, demanda('cascarilla'));
    expect(selectionAfterCreate(next, 'molinos-ala-mercedes', demanda('cascarilla'))).toEqual({
      generatorId: 'molinos-ala-mercedes',
      buyerId: 'pub-b1',
    });
  });

  it('demanda de otro material: cambia a la planta más cercana que lo genera', () => {
    const next = insertListing(catalog, demanda('aserrin'));
    const sel = selectionAfterCreate(next, 'molinos-ala-mercedes', demanda('aserrin'));
    expect(sel.buyerId).toBe('pub-b1');
    const g = next.generators.find((x) => x.id === sel.generatorId);
    expect(g?.materialId).toBe('aserrin');
  });
});
