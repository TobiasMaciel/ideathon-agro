import { describe, expect, it } from 'vitest';
import { buyers, curatedContacts, generators, materials } from '@mapa/core/data';
import { fakeCatalog, fakeDeps, fakeListings, fakeRateLimiter, localCatalog } from '../test/fakes';
import { createListing } from './create-listing';
import { AppError } from './errors';
import { evaluateMatch } from './evaluate-match';
import { getCatalog, listBuyers, listGenerators } from './get-catalog';
import { getHealth } from './get-health';
import { revealContact } from './reveal-contact';

const oferta = {
  kind: 'oferta',
  name: 'Aserradero Don Pepe',
  lat: -27.58,
  lng: -56.69,
  materialId: 'aserrin',
  tonsPerMonth: 120,
  contact: { name: 'Pepe', phone: '379 412-3456' },
};

/** Ejecuta y devuelve el AppError lanzado (falla si no lanza uno). */
async function appError(run: () => Promise<unknown>): Promise<AppError> {
  const e = await run().then(
    () => undefined,
    (err: unknown) => err,
  );
  expect(e).toBeInstanceOf(AppError);
  return e as AppError;
}

describe('getHealth', () => {
  it('sin base configurada informa local sin consultar nada', async () => {
    expect(await getHealth(fakeDeps({ origin: 'local', catalog: fakeCatalog(localCatalog(), false) }))).toEqual({
      ok: true,
      origin: 'local',
    });
  });
  it('con base que responde informa database', async () => {
    expect((await getHealth(fakeDeps({ origin: 'database' }))).origin).toBe('database');
  });
  it('con base que no responde informa local', async () => {
    expect((await getHealth(fakeDeps({ origin: 'database', catalog: fakeCatalog(localCatalog(), false) }))).origin).toBe('local');
  });
  it('no carga el catálogo', async () => {
    const catalog = { load: async () => expect.fail('no debe cargar el catálogo'), ping: async () => true };
    expect((await getHealth(fakeDeps({ origin: 'database', catalog }))).ok).toBe(true);
  });
});

describe('getCatalog', () => {
  it('mezcla las publicaciones con lo curado y no expone el contacto', async () => {
    const deps = fakeDeps();
    await createListing(deps, oferta, '1.1.1.1');
    const catalog = await getCatalog(deps);
    expect(catalog.generators).toHaveLength(generators.length + 1);
    expect(catalog.buyers).toHaveLength(buyers.length);
    expect(JSON.stringify(catalog)).not.toContain('412-3456');
    expect('origin' in catalog).toBe(false);
  });
});

describe('listGenerators / listBuyers', () => {
  it('filtra generadores por material y rechaza materiales desconocidos', async () => {
    const { generators: list } = await listGenerators(fakeDeps(), 'cascarilla');
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((g) => g.materialId === 'cascarilla')).toBe(true);
    expect((await appError(() => listGenerators(fakeDeps(), 'oro'))).code).toBe('invalid');
  });
  it('filtra compradores por sector y material, y rechaza valores desconocidos', async () => {
    const { buyers: list } = await listBuyers(fakeDeps(), { sector: 'yerbatera', accepts: null });
    expect(list.every((b) => b.sector === 'yerbatera')).toBe(true);
    expect((await appError(() => listBuyers(fakeDeps(), { sector: 'x', accepts: null }))).message).toBe('Sector inválido: "x"');
    expect((await appError(() => listBuyers(fakeDeps(), { sector: null, accepts: 'x' }))).code).toBe('invalid');
  });
});

