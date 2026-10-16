import { beforeEach, describe, expect, it } from 'vitest';
import { alternatives, assumptions, buyers, curatedContacts, generators, materials } from '@mapa/core/data';
import type {
  ApiError,
  CatalogResponse,
  ListingContactResponse,
  ListingCreatedResponse,
  ListingValidationError,
} from '@mapa/core/api';
import { evaluateMatch } from '@mapa/core/match';
import app from './index';
import { MEMORY_LISTINGS_MAX, memoryListingStore } from './listing-store';
import { resetRateLimits } from './rate-limit';

const env = { ALLOWED_ORIGINS: 'http://localhost:5173' };
let ipCounter = 0;
let ip = '';
const call = (req: Request) => Promise.resolve(app.request(req, undefined, env));
const postListing = (body: unknown, headers: Record<string, string> = {}) =>
  call(
    new Request('http://localhost/api/listings', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: { 'cf-connecting-ip': ip, ...headers },
    }),
  );
const getCatalog = async () => (await (await call(new Request('http://localhost/api/catalog'))).json()) as CatalogResponse;
const getContact = (id: string) =>
  call(new Request(`http://localhost/api/listings/${id}/contact`, { headers: { 'cf-connecting-ip': ip } }));

const oferta = {
  kind: 'oferta',
  name: 'Aserradero Don Pepe',
  locality: 'Ituzaingó',
  lat: -27.58,
  lng: -56.69,
  materialId: 'aserrin',
  tonsPerMonth: 120,
  moisture: 0.4,
  seasonality: 'Todo el año',
  contact: { name: 'Pepe', phone: '379 412-3456', email: 'pepe@example.com' },
};
const demanda = {
  kind: 'demanda',
  name: 'Secadero La Esperanza',
  lat: -28.05,
  lng: -56,
  materialId: 'cascarilla',
  tonsPerMonth: 80,
  currentAlternative: 'lena',
  sector: 'secadero_granos',
  contact: { phone: '+54 3794 123456' },
};

beforeEach(() => {
  memoryListingStore.clear();
  resetRateLimits();
  ip = `10.0.0.${++ipCounter}`;
});

