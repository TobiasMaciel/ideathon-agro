import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type {
  BuyersResponse,
  CatalogResponse,
  GeneratorsResponse,
  ListingContactResponse,
  ListingCreatedResponse,
  ListingValidationError,
  ViabilityRequest,
  ViabilityResponse,
} from '@mapa/core/api';
import type { BuyerSector } from '@mapa/core/data';
import {
  contactResponseFromCurated,
  platformContactResponse,
  storedToEntry,
  validateListing,
  whatsappUrl,
} from '@mapa/core/listings';
import { availableStates, evaluateMatch, type Overrides } from '@mapa/core/match';
import { isEditableKey, OVERRIDE_RULES, validateOverride } from '@mapa/core/overrides';
import type { MaterialState } from '@mapa/core/viability';
import type { Env } from './env';
import { apiError, json, readJsonBody } from './http';
import { createDbDataSource } from '@mapa/db';
import { getDataSet } from './repository';
import { getContactStore, getListingStore } from './listing-store';
import { allow, CONTACT_LIMITS, CREATE_LIMITS, clientIp, hashIp, rateLimitDisabled } from './rate-limit';

const SECTORS: BuyerSector[] = ['yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico'];
const STATES: MaterialState[] = ['suelto', 'compactado', 'pellet'];

type Parsed = { ok: true; value: ViabilityRequest } | { ok: false; message: string };

function parseRequest(body: unknown): Parsed {
  const fail = (message: string): Parsed => ({ ok: false, message });
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return fail('El cuerpo debe ser un objeto JSON.');
  const b = body as Record<string, unknown>;
  if (typeof b.generatorId !== 'string' || b.generatorId === '') return fail('Falta "generatorId" (texto).');
  if (typeof b.buyerId !== 'string' || b.buyerId === '') return fail('Falta "buyerId" (texto).');
  if (typeof b.state !== 'string' || !STATES.includes(b.state as MaterialState)) {
    return fail('"state" debe ser suelto, compactado o pellet.');
  }
  const value: ViabilityRequest = { generatorId: b.generatorId, buyerId: b.buyerId, state: b.state as MaterialState };
  if (b.overrides !== undefined) {
    const o = b.overrides;
    if (typeof o !== 'object' || o === null || Array.isArray(o)) return fail('"overrides" debe ser un objeto.');
    const clean: Overrides = {};
    for (const [key, v] of Object.entries(o)) {
      if (!isEditableKey(key)) return fail(`Supuesto desconocido o no editable en "overrides": "${key}".`);
      const valid = typeof v === 'number' ? validateOverride(key, v) : null;
      if (valid === null) {
        const { min, max, label } = OVERRIDE_RULES[key];
        return fail(`"overrides.${key}" (${label}) debe ser un número entre ${min} y ${max}.`);
      }
      clean[key] = valid;
    }
    value.overrides = clean;
  }
  return { ok: true, value };
}

/** Con DATABASE_URL lee de Postgres (@mapa/db); sin ella, o si falla, usa los datos locales de core. */
const loadData = (env: Env) => getDataSet(env, env.DATABASE_URL ? createDbDataSource(env.DATABASE_URL) : undefined);

const app = new Hono<{ Bindings: Env }>();

// Headers de seguridad en todas las respuestas.
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('X-Frame-Options', 'DENY');
  c.header('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
});

