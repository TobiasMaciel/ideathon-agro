import { describe, expect, it } from 'vitest';
import { forgetListing, loadMyListings, MAX_MY_LISTINGS, MY_LISTINGS_KEY, rememberListing } from './my-listings';
import type { KeyValueStorage } from '@/shared/storage';

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

describe('my-listings', () => {
  it('recuerda y olvida publicaciones', () => {
    const s = memoryStorage();
    rememberListing('a', 'oferta', s);
    rememberListing('b', 'demanda', s);
    expect(loadMyListings(s).map((l) => l.id)).toEqual(['a', 'b']);
    forgetListing('a', s);
    expect(loadMyListings(s).map((l) => l.id)).toEqual(['b']);
  });

  it('no duplica ids', () => {
    const s = memoryStorage();
    rememberListing('a', 'oferta', s);
    rememberListing('a', 'oferta', s);
    expect(loadMyListings(s)).toHaveLength(1);
  });

  it('tope de 50', () => {
    const s = memoryStorage();
    for (let i = 0; i < 60; i++) rememberListing(`x${i}`, 'oferta', s);
    const list = loadMyListings(s);
    expect(list).toHaveLength(MAX_MY_LISTINGS);
    expect(list.at(-1)?.id).toBe('x59');
  });

  it('JSON corrupto o storage que falla devuelve lista vacía y no lanza', () => {
    const s = memoryStorage();
    s.setItem(MY_LISTINGS_KEY, '{no es json');
    expect(loadMyListings(s)).toEqual([]);
    expect(loadMyListings(broken)).toEqual([]);
    expect(() => rememberListing('a', 'oferta', broken)).not.toThrow();
    expect(() => forgetListing('a', broken)).not.toThrow();
  });
});