describe('evaluateMatch', () => {
  const ok = { generatorId: 'molinos-ala-mercedes', buyerId: 'duhalde-curuzu', state: 'pellet' as const };

  it('pellet de cascarilla a Duhalde es verde (guion de la demo)', async () => {
    const res = await evaluateMatch(fakeDeps(), ok);
    expect(res.request).toEqual(ok);
    expect(res.result.light).toBe('verde');
  });
  it('ids desconocidos son not_found', async () => {
    expect((await appError(() => evaluateMatch(fakeDeps(), { ...ok, generatorId: 'nope' }))).code).toBe('not_found');
    expect((await appError(() => evaluateMatch(fakeDeps(), { ...ok, buyerId: 'nope' }))).code).toBe('not_found');
  });
  it('un comprador que no acepta el material es unprocessable', async () => {
    const buyer = buyers.find((b) => !b.accepts.includes('cascarilla'))!;
    expect((await appError(() => evaluateMatch(fakeDeps(), { ...ok, buyerId: buyer.id }))).code).toBe('unprocessable');
  });
  it('un estado que el material no tiene es unprocessable', async () => {
    const cascarilla = materials.find((m) => m.id === 'cascarilla')!;
    const { pellet: _omit, ...states } = cascarilla.states;
    void _omit;
    const catalog = { ...localCatalog(), materials: materials.map((m) => (m.id === 'cascarilla' ? { ...m, states } : m)) };
    const e = await appError(() => evaluateMatch(fakeDeps({ catalog: fakeCatalog(catalog) }), ok));
    expect(e.code).toBe('unprocessable');
  });
});

describe('createListing', () => {
  it('guarda la publicación con el hash de la IP (nunca la IP) y devuelve la entidad sin verificar', async () => {
    const listings = fakeListings();
    const res = await createListing(fakeDeps({ listings }), oferta, '10.0.0.1');
    expect(res.kind).toBe('oferta');
    expect(res.listing).toMatchObject({ origin: 'publicacion', verified: false, id: `pub-${listings.items[0].id}` });
    expect(listings.hashes).toEqual(['hash(10.0.0.1)']);
  });
  it('una publicación inválida es invalid con details y no guarda nada', async () => {
    const listings = fakeListings();
    const e = await appError(() => createListing(fakeDeps({ listings }), { ...oferta, lat: 0 }, 'ip'));
    expect(e.code).toBe('invalid');
    expect(e.details?.join(' ')).toContain('latitud');
    expect(listings.items).toHaveLength(0);
  });
  it('pasado el límite es rate_limited y no guarda', async () => {
    const listings = fakeListings();
    const deps = fakeDeps({ listings, rateLimiter: fakeRateLimiter(1) });
    await createListing(deps, oferta, 'ip');
    expect((await appError(() => createListing(deps, oferta, 'ip'))).code).toBe('rate_limited');
    expect(listings.items).toHaveLength(1);
  });
});

describe('revealContact', () => {
  it('una publicación devuelve el contacto de quien publicó', async () => {
    const deps = fakeDeps();
    const created = await createListing(deps, oferta, 'ip');
    expect(await revealContact(deps, created.listing.id, 'ip')).toMatchObject({ via: 'publicacion', phone: '379 412-3456' });
  });
  it('una publicación inexistente es not_found', async () => {
    expect((await appError(() => revealContact(fakeDeps(), 'pub-no-existe', 'ip'))).message).toBe('No existe la publicación.');
  });
  it('un curado con contacto corporativo devuelve la empresa con su fuente', async () => {
    const card = await revealContact(fakeDeps(), 'molinos-ala-mercedes', 'ip');
    expect(card).toMatchObject({ via: 'empresa', email: curatedContacts[0].email });
    expect(card.sourceUrl).toMatch(/^https:\/\//);
  });
  it('un curado sin contacto usa la plataforma si está configurada; si no, not_found', async () => {
    const withPlatform = fakeDeps({ platformContact: { name: 'Sobra', email: 'hola@circular.test' } });
    expect((await revealContact(withPlatform, 'duhalde-curuzu', 'ip')).via).toBe('plataforma');
    const e = await appError(() => revealContact(fakeDeps(), 'duhalde-curuzu', 'ip'));
    expect(e.message).toBe('Este establecimiento no tiene datos de contacto publicados.');
  });
  it('un id desconocido es not_found aun con plataforma', async () => {
    const deps = fakeDeps({ platformContact: { name: 'Sobra', phone: '+54 379 400-0000' } });
    expect((await appError(() => revealContact(deps, 'no-existe', 'ip'))).message).toBe('No existe el establecimiento.');
  });
  it('pasado el límite es rate_limited antes de buscar nada', async () => {
    const deps = fakeDeps({ rateLimiter: fakeRateLimiter(0) });
    expect((await appError(() => revealContact(deps, 'molinos-ala-mercedes', 'ip'))).code).toBe('rate_limited');
  });
});
