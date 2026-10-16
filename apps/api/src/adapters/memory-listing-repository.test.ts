import { describe, expect, it } from 'vitest';
import type { ListingInput } from '@mapa/core/listings';
import { createMemoryListingRepository, MEMORY_LISTINGS_MAX } from './memory-listing-repository';

const oferta: ListingInput = {
  kind: 'oferta',
  name: 'Aserradero Don Pepe',
  lat: -27.58,
  lng: -56.69,
  materialId: 'aserrin',
  tonsPerMonth: 120,
  contact: { phone: '379 412-3456' },
};

describe('createMemoryListingRepository', () => {
  it('guarda con uuid y fecha, y la devuelve por id y en la lista', async () => {
    const repo = createMemoryListingRepository();
    const stored = await repo.add(oferta);
    expect(stored.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(stored.createdAt))).toBe(false);
    expect(await repo.get(stored.id)).toEqual(stored);
    expect(await repo.list()).toEqual([stored]);
  });

  it('get de un id inexistente da undefined', async () => {
    expect(await createMemoryListingRepository().get('no-existe')).toBeUndefined();
  });

  it(`tiene tope (${MEMORY_LISTINGS_MAX} por defecto) y descarta las más antiguas`, async () => {
    const repo = createMemoryListingRepository(3);
    const first = await repo.add(oferta);
    for (let i = 0; i < 3; i++) await repo.add(oferta);
    const all = await repo.list();
    expect(all).toHaveLength(3);
    expect(all.some((l) => l.id === first.id)).toBe(false);
  });

  it('dos instancias no comparten publicaciones', async () => {
    const a = createMemoryListingRepository();
    await a.add(oferta);
    expect(await createMemoryListingRepository().list()).toEqual([]);
  });
});