describe('POST /api/listings', () => {
  it('crea una oferta y la muestra en /api/catalog como generador sin verificar', async () => {
    const res = await postListing(oferta);
    const created = (await res.json()) as ListingCreatedResponse;
    expect(res.status).toBe(201);
    expect(created.origin).toBe('local');
    expect(created.kind).toBe('oferta');
    expect(created.listing).toMatchObject({ origin: 'publicacion', verified: false, materialId: 'aserrin' });
    expect(created.listing.id.startsWith('pub-')).toBe(true);

    const catalog = await getCatalog();
    expect(catalog.generators).toHaveLength(generators.length + 1);
    expect(catalog.buyers).toHaveLength(buyers.length);
    expect(catalog.generators.find((g) => g.id === created.listing.id)).toMatchObject({
      origin: 'publicacion',
      verified: false,
      name: 'Aserradero Don Pepe',
    });
  });

  it('crea una demanda y la muestra en /api/catalog como comprador sin verificar', async () => {
    const res = await postListing(demanda);
    const created = (await res.json()) as ListingCreatedResponse;
    expect(res.status).toBe(201);
    expect(created.kind).toBe('demanda');
    const catalog = await getCatalog();
    expect(catalog.buyers).toHaveLength(buyers.length + 1);
    expect(catalog.generators).toHaveLength(generators.length);
    expect(catalog.buyers.find((b) => b.id === created.listing.id)).toMatchObject({
      origin: 'publicacion',
      verified: false,
      accepts: ['cascarilla'],
    });
  });

  it('el contacto no viaja ni en la respuesta ni en el catálogo', async () => {
    const created = (await (await postListing(oferta)).json()) as ListingCreatedResponse;
    const catalogText = JSON.stringify(await getCatalog());
    for (const secret of ['412-3456', 'pepe@example.com', '"contact"']) {
      expect(JSON.stringify(created)).not.toContain(secret);
      expect(catalogText).not.toContain(secret);
    }
  });

  it('un comprador publicado se evalúa contra un generador curado sin romper', async () => {
    const created = (await (await postListing(demanda)).json()) as ListingCreatedResponse;
    const buyer = (await getCatalog()).buyers.find((b) => b.id === created.listing.id)!;
    const generator = generators.find((g) => g.materialId === 'cascarilla')!;
    const material = materials.find((m) => m.id === 'cascarilla')!;
    const result = evaluateMatch({ generator, buyer, material, state: 'suelto', alternatives, assumptions });
    expect(Number.isFinite(result.marginPerMonth)).toBe(true);
    expect(['verde', 'amarillo', 'rojo']).toContain(result.light);
  });

  describe('validación (400 con details)', () => {
    const cases: [string, unknown, string][] = [
      ['JSON inválido', '{no', 'JSON'],
      ['kind inválido', { ...oferta, kind: 'regalo' }, 'kind'],
      ['nombre corto', { ...oferta, name: 'a' }, 'nombre'],
      ['nombre largo', { ...oferta, name: 'a'.repeat(81) }, 'nombre'],
      ['nombre con control', { ...oferta, name: 'a\u0007b' }, 'nombre'],
      ['localidad larga', { ...oferta, locality: 'a'.repeat(61) }, 'localidad'],
      ['latitud fuera del NEA', { ...oferta, lat: -34.6 }, 'latitud'],
      ['longitud fuera del NEA', { ...oferta, lng: -65 }, 'longitud'],
      ['toneladas 0', { ...oferta, tonsPerMonth: 0 }, 'toneladas'],
      ['toneladas enormes', { ...oferta, tonsPerMonth: 1e6 }, 'toneladas'],
      ['material inválido', { ...oferta, materialId: 'oro' }, 'material'],
      ['humedad > 0.7', { ...oferta, moisture: 0.8 }, 'humedad'],
      ['estacionalidad larga', { ...oferta, seasonality: 'a'.repeat(61) }, 'estacionalidad'],
      ['demanda sin combustible', { ...demanda, currentAlternative: undefined }, 'combustible'],
      ['demanda sin sector', { ...demanda, sector: undefined }, 'sector'],
      ['clave desconocida', { ...oferta, verified: true }, 'verified'],
      ['sin contacto', { ...oferta, contact: undefined }, 'contacto'],
      ['contacto sin teléfono ni email', { ...oferta, contact: { name: 'Pepe' } }, 'al menos'],
      ['teléfono inválido', { ...oferta, contact: { phone: 'hola' } }, 'teléfono'],
      ['email inválido', { ...oferta, contact: { email: 'x' } }, 'email'],
    ];
    it.each(cases)('%s', async (_name, body, fragment) => {
      const res = await postListing(body);
      expect(res.status).toBe(400);
      const json = (await res.json()) as ListingValidationError | ApiError;
      expect(json.error).toBeTruthy();
      if (typeof body !== 'string') expect((json as ListingValidationError).details.join(' ')).toContain(fragment);
    });
    it('no guarda nada si es inválida', async () => {
      await postListing({ ...oferta, lat: 0 });
      expect(await memoryListingStore.list()).toHaveLength(0);
    });
  });

  it('body de más de 4 KB da 413', async () => {
    const res = await postListing({ ...oferta, name: 'x', locality: 'y'.repeat(5000) });
    expect(res.status).toBe(413);
  });

  it('el sexto envío en una hora desde la misma IP da 429', async () => {
    for (let i = 0; i < 5; i++) expect((await postListing(oferta)).status).toBe(201);
    const res = await postListing(oferta);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'Demasiadas publicaciones desde esta conexión. Probá más tarde.' });
    // otra IP sigue pudiendo; x-forwarded-for también cuenta como IP.
    expect((await postListing(oferta, { 'cf-connecting-ip': '', 'x-forwarded-for': '9.9.9.9, 1.1.1.1' })).status).toBe(201);
  });

  it('RATE_LIMIT_DISABLED=1 con ENVIRONMENT=development apaga el límite (solo para e2e en wrangler dev)', async () => {
    const devEnv = { ...env, ENVIRONMENT: 'development', RATE_LIMIT_DISABLED: '1' };
    const post = () =>
      Promise.resolve(
        app.request(
          new Request('http://localhost/api/listings', { method: 'POST', body: JSON.stringify(oferta), headers: { 'cf-connecting-ip': ip } }),
          undefined,
          devEnv,
        ),
      );
    for (let i = 0; i < 7; i++) expect((await post()).status).toBe(201);
  });

  it('RATE_LIMIT_DISABLED=1 sin ENVIRONMENT=development no apaga nada', async () => {
    const prodEnv = { ...env, ENVIRONMENT: 'production', RATE_LIMIT_DISABLED: '1' };
    const post = () =>
      Promise.resolve(
        app.request(
          new Request('http://localhost/api/listings', { method: 'POST', body: JSON.stringify(oferta), headers: { 'cf-connecting-ip': ip } }),
          undefined,
          prodEnv,
        ),
      );
    for (let i = 0; i < 5; i++) expect((await post()).status).toBe(201);
    expect((await post()).status).toBe(429);
  });

  it('el store en memoria tiene tope de publicaciones', async () => {
    for (let i = 0; i < MEMORY_LISTINGS_MAX + 3; i++) await memoryListingStore.add({ ...oferta } as never, 'h');
    expect(await memoryListingStore.list()).toHaveLength(MEMORY_LISTINGS_MAX);
  });
});