// CORS: solo los orígenes de ALLOWED_ORIGINS (leídos del binding en cada request).
app.use('/api/*', (c, next) => {
  const allowed = (c.env?.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return cors({
    origin: (origin) => (allowed.includes(origin) ? origin : null),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 600,
  })(c, next);
});

app.get('/api/health', async (c) => {
  const { origin } = await loadData(c.env ?? {});
  return json({ ok: true, origin });
});

// Catálogo curado + publicaciones abiertas (ofertas -> generators, demandas -> buyers), sin contacto.
// Si el store de publicaciones falla, devuelve solo lo curado.
app.get('/api/catalog', async (c) => {
  const env = c.env ?? {};
  const { origin, data } = await loadData(env);
  const generators = [...data.generators];
  const buyers = [...data.buyers];
  try {
    for (const stored of await getListingStore(env).list()) {
      const entry = storedToEntry(stored);
      if (entry.kind === 'oferta') generators.push(entry.generator);
      else buyers.push(entry.buyer);
    }
  } catch (e) {
    console.error('Publicaciones no disponibles, devuelvo solo lo curado:', e instanceof Error ? e.message : String(e));
    return json({ origin, ...data } satisfies CatalogResponse);
  }
  const body: CatalogResponse = { origin, ...data, generators, buyers };
  return json(body);
});

app.post('/api/listings', async (c) => {
  const env = c.env ?? {};
  const read = await readJsonBody(c.req.raw);
  if (!read.ok) return read.response;
  const parsed = validateListing(read.value);
  if (!parsed.ok) {
    const body: ListingValidationError = { error: 'La publicación no es válida.', details: parsed.errors };
    return json(body, 400);
  }
  const ipHash = await hashIp(clientIp(c.req.raw), env.IP_SALT);
  if (!rateLimitDisabled(env) && !allow('create', ipHash, CREATE_LIMITS)) {
    return apiError('Demasiadas publicaciones desde esta conexión. Probá más tarde.', 429);
  }
  const stored = await getListingStore(env).add(parsed.value, ipHash);
  const entry = storedToEntry(stored);
  const body: ListingCreatedResponse = {
    origin: env.DATABASE_URL ? 'database' : 'local',
    kind: entry.kind,
    listing: entry.kind === 'oferta' ? entry.generator : entry.buyer,
  };
  return json(body, 201);
});

// El contacto se revela solo bajo demanda (no viaja en /api/catalog) y con límite por IP.
// pub-*: el que dejó quien publicó. Curados: contacto corporativo público con fuente o, si no tienen,
// el de la plataforma como intermediaria (si está configurado).
app.get('/api/listings/:id/contact', async (c) => {
  const env = c.env ?? {};
  const id = c.req.param('id');
  const ipHash = await hashIp(clientIp(c.req.raw), env.IP_SALT);
  if (!rateLimitDisabled(env) && !allow('contact', ipHash, CONTACT_LIMITS)) {
    return apiError('Demasiadas consultas de contacto desde esta conexión. Probá más tarde.', 429);
  }
  if (id.startsWith('pub-')) {
    const stored = await getListingStore(env).get(id.slice(4));
    if (!stored) return apiError('No existe la publicación.', 404);
    const { name, phone, email } = stored.input.contact;
    const body: ListingContactResponse = {
      via: 'publicacion',
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone, whatsappUrl: whatsappUrl(phone, stored.input.materialId) }),
      ...(email !== undefined && { email }),
    };
    return json(body);
  }
  const { data } = await loadData(env);
  const generator = data.generators.find((g) => g.id === id);
  const buyer = generator ? undefined : data.buyers.find((b) => b.id === id);
  const entity = generator ?? buyer;
  if (!entity) return apiError('No existe el establecimiento.', 404);
  const materialName = generator ? data.materials.find((m) => m.id === generator.materialId)?.name.toLowerCase() : undefined;
  const curated = await getContactStore(env).get(id);
  if (curated) return json(contactResponseFromCurated(curated, data.sources, materialName));
  const platform = platformContactResponse(
    { name: env.PLATFORM_CONTACT_NAME?.trim() || 'Circular NEA', phone: env.PLATFORM_CONTACT_PHONE?.trim() || undefined, email: env.PLATFORM_CONTACT_EMAIL?.trim() || undefined },
    entity.name,
    materialName,
  );
  if (platform) return json(platform);
  return apiError('Este establecimiento no tiene datos de contacto publicados.', 404);
});

app.get('/api/generators', async (c) => {
  const material = c.req.query('material') ?? null;
  const { origin, data } = await loadData(c.env ?? {});
  if (material !== null && !data.materials.some((m) => m.id === material)) {
    return apiError(`Material inválido: "${material}"`, 400);
  }
  const body: GeneratorsResponse = {
    origin,
    generators: material === null ? data.generators : data.generators.filter((g) => g.materialId === material),
  };
  return json(body);
});

app.get('/api/buyers', async (c) => {
  const sector = c.req.query('sector') ?? null;
  const accepts = c.req.query('accepts') ?? null;
  if (sector !== null && !SECTORS.includes(sector as BuyerSector)) {
    return apiError(`Sector inválido: "${sector}"`, 400);
  }
  const { origin, data } = await loadData(c.env ?? {});
  if (accepts !== null && !data.materials.some((m) => m.id === accepts)) {
    return apiError(`Material inválido: "${accepts}"`, 400);
  }
  const buyers = data.buyers.filter(
    (b) => (sector === null || b.sector === sector) && (accepts === null || b.accepts.some((m) => m === accepts)),
  );
  const body: BuyersResponse = { origin, buyers };
  return json(body);
});

app.post('/api/viability', async (c) => {
  const read = await readJsonBody(c.req.raw);
  if (!read.ok) return read.response;
  const parsed = parseRequest(read.value);
  if (!parsed.ok) return apiError(parsed.message, 400);
  const request = parsed.value;

  const { origin, data } = await loadData(c.env ?? {});
  const generator = data.generators.find((g) => g.id === request.generatorId);
  if (!generator) return apiError(`No existe el generador "${request.generatorId}".`, 404);
  const buyer = data.buyers.find((x) => x.id === request.buyerId);
  if (!buyer) return apiError(`No existe el comprador "${request.buyerId}".`, 404);
  const material = data.materials.find((m) => m.id === generator.materialId);
  if (!material) return apiError(`No existe el material "${generator.materialId}".`, 404);

  if (!availableStates(material).includes(request.state)) {
    return apiError(`El material "${material.name}" no está disponible en estado "${request.state}".`, 422);
  }
  if (!buyer.accepts.includes(material.id)) {
    return apiError(`El comprador "${buyer.name}" no acepta "${material.name}".`, 422);
  }

  const result = evaluateMatch({
    generator,
    buyer,
    material,
    state: request.state,
    alternatives: data.alternatives,
    assumptions: data.assumptions,
    overrides: request.overrides,
  });
  const body: ViabilityResponse = { origin, request, result };
  return json(body);
});

app.notFound(() => apiError('Ruta no encontrada.', 404));
app.onError((err) => {
  console.error('Error no controlado:', err.message);
  return apiError('Error interno del servidor.', 500);
});

export default app;
