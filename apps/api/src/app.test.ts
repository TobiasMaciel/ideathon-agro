import { describe, expect, it } from 'vitest';
import { buyers, generators, materials } from '@mapa/core/data';
import type { ApiError, BuyersResponse, CatalogResponse, GeneratorsResponse, ViabilityResponse } from '@mapa/core/contracts';
import { createApp } from './app';
import { fakeCatalog, fakeDeps, fakeMakeDeps, localCatalog } from './test/fakes';

const env = { ALLOWED_ORIGINS: 'http://localhost:5173' };
const app = createApp(fakeMakeDeps());
const call = (req: Request) => Promise.resolve(app.request(req, undefined, env));
const get = (path: string) => call(new Request(`http://localhost${path}`));
const postViability = (body: unknown) =>
  call(
    new Request('http://localhost/api/viability', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );
const ok = { generatorId: 'molinos-ala-mercedes', buyerId: 'duhalde-curuzu', state: 'pellet' };

describe('GET /api/catalog', () => {
  it('devuelve todo el catálogo sin cache y sin origen', async () => {
    const res = await get('/api/catalog');
    const body = (await res.json()) as CatalogResponse;
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect('origin' in body).toBe(false);
    expect(body.generators).toHaveLength(generators.length);
    expect(body.buyers).toHaveLength(buyers.length);
  });
});

describe('GET /api/generators', () => {
  it('filtra por material', async () => {
    const body = (await (await get('/api/generators?material=cascarilla')).json()) as GeneratorsResponse;
    expect(body.generators.length).toBeGreaterThan(0);
    expect(body.generators.every((g) => g.materialId === 'cascarilla')).toBe(true);
    expect('origin' in body).toBe(false);
  });
  it('sin filtro devuelve todos', async () => {
    const body = (await (await get('/api/generators')).json()) as GeneratorsResponse;
    expect(body.generators).toHaveLength(generators.length);
  });
  it('material inválido da 400', async () => {
    const res = await get('/api/generators?material=oro');
    expect(res.status).toBe(400);
    expect(((await res.json()) as ApiError).error).toContain('oro');
  });
});

describe('GET /api/buyers', () => {
  it('filtra por sector', async () => {
    const body = (await (await get('/api/buyers?sector=yerbatera')).json()) as BuyersResponse;
    expect(body.buyers.length).toBeGreaterThan(0);
    expect(body.buyers.every((b) => b.sector === 'yerbatera')).toBe(true);
  });
  it('filtra por material aceptado', async () => {
    const body = (await (await get('/api/buyers?accepts=cascarilla')).json()) as BuyersResponse;
    expect(body.buyers.length).toBeGreaterThan(0);
    expect(body.buyers.every((b) => b.accepts.includes('cascarilla'))).toBe(true);
  });
  it('sector inválido da 400', async () => {
    expect((await get('/api/buyers?sector=x')).status).toBe(400);
  });
  it('accepts inválido da 400', async () => {
    expect((await get('/api/buyers?accepts=x')).status).toBe(400);
  });
});

describe('POST /api/viability', () => {
  it('pellet de cascarilla a Duhalde es verde', async () => {
    const res = await postViability(ok);
    const body = (await res.json()) as ViabilityResponse;
    expect(res.status).toBe(200);
    expect('origin' in body).toBe(false);
    expect(body.request).toEqual(ok);
    expect(body.result.light).toBe('verde');
  });
  it('suelto es rojo', async () => {
    const body = (await (await postViability({ ...ok, state: 'suelto' })).json()) as ViabilityResponse;
    expect(body.result.light).toBe('rojo');
  });
  it('acepta overrides válidos', async () => {
    expect((await postViability({ ...ok, overrides: { costPerKm: 5000, greenThreshold: 0.3 } })).status).toBe(200);
  });
  it('JSON inválido da 400', async () => {
    expect((await postViability('{no')).status).toBe(400);
  });
  it('campos faltantes o estado inválido dan 400', async () => {
    expect((await postViability({ ...ok, generatorId: undefined })).status).toBe(400);
    expect((await postViability({ ...ok, state: 'liquido' })).status).toBe(400);
    expect((await postViability([])).status).toBe(400);
  });
  it('overrides inválidos dan 400', async () => {
    for (const overrides of [{ foo: 1 }, { costPerKm: 0 }, { costPerKm: -1 }, { costPerKm: '5' }, { greenThreshold: 1.5 }, { usdArs: 1500 }, { costPerKm: 50 }, { truckMaxTons: 61 }, { routeFactor: 0.9 }, 5]) {
      expect((await postViability({ ...ok, overrides })).status).toBe(400);
    }
  });
  it('override fuera de rango responde 400 con el rango permitido', async () => {
    const res = await postViability({ ...ok, overrides: { costPerKm: 50 } });
    expect(res.status).toBe(400);
    const msg = ((await res.json()) as ApiError).error;
    expect(msg).toContain('100');
    expect(msg).toContain('100000');
  });
  it('ids desconocidos dan 404', async () => {
    expect((await postViability({ ...ok, generatorId: 'nope' })).status).toBe(404);
    expect((await postViability({ ...ok, buyerId: 'nope' })).status).toBe(404);
  });
  it('estado no disponible para el material da 422', async () => {
    const { pellet: _omit, ...states } = materials.find((m) => m.id === 'cascarilla')!.states;
    void _omit;
    const catalog = { ...localCatalog(), materials: materials.map((m) => (m.id === 'cascarilla' ? { ...m, states } : m)) };
    const res = await createApp(fakeMakeDeps(fakeDeps({ catalog: fakeCatalog(catalog) }))).request(
      new Request('http://localhost/api/viability', { method: 'POST', body: JSON.stringify(ok) }),
    );
    expect(res.status).toBe(422);
  });
  it('comprador que no acepta el material da 422', async () => {
    const buyer = buyers.find((b) => !b.accepts.includes('cascarilla'))!;
    expect((await postViability({ ...ok, buyerId: buyer.id })).status).toBe(422);
  });
});

describe('GET /api/health', () => {
  it('responde ok con el origen de datos', async () => {
    const res = await get('/api/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, origin: 'local' });
  });
});

describe('middleware', () => {
  it('agrega headers de seguridad', async () => {
    const res = await get('/api/health');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Permissions-Policy')).toBe('geolocation=(), camera=(), microphone=()');
  });
  it('CORS permite un origen de ALLOWED_ORIGINS', async () => {
    const res = await call(new Request('http://localhost/api/health', { headers: { Origin: 'http://localhost:5173' } }));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
  });
  it('CORS no responde Allow-Origin a un origen no permitido', async () => {
    const res = await call(new Request('http://localhost/api/health', { headers: { Origin: 'https://evil.example' } }));
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
  it('rutas desconocidas dan 404 JSON', async () => {
    const res = await get('/api/nada');
    expect(res.status).toBe(404);
    expect(((await res.json()) as ApiError).error).toBeTruthy();
  });
  it('un error inesperado de un repositorio da 500 genérico', async () => {
    const original = console.error;
    console.error = () => {};
    try {
      const failing = { load: async () => Promise.reject(new Error('boom interno')), ping: async () => true };
      const res = await createApp(fakeMakeDeps(fakeDeps({ catalog: failing }))).request('http://localhost/api/generators');
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: 'Error interno del servidor.' });
    } finally {
      console.error = original;
    }
  });
});

describe('ciclo de vida de las deps por request (D4)', () => {
  it('cada request abre un scope y lo cierra una sola vez, también si la ruta falla', async () => {
    const make = fakeMakeDeps();
    const scoped = createApp(make);
    await scoped.request('http://localhost/api/health');
    await scoped.request('http://localhost/api/generators?material=oro');
    await scoped.request('http://localhost/api/nada');
    expect(make.opened).toBe(3);
    expect(make.closed).toBe(3);
  });

  it('en Workers el cierre se entrega a executionCtx.waitUntil', async () => {
    const make = fakeMakeDeps();
    const pending: Promise<unknown>[] = [];
    const ctx = { waitUntil: (p: Promise<unknown>) => pending.push(p), passThroughOnException: () => {}, props: {} };
    const res = await createApp(make).request('http://localhost/api/catalog', undefined, env, ctx);
    expect(res.status).toBe(200);
    expect(pending).toHaveLength(1);
    await Promise.all(pending);
    expect(make.closed).toBe(1);
  });
});
