// Validación del JSON crudo de una publicación (mensajes en español).
import { isOneOf } from '../enums';
import type { AlternativeId, BuyerSector, MaterialId } from '../enums';
import {
  LISTING_ALTERNATIVES,
  LISTING_BOUNDS,
  LISTING_KINDS,
  LISTING_MATERIALS,
  LISTING_MAX_MOISTURE,
  LISTING_SECTORS,
  LISTING_TONS,
  type ListingContact,
  type ListingInput,
  type ListingKind,
  type ListingValidation,
} from './types';

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
const inList = isOneOf;

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
