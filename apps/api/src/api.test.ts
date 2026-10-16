import { describe, expect, it } from 'vitest';
import { buyers, generators } from '@mapa/core/data';
import type { ApiError, BuyersResponse, CatalogResponse, GeneratorsResponse, ViabilityResponse } from '@mapa/core/api';
import app from './index';

const env = { ALLOWED_ORIGINS: 'http://localhost:5173' };
const call = (req: Request) => Promise.resolve(app.request(req, undefined, env));
const getCatalog = () => call(new Request('http://localhost/api/catalog'));
const getGenerators = call;
const getBuyers = call;
const postViability = call;

const get = (path: string) => new Request(`http://localhost${path}`);
const post = (body: unknown) =>
  new Request('http://localhost/api/viability', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
const ok = { generatorId: 'molinos-ala-mercedes', buyerId: 'duhalde-curuzu', state: 'pellet' };

describe('GET /api/catalog', () => {
  it('devuelve todo el catálogo sin cache', async () => {
    const res = await getCatalog();
    const body = (await res.json()) as CatalogResponse;
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(body.origin).toBe('local');
    expect(body.generators).toHaveLength(generators.length);
    expect(body.buyers).toHaveLength(buyers.length);
  });
});

describe('GET /api/generators', () => {
  it('filtra por material', async () => {
    const body = (await (await getGenerators(get('/api/generators?material=cascarilla'))).json()) as GeneratorsResponse;
    expect(body.generators.length).toBeGreaterThan(0);
    expect(body.generators.every((g) => g.materialId === 'cascarilla')).toBe(true);
  });
  it('sin filtro devuelve todos', async () => {
    const body = (await (await getGenerators(get('/api/generators'))).json()) as GeneratorsResponse;
    expect(body.generators).toHaveLength(generators.length);
  });
  it('material inválido da 400', async () => {
    const res = await getGenerators(get('/api/generators?material=oro'));
    expect(res.status).toBe(400);
    expect(((await res.json()) as ApiError).error).toContain('oro');
  });
});

describe('GET /api/buyers', () => {
  it('filtra por sector', async () => {
    const body = (await (await getBuyers(get('/api/buyers?sector=yerbatera'))).json()) as BuyersResponse;
    expect(body.buyers.length).toBeGreaterThan(0);
    expect(body.buyers.every((b) => b.sector === 'yerbatera')).toBe(true);
  });
  it('filtra por material aceptado', async () => {
    const body = (await (await getBuyers(get('/api/buyers?accepts=cascarilla'))).json()) as BuyersResponse;
    expect(body.buyers.length).toBeGreaterThan(0);
    expect(body.buyers.every((b) => b.accepts.includes('cascarilla'))).toBe(true);
  });
  it('sector inválido da 400', async () => {
    expect((await getBuyers(get('/api/buyers?sector=x'))).status).toBe(400);
  });
  it('accepts inválido da 400', async () => {
    expect((await getBuyers(get('/api/buyers?accepts=x'))).status).toBe(400);
  });
});

describe('POST /api/viability', () => {
  it('pellet de cascarilla a Duhalde no es rojo', async () => {
    const res = await postViability(post(ok));
    const body = (await res.json()) as ViabilityResponse;
    expect(res.status).toBe(200);
    expect(body.origin).toBe('local');
    expect(body.request).toEqual(ok);
    expect(body.result.light).not.toBe('rojo');
  });
  it('suelto es rojo', async () => {
    const body = (await (await postViability(post({ ...ok, state: 'suelto' }))).json()) as ViabilityResponse;
    expect(body.result.light).toBe('rojo');
  });
  it('acepta overrides válidos', async () => {
    const res = await postViability(post({ ...ok, overrides: { costPerKm: 5000, greenThreshold: 0.3 } }));
    expect(res.status).toBe(200);
  });
  it('JSON inválido da 400', async () => {
    expect((await postViability(post('{no'))).status).toBe(400);
  });
  it('campos faltantes o estado inválido dan 400', async () => {
    expect((await postViability(post({ ...ok, generatorId: undefined }))).status).toBe(400);
    expect((await postViability(post({ ...ok, state: 'liquido' }))).status).toBe(400);
    expect((await postViability(post([]))).status).toBe(400);
  });
  it('overrides inválidos dan 400', async () => {
    for (const overrides of [{ foo: 1 }, { costPerKm: 0 }, { costPerKm: -1 }, { costPerKm: '5' }, { greenThreshold: 1.5 }, { usdArs: 1500 }, { costPerKm: 50 }, { truckMaxTons: 61 }, { routeFactor: 0.9 }, 5]) {
      expect((await postViability(post({ ...ok, overrides }))).status).toBe(400);
    }
  });
  it('override fuera de rango responde 400 con el rango permitido', async () => {
    const res = await postViability(post({ ...ok, overrides: { costPerKm: 50 } }));
    expect(res.status).toBe(400);
    const msg = ((await res.json()) as ApiError).error;
    expect(msg).toContain('100');
    expect(msg).toContain('100000');
  });
  it('ids desconocidos dan 404', async () => {
    expect((await postViability(post({ ...ok, generatorId: 'nope' }))).status).toBe(404);
    expect((await postViability(post({ ...ok, buyerId: 'nope' }))).status).toBe(404);
  });
  it('estado no disponible para el material da 422', async () => {
    const g = generators.find((x) => x.materialId !== 'cascarilla');
    expect(g).toBeDefined();
    const states = ['suelto', 'compactado', 'pellet'] as const;
    // Busca algún generador/estado sin spec; si todos los materiales tienen los 3, se omite.
    const { materials } = await import('@mapa/core/data');
    const missing = materials.flatMap((m) => states.filter((s) => !m.states[s]).map((s) => ({ m, s })))[0];
    if (!missing) return;
    const gen = generators.find((x) => x.materialId === missing.m.id)!;
    const buyer = buyers.find((b) => b.accepts.includes(missing.m.id))!;
    const res = await postViability(post({ generatorId: gen.id, buyerId: buyer.id, state: missing.s }));
    expect(res.status).toBe(422);
  });
  it('comprador que no acepta el material da 422', async () => {
    const buyer = buyers.find((b) => !b.accepts.includes('cascarilla'))!;
    const res = await postViability(post({ ...ok, buyerId: buyer.id }));
    expect(res.status).toBe(422);
  });
});

describe('GET /api/health', () => {
  it('responde ok con el origen de datos', async () => {
    const res = await call(get('/api/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, origin: 'local' });
  });
});

describe('middleware', () => {
  it('agrega headers de seguridad', async () => {
    const res = await call(get('/api/health'));
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
    const res = await call(get('/api/nada'));
    expect(res.status).toBe(404);
    expect(((await res.json()) as ApiError).error).toBeTruthy();
  });
});
