// Publicaciones abiertas (F1): validación de lo que declara un usuario y mapeo a Generator / Buyer.
import type { AlternativeId, Buyer, BuyerSector, Generator, MaterialId, Tagged } from './data/types';

export type ListingKind = 'oferta' | 'demanda';

/** Contacto de quien publica. Nunca viaja en el catálogo: se revela con GET /api/listings/:id/contact. */
export interface ListingContact {
  name?: string;
  /** WhatsApp / teléfono AR: dígitos, espacios, +, -, paréntesis (8–20 caracteres). */
  phone?: string;
  email?: string;
}

export interface ListingInput {
  kind: ListingKind;
  name: string;
  locality?: string;
  lat: number;
  lng: number;
  materialId: MaterialId;
  tonsPerMonth: number;
  /** Solo oferta, 0–0.7. Informativa: el modelo usa `material.rawMoisture` del catálogo. */
  moisture?: number;
  /** Solo oferta. */
  seasonality?: string;
  /** Solo demanda: combustible que usa hoy. */
  currentAlternative?: AlternativeId;
  /** Solo demanda. */
  sector?: BuyerSector;
  /** Al menos `phone` o `email`. */
  contact: ListingContact;
}

export type ListingValidation = { ok: true; value: ListingInput } | { ok: false; errors: string[] };

export const LISTING_KINDS: ListingKind[] = ['oferta', 'demanda'];
export const LISTING_MATERIALS: MaterialId[] = ['aserrin', 'chips', 'costaneros', 'cascarilla'];
export const LISTING_ALTERNATIVES: AlternativeId[] = ['glp', 'lena'];
export const LISTING_SECTORS: BuyerSector[] = [
  'yerbatera',
  'central_biomasa',
  'citricola',
  'secadero_granos',
  'frigorifico',
];

/** Caja del NEA aceptada para ubicar una publicación. */
export const LISTING_BOUNDS = { latMin: -31.5, latMax: -25.5, lngMin: -60.5, lngMax: -53 } as const;
export const LISTING_TONS = { min: 1, max: 100000 } as const;
export const LISTING_MAX_MOISTURE = 0.7;

const KEYS = [
  'kind',
  'name',
  'locality',
  'lat',
  'lng',
  'materialId',
  'tonsPerMonth',
  'moisture',
  'seasonality',
  'currentAlternative',
  'sector',
  'contact',
];
const CONTACT_KEYS = ['name', 'phone', 'email'];
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;
const PHONE = /^[0-9 +\-()]{8,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const inList = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === 'string' && list.includes(v as T);

function validateContact(raw: unknown, errors: string[]): ListingContact {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    errors.push('Falta el contacto: indicá un teléfono/WhatsApp o un email.');
    return {};
  }
  const c = raw as Record<string, unknown>;
  for (const k of Object.keys(c)) if (!CONTACT_KEYS.includes(k)) errors.push(`Campo de contacto desconocido: "${k}".`);
  const out: ListingContact = {};
  const text = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined);
  if (c.name !== undefined && c.name !== '') {
    const n = text(c.name);
    if (n === undefined || n.length > 60 || CONTROL.test(n)) {
      errors.push('El nombre de contacto debe tener hasta 60 caracteres, sin caracteres de control.');
    } else out.name = n;
  }
  if (c.phone !== undefined && c.phone !== '') {
    const p = text(c.phone);
    if (p === undefined || !PHONE.test(p) || p.replace(/\D/g, '').length < 8) {
      errors.push('El teléfono debe tener entre 8 y 20 caracteres: dígitos, espacios, +, - y paréntesis.');
    } else out.phone = p;
  }
  if (c.email !== undefined && c.email !== '') {
    const e = text(c.email);
    if (e === undefined || e.length > 120 || !EMAIL.test(e) || CONTROL.test(e)) {
      errors.push('El email no tiene un formato válido (máximo 120 caracteres).');
    } else out.email = e;
  }
  const hadPhoneOrEmail = (c.phone !== undefined && c.phone !== '') || (c.email !== undefined && c.email !== '');
  if (!hadPhoneOrEmail) errors.push('El contacto requiere al menos un teléfono/WhatsApp o un email.');
  return out;
}