describe('GET /api/listings/:id/contact', () => {
  it('devuelve el contacto y el link de WhatsApp', async () => {
    const created = (await (await postListing(oferta)).json()) as ListingCreatedResponse;
    const res = await getContact(created.listing.id);
    const body = (await res.json()) as ListingContactResponse;
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(body).toEqual({
      via: 'publicacion',
      name: 'Pepe',
      phone: '379 412-3456',
      email: 'pepe@example.com',
      whatsappUrl:
        'https://wa.me/543794123456?text=' + encodeURIComponent('Hola, vi tu publicación de aserrín en Circular NEA'),
    });
  });

  it('sin teléfono no hay whatsappUrl', async () => {
    const created = (await (await postListing({ ...oferta, contact: { email: 'a@b.com' } })).json()) as ListingCreatedResponse;
    expect(await (await getContact(created.listing.id)).json()).toEqual({ via: 'publicacion', email: 'a@b.com' });
  });

  it('un curado con contacto corporativo (molinos-ala-mercedes) devuelve empresa, fuente y WhatsApp', async () => {
    const res = await getContact('molinos-ala-mercedes');
    expect(res.status).toBe(200);
    const body = (await res.json()) as ListingContactResponse;
    expect(body.via).toBe('empresa');
    expect(body.name).toBe('Adecoagro Argentina (oficina comercial)');
    expect(body.website).toBe('https://www.molinosala.com.ar');
    expect(body.phone).toBe('+54 11 4836 8600');
    expect(body.email).toBe('info_ar@adecoagro.com');
    expect(body.sourceUrl).toBe('https://adecoagro.com/sugerencias-y-consultas/');
    expect(body.whatsappUrl).toContain('https://wa.me/541148368600?text=');
  });

  it('un curado sin contacto propio y sin plataforma configurada da 404 con mensaje', async () => {
    const res = await getContact('duhalde-curuzu');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Este establecimiento no tiene datos de contacto publicados.' });
  });

  it('un curado sin contacto propio usa el contacto de la plataforma si está configurado', async () => {
    const platformEnv = { ...env, PLATFORM_CONTACT_PHONE: '+54 379 400-0000', PLATFORM_CONTACT_EMAIL: 'hola@circular.test' };
    const res = await Promise.resolve(
      app.request(new Request('http://localhost/api/listings/duhalde-curuzu/contact', { headers: { 'cf-connecting-ip': ip } }), undefined, platformEnv),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as ListingContactResponse;
    expect(body.via).toBe('plataforma');
    expect(body.name).toBe('Circular NEA');
    expect(body.email).toBe('hola@circular.test');
    expect(body.mailtoSubject).toContain(buyers.find((b) => b.id === 'duhalde-curuzu')!.name);
    const text = decodeURIComponent(body.whatsappUrl!.split('text=')[1]);
    expect(text).toContain(buyers.find((b) => b.id === 'duhalde-curuzu')!.name);
    expect(text).toContain('sus subproductos');
  });

  it('para un generador sin contacto propio el mensaje de plataforma nombra el material', async () => {
    const g = generators.find((x) => !curatedContacts.some((c) => c.entityId === x.id))!;
    const m = materials.find((x) => x.id === g.materialId)!;
    const res = await Promise.resolve(
      app.request(
        new Request(`http://localhost/api/listings/${g.id}/contact`, { headers: { 'cf-connecting-ip': ip } }),
        undefined,
        { ...env, PLATFORM_CONTACT_PHONE: '+54 379 400-0000', PLATFORM_CONTACT_NAME: 'Circular NEA Ayuda' },
      ),
    );
    const body = (await res.json()) as ListingContactResponse;
    expect(body.name).toBe('Circular NEA Ayuda');
    const text = decodeURIComponent(body.whatsappUrl!.split('text=')[1]);
    expect(text).toContain(g.name);
    expect(text).toContain(m.name.toLowerCase());
    expect(body.email).toBeUndefined();
  });

  it('un id que no existe en el catálogo da 404 aun con plataforma configurada', async () => {
    const res = await Promise.resolve(
      app.request(new Request('http://localhost/api/listings/no-existe/contact'), undefined, { ...env, PLATFORM_CONTACT_PHONE: '+54 379 400-0000' }),
    );
    expect(res.status).toBe(404);
  });

  it('/api/catalog no incluye ningún email ni teléfono de contacto curado', async () => {
    const raw = await (await call(new Request('http://localhost/api/catalog'))).text();
    for (const c of curatedContacts) {
      for (const v of [c.email, c.phone]) if (v) expect(raw).not.toContain(v);
    }
    expect(raw).not.toMatch(/@[a-z0-9-]+\.(com|ar)/i);
    expect(raw).not.toContain('"contacts"');
  });

  it('una publicación inexistente da 404', async () => {
    expect((await getContact('pub-no-existe')).status).toBe(404);
  });

  it('da 429 al pasar de 30 consultas por hora', async () => {
    const created = (await (await postListing(oferta)).json()) as ListingCreatedResponse;
    for (let i = 0; i < 30; i++) expect((await getContact(created.listing.id)).status).toBe(200);
    const res = await getContact(created.listing.id);
    expect(res.status).toBe(429);
  });
});
