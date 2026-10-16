import { describe, expect, it, vi } from 'vitest';
import type { CatalogResponse } from '@mapa/core/contracts';
import { createPoller, diffCatalog, pollIntervalMs } from './poll';

const cat = (g: string[], b: string[]) =>
  ({ generators: g.map((id) => ({ id })), buyers: b.map((id) => ({ id })) }) as unknown as CatalogResponse;

describe('diffCatalog', () => {
  it('devuelve ids nuevos de generators y buyers', () => {
    expect(diffCatalog(cat(['g1'], ['b1']), cat(['g1', 'g2'], ['b1', 'b2']))).toEqual({
      generators: ['g2'],
      buyers: ['b2'],
    });
  });
  it('sin cambios o sin catálogo previo devuelve vacío', () => {
    expect(diffCatalog(cat(['g1'], []), cat(['g1'], []))).toEqual({ generators: [], buyers: [] });
    expect(diffCatalog(undefined, cat(['g1'], ['b1']))).toEqual({ generators: [], buyers: [] });
  });
});

/** Timers falsos manuales: guardan el callback y el delay. */
function fakeTimers() {
  let next: { fn: () => void; ms: number } | undefined;
  return {
    setTimeoutFn: ((fn: () => void, ms: number) => {
      next = { fn, ms };
      return 1;
    }) as unknown as typeof setTimeout,
    clearTimeoutFn: (() => {
      next = undefined;
    }) as unknown as typeof clearTimeout,
    pending: () => next,
    async fire() {
      const t = next;
      next = undefined;
      t?.fn();
      for (let i = 0; i < 5; i++) await Promise.resolve();
    },
  };
}

describe('createPoller', () => {
  it('consulta al iniciar y reprograma cada intervalo; avisa onChange con el catálogo', async () => {
    const t = fakeTimers();
    const fetchCatalog = vi.fn().mockResolvedValue(cat([], []));
    const onChange = vi.fn();
    const p = createPoller({ fetchCatalog, onChange, ...t });
    p.start();
    await t.fire();
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(t.pending()?.ms).toBe(20000);
    await t.fire();
    expect(fetchCatalog).toHaveBeenCalledTimes(2);
  });

  it('backoff x2 hasta 2 min ante error y vuelve al intervalo al recuperarse', async () => {
    const t = fakeTimers();
    const fetchCatalog = vi.fn().mockRejectedValue(new Error('red'));
    const p = createPoller({ fetchCatalog, onChange: vi.fn(), ...t });
    p.start();
    const delays: number[] = [];
    for (let i = 0; i < 5; i++) {
      await t.fire();
      delays.push(t.pending()!.ms);
    }
    expect(delays).toEqual([40000, 80000, 120000, 120000, 120000]);
    fetchCatalog.mockResolvedValue(cat([], []));
    await t.fire();
    expect(t.pending()?.ms).toBe(20000);
  });

  it('no solapa requests: si hay una en vuelo, no dispara otra', async () => {
    const t = fakeTimers();
    let resolve!: (c: CatalogResponse) => void;
    const fetchCatalog = vi.fn(() => new Promise<CatalogResponse>((r) => (resolve = r)));
    const p = createPoller({ fetchCatalog, onChange: vi.fn(), ...t });
    p.start();
    await t.fire();
    await p.tick();
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
    resolve(cat([], []));
    await Promise.resolve();
  });

  it('stop cancela el timer y descarta respuestas en vuelo', async () => {
    const t = fakeTimers();
    let resolve!: (c: CatalogResponse) => void;
    const onChange = vi.fn();
    const p = createPoller({ fetchCatalog: () => new Promise<CatalogResponse>((r) => (resolve = r)), onChange, ...t });
    p.start();
    await t.fire();
    p.stop();
    resolve(cat([], []));
    for (let i = 0; i < 5; i++) await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
    expect(t.pending()).toBeUndefined();
  });

  it('pausa (no consulta) si isHidden() es true y sigue reprogramando', async () => {
    const t = fakeTimers();
    let hidden = true;
    const fetchCatalog = vi.fn().mockResolvedValue(cat([], []));
    const p = createPoller({ fetchCatalog, onChange: vi.fn(), isHidden: () => hidden, ...t });
    p.start();
    await t.fire();
    expect(fetchCatalog).not.toHaveBeenCalled();
    expect(t.pending()?.ms).toBe(20000);
    hidden = false;
    await t.fire();
    expect(fetchCatalog).toHaveBeenCalledTimes(1);
  });
});

describe('pollIntervalMs', () => {
  it('por defecto, cada 20 s', () => {
    expect(pollIntervalMs('')).toBe(20_000);
    expect(pollIntervalMs('?otra=1')).toBe(20_000);
  });
  it('?pollMs= lo baja (para los e2e), con un mínimo de 500 ms', () => {
    expect(pollIntervalMs('?pollMs=1000')).toBe(1000);
    expect(pollIntervalMs('?pollMs=10')).toBe(500);
  });
  it('un valor que no es número se ignora', () => {
    expect(pollIntervalMs('?pollMs=rapido')).toBe(20_000);
  });
});