/**
 * Valida el JSON crudo de una publicación (mensajes en español). Rechaza claves desconocidas; los campos
 * que no corresponden al tipo (p. ej. `sector` en una oferta) se descartan sin error.
 */
export function validateListing(raw: unknown): ListingValidation {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, errors: ['El cuerpo debe ser un objeto JSON.'] };
  }
  const b = raw as Record<string, unknown>;
  const errors: string[] = [];
  for (const k of Object.keys(b)) if (!KEYS.includes(k)) errors.push(`Campo desconocido: "${k}".`);

  const kind = b.kind;
  if (!inList(LISTING_KINDS, kind)) errors.push('"kind" debe ser "oferta" o "demanda".');

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (typeof b.name !== 'string' || name.length < 2 || name.length > 80 || CONTROL.test(name)) {
    errors.push('El nombre debe tener entre 2 y 80 caracteres, sin caracteres de control.');
  }

  let locality: string | undefined;
  if (b.locality !== undefined) {
    if (typeof b.locality !== 'string' || b.locality.trim().length > 60 || CONTROL.test(b.locality)) {
      errors.push('La localidad debe tener hasta 60 caracteres, sin caracteres de control.');
    } else locality = b.locality.trim() || undefined;
  }

  const { latMin, latMax, lngMin, lngMax } = LISTING_BOUNDS;
  if (!isNum(b.lat) || b.lat < latMin || b.lat > latMax) {
    errors.push(`La latitud debe ser un número entre ${latMin} y ${latMax} (NEA).`);
  }
  if (!isNum(b.lng) || b.lng < lngMin || b.lng > lngMax) {
    errors.push(`La longitud debe ser un número entre ${lngMin} y ${lngMax} (NEA).`);
  }
  if (!inList(LISTING_MATERIALS, b.materialId)) {
    errors.push(`El material debe ser uno de: ${LISTING_MATERIALS.join(', ')}.`);
  }
  if (!isNum(b.tonsPerMonth) || b.tonsPerMonth < LISTING_TONS.min || b.tonsPerMonth > LISTING_TONS.max) {
    errors.push(`Las toneladas por mes deben ser un número entre ${LISTING_TONS.min} y ${LISTING_TONS.max}.`);
  }

  let moisture: number | undefined;
  let seasonality: string | undefined;
  let currentAlternative: AlternativeId | undefined;
  let sector: BuyerSector | undefined;
  if (kind === 'oferta') {
    if (b.moisture !== undefined) {
      if (!isNum(b.moisture) || b.moisture < 0 || b.moisture > LISTING_MAX_MOISTURE) {
        errors.push(`La humedad debe ser un número entre 0 y ${LISTING_MAX_MOISTURE}.`);
      } else moisture = b.moisture;
    }
    if (b.seasonality !== undefined) {
      if (typeof b.seasonality !== 'string' || b.seasonality.trim().length > 60 || CONTROL.test(b.seasonality)) {
        errors.push('La estacionalidad debe tener hasta 60 caracteres, sin caracteres de control.');
      } else seasonality = b.seasonality.trim() || undefined;
    }
  } else if (kind === 'demanda') {
    if (inList(LISTING_ALTERNATIVES, b.currentAlternative)) currentAlternative = b.currentAlternative;
    else errors.push(`La demanda requiere el combustible actual: ${LISTING_ALTERNATIVES.join(' o ')}.`);
    if (inList(LISTING_SECTORS, b.sector)) sector = b.sector;
    else errors.push(`La demanda requiere el sector: ${LISTING_SECTORS.join(', ')}.`);
  }

  const contact = validateContact(b.contact, errors);

  if (errors.length > 0) return { ok: false, errors };
  const value: ListingInput = {
    kind: kind as ListingKind,
    name,
    ...(locality !== undefined && { locality }),
    lat: b.lat as number,
    lng: b.lng as number,
    materialId: b.materialId as MaterialId,
    tonsPerMonth: b.tonsPerMonth as number,
    ...(moisture !== undefined && { moisture }),
    ...(seasonality !== undefined && { seasonality }),
    ...(currentAlternative !== undefined && { currentAlternative }),
    ...(sector !== undefined && { sector }),
    contact,
  };
  return { ok: true, value };
}

