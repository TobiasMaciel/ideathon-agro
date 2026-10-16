import { describe, expect, it } from 'vitest';
import type { CatalogResponse } from '@mapa/core/api';
import { alternatives, assumptions, buyers, generators, materials, sources, type Buyer, type Generator } from '@mapa/core/data';
import { computeNotifications, loadSeen, markAllSeen, markSeen, saveSeen } from './inbox';
import type { MyListing } from './my-listings';
import type { KeyValueStorage } from './storage';

const mercedes = generators.find((g) => g.id === 'molinos-ala-mercedes')!;
const curuzu = buyers.find((b) => b.id === 'duhalde-curuzu')!;

const myOffer: Generator = { ...mercedes, id: 'mia', name: 'Mi cascarilla', origin: 'publicacion', createdAt: '2026-10-10T00:00:00.000Z' };
// Demanda ya existente al publicar y demanda posterior.
const oldDemand: Buyer = { ...curuzu, id: 'vieja', name: 'Frigorífico Viejo', origin: 'publicacion', createdAt: '2026-10-01T00:00:00.000Z' };
const newDemand: Buyer = { ...curuzu, id: 'nueva', name: 'Frigorífico Nuevo', origin: 'publicacion', createdAt: '2026-10-12T00:00:00.000Z' };

const catalog: CatalogResponse = {
  origin: 'local',
  sources,
  materials,
  alternatives,
  assumptions,
  generators: [...generators, myOffer],
  buyers: [...buyers, oldDemand, newDemand],
};
const mine: MyListing[] = [{ id: 'mia', kind: 'oferta', createdAt: '2026-10-10T00:00:00.000Z' }];

function memoryStorage(): KeyValueStorage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v) };
}
const broken: KeyValueStorage = {
  getItem: () => {
    throw new Error('denegado');
  },
  setItem: () => {
    throw new Error('cuota');
  },
};

describe('computeNotifications', () => {
  it('distingue nuevo-match de match-inicial por createdAt', () => {
    const list = computeNotifications({ myListings: mine, catalog, seen: new Set() });
    expect(list.find((n) => n.id === 'mia:nueva')?.type).toBe('nuevo-match');
    expect(list.find((n) => n.id === 'mia:vieja')?.type).toBe('match-inicial');
    expect(list.find((n) => n.id === 'mia:duhalde-curuzu')?.type).toBe('match-inicial');
  });

  it('el texto del nuevo match está en español y menciona al comprador', () => {
    const n = computeNotifications({ myListings: mine, catalog, seen: new Set() }).find((x) => x.id === 'mia:nueva')!;
    expect(n.text).toMatch(/^Nueva demanda compatible: Frigorífico Nuevo te cierra al \d+ % \(/);
  });

  it('isNew respeta seen', () => {
    const list = computeNotifications({ myListings: mine, catalog, seen: new Set(['mia:nueva']) });
    expect(list.find((n) => n.id === 'mia:nueva')?.isNew).toBe(false);
    expect(list.find((n) => n.id === 'mia:vieja')?.isNew).toBe(true);
  });

  it('markAllSeen deja todo leído', () => {
    const first = computeNotifications({ myListings: mine, catalog, seen: new Set() });
    const seen = markAllSeen(first, new Set());
    expect(computeNotifications({ myListings: mine, catalog, seen }).every((n) => !n.isNew)).toBe(true);
  });

  it('ignora publicaciones que ya no están en el catálogo', () => {
    const gone: MyListing[] = [{ id: 'borrada', kind: 'oferta', createdAt: '2026-10-10T00:00:00.000Z' }];
    expect(computeNotifications({ myListings: gone, catalog, seen: new Set() })).toEqual([]);
  });
});

describe('seen storage', () => {
  it('guarda y carga ids vistos', () => {
    const s = memoryStorage();
    saveSeen(new Set(['a', 'b']), s);
    expect(loadSeen(s)).toEqual(new Set(['a', 'b']));
    expect(markSeen('c', loadSeen(s), s)).toEqual(new Set(['a', 'b', 'c']));
  });

  it('tope de 500 conservando los más recientes', () => {
    const s = memoryStorage();
    saveSeen(new Set(Array.from({ length: 520 }, (_, i) => `id${i}`)), s);
    const seen = loadSeen(s);
    expect(seen.size).toBe(500);
    expect(seen.has('id519')).toBe(true);
    expect(seen.has('id0')).toBe(false);
  });

  it('storage que lanza excepción no rompe', () => {
    expect(loadSeen(broken)).toEqual(new Set());
    expect(() => saveSeen(new Set(['a']), broken)).not.toThrow();
    expect(markSeen('x', new Set(), broken)).toEqual(new Set(['x']));
  });
});
