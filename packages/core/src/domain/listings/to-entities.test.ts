import { describe, expect, it } from 'vitest';
import { assumptions } from '../../data/assumptions';
import { buyers } from '../../data/buyers';
import { generators } from '../../data/generators';
import { alternatives, materials } from '../../data/materials';
import { evaluateMatch } from '../match';
import { listingToBuyer, listingToGenerator, storedToEntry } from './to-entities';
import type { ListingInput } from './types';
import { validateListing } from './validate';

const oferta = {
  kind: 'oferta',
  name: 'Aserradero Don Pepe',
  locality: 'Ituzaingó',
  lat: -27.58,
  lng: -56.69,
  materialId: 'aserrin',
  tonsPerMonth: 120,
  moisture: 0.4,
  seasonality: 'Todo el año',
  contact: { name: 'Pepe', phone: '+54 379 412-3456' },
};
const demanda = {
  kind: 'demanda',
  name: 'Secadero La Esperanza',
  lat: -28.05,
  lng: -56.0,
  materialId: 'aserrin',
  tonsPerMonth: 80,
  currentAlternative: 'lena',
  sector: 'secadero_granos',
  contact: { email: 'compras@esperanza.com.ar' },
};

describe('listingToGenerator / listingToBuyer', () => {
  const o = validateListing(oferta) as { ok: true; value: ListingInput };
  const d = validateListing(demanda) as { ok: true; value: ListingInput };
  const at = '2026-10-16T12:00:00.000Z';

  it('mapea la oferta a un generador sin verificar', () => {
    const g = listingToGenerator(o.value, 'abc', at);
    expect(g).toMatchObject({
      id: 'pub-abc',
      kind: 'aserradero',
      locality: 'Ituzaingó',
      location: { lat: -27.58, lng: -56.69 },
      locationNote: 'ubicación marcada por quien publicó',
      materialId: 'aserrin',
      seasonality: 'Todo el año',
      sourceIds: [],
      origin: 'publicacion',
      verified: false,
      createdAt: at,
    });
    expect(JSON.stringify(g)).not.toContain('412-3456');
    expect(g.tonsPerMonth).toEqual({
      value: 120,
      tag: 'estimado',
      sourceIds: [],
      note: 'declarado por quien publicó, sin verificar',
    });
  });
  it('cascarilla es de molino arrocero; sin estacionalidad dice "Sin dato"', () => {
    const g = listingToGenerator({ ...o.value, materialId: 'cascarilla', seasonality: undefined }, 'x', at);
    expect(g.kind).toBe('molino_arrocero');
    expect(g.seasonality).toBe('Sin dato');
  });
  it('mapea la demanda a un comprador sin verificar', () => {
    const b = listingToBuyer(d.value, 'xyz', at);
    expect(b).toMatchObject({
      id: 'pub-xyz',
      sector: 'secadero_granos',
      currentAlternative: 'lena',
      accepts: ['aserrin'],
      origin: 'publicacion',
      verified: false,
      createdAt: at,
    });
    expect(b.demandTonsPerMonth).toMatchObject({ value: 80, tag: 'estimado', sourceIds: [] });
    expect(b.currentAlternativeTag.value).toBe('lena');
  });
  it('un comprador publicado se evalúa contra un generador curado sin romper', () => {
    const buyer = listingToBuyer({ ...d.value, materialId: 'cascarilla' }, 'xyz', at);
    const generator = generators.find((g) => g.materialId === 'cascarilla')!;
    const material = materials.find((m) => m.id === 'cascarilla')!;
    const result = evaluateMatch({ generator, buyer, material, state: 'suelto', alternatives, assumptions });
    expect(Number.isFinite(result.marginPerMonth)).toBe(true);
  });
  it('un generador publicado se evalúa contra un comprador curado', () => {
    const generator = listingToGenerator(o.value, 'abc', at);
    const material = materials.find((m) => m.id === 'aserrin')!;
    const buyer = buyers.find((b) => b.accepts.includes('aserrin'))!;
    const result = evaluateMatch({ generator, buyer, material, state: 'suelto', alternatives, assumptions });
    expect(result).toBeDefined();
  });
});

describe('storedToEntry', () => {
  const o = validateListing(oferta) as { ok: true; value: ListingInput };
  const d = validateListing(demanda) as { ok: true; value: ListingInput };
  const at = '2026-10-16T12:00:00.000Z';

  it('una oferta guardada es un generador con id pub-<uuid>', () => {
    const entry = storedToEntry({ id: 'u1', createdAt: at, input: o.value });
    expect(entry.kind).toBe('oferta');
    if (entry.kind === 'oferta') expect(entry.generator.id).toBe('pub-u1');
  });
  it('una demanda guardada es un comprador', () => {
    const entry = storedToEntry({ id: 'u2', createdAt: at, input: d.value });
    expect(entry.kind).toBe('demanda');
    if (entry.kind === 'demanda') expect(entry.buyer.id).toBe('pub-u2');
  });
});
