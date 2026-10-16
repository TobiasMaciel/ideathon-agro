import { afterEach, describe, expect, it, vi } from 'vitest';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@mapa/core/data';
import { getDataSet, type DataSource } from './repository';

const local = { sources, materials, alternatives, assumptions, generators, buyers };
const okSource: DataSource = { load: async () => local };
const failingSource: DataSource = {
  load: async () => {
    throw new Error('boom');
  },
};
const withDb = { DATABASE_URL: 'postgres://fake' };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getDataSet', () => {
  it('sin source usa los datos de core con origin local', async () => {
    const { origin, data } = await getDataSet(withDb);
    expect(origin).toBe('local');
    expect(data.generators).toHaveLength(generators.length);
    expect(data.buyers).toHaveLength(buyers.length);
    expect(data.materials).toHaveLength(materials.length);
    expect(data.sources).toHaveLength(sources.length);
  });

  it('con DATABASE_URL vacío ignora el source y usa local', async () => {
    const load = vi.fn(okSource.load);
    const { origin } = await getDataSet({ DATABASE_URL: '' }, { load });
    expect(origin).toBe('local');
    expect(load).not.toHaveBeenCalled();
  });

  it('con source y DATABASE_URL devuelve origin database y los datos del source', async () => {
    const { origin, data } = await getDataSet(withDb, okSource);
    expect(origin).toBe('database');
    expect(data).toEqual(local);
  });

  it('si el source falla, cae a local y lo registra', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { origin, data } = await getDataSet(withDb, failingSource);
    expect(origin).toBe('local');
    expect(data.buyers).toHaveLength(buyers.length);
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'boom');
  });
});
