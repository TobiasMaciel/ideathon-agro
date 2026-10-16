import { afterEach, describe, expect, it, vi } from 'vitest';
import { alternatives, assumptions, buyers, generators, materials, sources } from '@/data';
import { toRows } from '@/lib/db/rows';

type Mode = 'none' | 'ok' | 'error';
const state = vi.hoisted(() => ({ mode: 'none' as 'none' | 'ok' | 'error', rows: {} as Record<string, unknown[]> }));

vi.mock('@/lib/db/supabase', () => ({
  getSupabase: () => {
    if (state.mode === 'none') return null;
    const query = (table: string) => {
      const result =
        state.mode === 'error'
          ? { data: null, error: { message: 'boom' } }
          : { data: state.rows[table], error: null };
      const q: { order: () => typeof q } & PromiseLike<typeof result> = {
        order: () => q,
        then: (a, b) => Promise.resolve(result).then(a, b),
      };
      return q;
    };
    return { from: (table: string) => ({ select: () => query(table) }) };
  },
}));

import { getDataSet } from './repository';

const local = { sources, materials, alternatives, assumptions, generators, buyers };
const setMode = (m: Mode) => {
  state.mode = m;
  state.rows = toRows(local) as unknown as Record<string, unknown[]>;
};

afterEach(() => {
  state.mode = 'none';
  vi.restoreAllMocks();
});

describe('getDataSet', () => {
  it('sin Supabase usa src/data con origin local', async () => {
    setMode('none');
    const { origin, data } = await getDataSet();
    expect(origin).toBe('local');
    expect(data.generators).toHaveLength(generators.length);
    expect(data.buyers).toHaveLength(buyers.length);
    expect(data.materials).toHaveLength(materials.length);
    expect(data.sources).toHaveLength(sources.length);
  });

  it('con Supabase devuelve origin supabase y los mismos datos', async () => {
    setMode('ok');
    const { origin, data } = await getDataSet();
    expect(origin).toBe('supabase');
    expect(data).toEqual(local);
  });

  it('si Supabase da error, cae a local y lo registra', async () => {
    setMode('error');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { origin, data } = await getDataSet();
    expect(origin).toBe('local');
    expect(data.buyers).toHaveLength(buyers.length);
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'boom');
  });
});