const DECLARED_NOTE = 'declarado por quien publicó, sin verificar';
const declared = (value: number): Tagged => ({ value, tag: 'estimado', sourceIds: [], note: DECLARED_NOTE });
const LOCATION_NOTE = 'ubicación marcada por quien publicó';

/**
 * Oferta -> Generator. La humedad declarada NO cambia el material del catálogo: el modelo de cálculo usa
 * `material.rawMoisture`, igual que para los generadores curados. El contacto no se incluye.
 */
export function listingToGenerator(l: ListingInput, id: string, createdAt: string): Generator {
  return {
    id: `pub-${id}`,
    name: l.name,
    kind: l.materialId === 'cascarilla' ? 'molino_arrocero' : 'aserradero',
    locality: l.locality ?? '',
    location: { lat: l.lat, lng: l.lng },
    locationNote: LOCATION_NOTE,
    materialId: l.materialId,
    tonsPerMonth: declared(l.tonsPerMonth),
    seasonality: l.seasonality ?? 'Sin dato',
    sourceIds: [],
    origin: 'publicacion',
    verified: false,
    createdAt,
  };
}

/** Demanda -> Buyer. `tonsPerMonth` es el consumo mensual de su combustible actual (t del combustible). */
export function listingToBuyer(l: ListingInput, id: string, createdAt: string): Buyer {
  const currentAlternative = l.currentAlternative ?? 'lena';
  return {
    id: `pub-${id}`,
    name: l.name,
    sector: l.sector ?? 'secadero_granos',
    locality: l.locality ?? '',
    location: { lat: l.lat, lng: l.lng },
    locationNote: LOCATION_NOTE,
    currentAlternative,
    currentAlternativeTag: { value: currentAlternative, tag: 'estimado', sourceIds: [], note: DECLARED_NOTE },
    demandTonsPerMonth: declared(l.tonsPerMonth),
    accepts: [l.materialId],
    sourceIds: [],
    origin: 'publicacion',
    verified: false,
    createdAt,
  };
}

const MATERIAL_LABEL: Record<MaterialId, string> = {
  aserrin: 'aserrín',
  chips: 'chips',
  costaneros: 'costaneros',
  cascarilla: 'cascarilla de arroz',
};

/** Link de WhatsApp (wa.me) con el teléfono solo en dígitos y prefijo 54 si falta. */
export function whatsappUrl(phone: string, materialId: MaterialId): string {
  let digits = phone.replace(/\D/g, '').replace(/^00/, '');
  if (!digits.startsWith('54')) digits = `54${digits.replace(/^0+/, '')}`;
  const text = `Hola, vi tu publicación de ${MATERIAL_LABEL[materialId]} en Circular NEA`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Publicación persistida (en Postgres o en memoria). `id` es el uuid sin el prefijo `pub-`. */
export interface StoredListing {
  id: string;
  createdAt: string;
  input: ListingInput;
}

/** Publicación persistida -> Generator (oferta) o Buyer (demanda), sin contacto. */
export function storedToEntry(s: StoredListing): { kind: 'oferta'; generator: Generator } | { kind: 'demanda'; buyer: Buyer } {
  return s.input.kind === 'oferta'
    ? { kind: 'oferta', generator: listingToGenerator(s.input, s.id, s.createdAt) }
    : { kind: 'demanda', buyer: listingToBuyer(s.input, s.id, s.createdAt) };
}
