import { describe, expect, it } from 'vitest';
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/contracts';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import { listingToBuyer, listingToGenerator, type ListingInput } from '@mapa/core/listings';
import { insertListing } from './insert-listing';

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

describe('insertListing', () => {
  it('una oferta entra como generador sin tocar el catálogo anterior', () => {
    const next = insertListing(catalog, oferta());
    expect(next.generators).toHaveLength(catalog.generators.length + 1);
    expect(next.generators.at(-1)?.id).toBe('pub-a1');
    expect(next.buyers).toBe(catalog.buyers);
    expect(catalog.generators.some((g) => g.id === 'pub-a1')).toBe(false);
  });

  it('una demanda entra como comprador', () => {
    const next = insertListing(catalog, demanda('cascarilla'));
    expect(next.buyers.at(-1)?.id).toBe('pub-b1');
    expect(next.generators).toBe(catalog.generators);
  });

  it('si ya estaba (reintento), no la duplica', () => {
    const once = insertListing(catalog, oferta());
    expect(insertListing(once, oferta()).generators).toHaveLength(once.generators.length);
  });
});
