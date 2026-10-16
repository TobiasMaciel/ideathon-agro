import { describe, expect, it } from 'vitest';
import { createMemoryRateLimiter, unlimitedRateLimiter } from './memory-rate-limiter';

describe('createMemoryRateLimiter', () => {
  it('rechaza al pasar el máximo de la ventana y no cuenta los rechazados', async () => {
    let t = 0;
    const limiter = createMemoryRateLimiter({ create: [{ max: 2, windowMs: 100 }], contact: [] }, () => t);
    expect(await limiter.allow('create', 'ip')).toBe(true);
    expect(await limiter.allow('create', 'ip')).toBe(true);
    expect(await limiter.allow('create', 'ip')).toBe(false);
    t = 100;
    expect(await limiter.allow('create', 'ip')).toBe(true);
  });

  it('cada clave y cada bucket se cuentan por separado', async () => {
    const limiter = createMemoryRateLimiter({ create: [{ max: 1, windowMs: 1000 }], contact: [{ max: 1, windowMs: 1000 }] });
    expect(await limiter.allow('create', 'a')).toBe(true);
    expect(await limiter.allow('create', 'b')).toBe(true);
    expect(await limiter.allow('contact', 'a')).toBe(true);
    expect(await limiter.allow('create', 'a')).toBe(false);
  });

  it('aplica todas las ventanas (por hora y por día)', async () => {
    let t = 0;
    const limiter = createMemoryRateLimiter(
      { create: [{ max: 2, windowMs: 10 }, { max: 3, windowMs: 1000 }], contact: [] },
      () => t,
    );
    for (const at of [0, 1, 20]) {
      t = at;
      expect(await limiter.allow('create', 'ip')).toBe(true);
    }
    t = 40;
    expect(await limiter.allow('create', 'ip')).toBe(false);
  });

  it('dos instancias no comparten registro', async () => {
    const limits = { create: [{ max: 1, windowMs: 1000 }], contact: [] };
    const a = createMemoryRateLimiter(limits);
    const b = createMemoryRateLimiter(limits);
    expect(await a.allow('create', 'ip')).toBe(true);
    expect(await b.allow('create', 'ip')).toBe(true);
  });
});

describe('unlimitedRateLimiter', () => {
  it('siempre permite', async () => {
    for (let i = 0; i < 100; i++) expect(await unlimitedRateLimiter.allow()).toBe(true);
  });
});
