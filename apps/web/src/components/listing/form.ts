// Formulario de publicación (lógica pura): borrador en texto -> JSON crudo -> validación de core, con errores por campo.
import type { AlternativeId, BuyerSector, MaterialId } from '@mapa/core/data';
import { LISTING_BOUNDS, LISTING_MAX_MOISTURE, validateListing, type ListingInput, type ListingKind } from '@mapa/core/listings';

export interface LatLng {
  lat: number;
  lng: number;
}

/** Lo que tipea la persona: todo texto (salvo la ubicación), para no pelear con el input mientras escribe. */
export interface ListingDraft {
  kind: ListingKind;
  name: string;
  locality: string;
  materialId: MaterialId | '';
  tons: string;
  /** Solo oferta, en %. */
  moisture: string;
  /** Solo oferta. */
  seasonality: string;
  /** Solo demanda. */
  sector: BuyerSector | '';
  /** Solo demanda. */
  currentAlternative: AlternativeId | '';
  location: LatLng | null;
  contactName: string;
  phone: string;
  email: string;
}

export type ListingField =
  | 'name'
  | 'locality'
  | 'location'
  | 'materialId'
  | 'tons'
  | 'moisture'
  | 'seasonality'
  | 'sector'
  | 'currentAlternative'
  | 'contactName'
  | 'phone'
  | 'email'
  | 'contact';

export type FieldErrors = Partial<Record<ListingField, string>>;

export function emptyDraft(kind: ListingKind = 'oferta'): ListingDraft {
  return {
    kind,
    name: '',
    locality: '',
    materialId: '',
    tons: '',
    moisture: '',
    seasonality: '',
    sector: '',
    currentAlternative: '',
    location: null,
    contactName: '',
    phone: '',
    email: '',
  };
}

/** Número escrito a la argentina ("1.200,5") o con punto decimal ("2.5"). Vacío: undefined; basura: NaN. */
export function parseDecimal(text: string): number | undefined {
  const t = text.trim().replace(/\s/g, '');
  if (t === '') return undefined;
  let normalized = t;
  if (t.includes(',')) normalized = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) normalized = t.replace(/\./g, '');
  return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN;
}

/** Humedad en % ("35", "35 %") -> fracción (0,35). */
export function parseMoisturePct(text: string): number | undefined {
  const pct = parseDecimal(text.replace('%', ''));
  return pct === undefined ? undefined : pct / 100;
}

export function inNea({ lat, lng }: LatLng): boolean {
  const b = LISTING_BOUNDS;
  return lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax;
}

const text = (s: string) => s.trim();

/** JSON que se manda a POST /api/listings (y que valida core en el cliente). Omite vacíos y campos del otro tipo. */
export function draftToRaw(d: ListingDraft): Record<string, unknown> {
  const raw: Record<string, unknown> = { kind: d.kind, name: text(d.name) };
  if (text(d.locality)) raw.locality = text(d.locality);
  if (d.location) {
    raw.lat = d.location.lat;
    raw.lng = d.location.lng;
  }
  if (d.materialId) raw.materialId = d.materialId;
  raw.tonsPerMonth = parseDecimal(d.tons);
  if (d.kind === 'oferta') {
    const m = parseMoisturePct(d.moisture);
    if (m !== undefined) raw.moisture = m;
    if (text(d.seasonality)) raw.seasonality = text(d.seasonality);
  } else {
    if (d.sector) raw.sector = d.sector;
    if (d.currentAlternative) raw.currentAlternative = d.currentAlternative;
  }
  const contact: Record<string, string> = {};
  if (text(d.contactName)) contact.name = text(d.contactName);
  if (text(d.phone)) contact.phone = text(d.phone);
  if (text(d.email)) contact.email = text(d.email);
  raw.contact = contact;
  return raw;
}

/** Campo al que corresponde cada mensaje de `validateListing` (el orden importa: "nombre de contacto" antes que "nombre"). */
const MESSAGE_FIELDS: [RegExp, ListingField][] = [
  [/^El nombre de contacto/, 'contactName'],
  [/^El nombre/, 'name'],
  [/^La localidad/, 'locality'],
  [/^La (latitud|longitud)/, 'location'],
  [/^El material/, 'materialId'],
  [/^Las toneladas/, 'tons'],
  [/^La humedad/, 'moisture'],
  [/^La estacionalidad/, 'seasonality'],
  [/combustible actual/, 'currentAlternative'],
  [/requiere el sector/, 'sector'],
  [/^El teléfono/, 'phone'],
  [/^El email/, 'email'],
  [/contacto/i, 'contact'],
];

/**
 * Mensajes propios solo donde el de core muestra ids internos o unidades que la persona no tipeó
 * (fracción en vez de %); el resto se muestra igual que lo devuelve el servidor.
 */
const FRIENDLY: Partial<Record<ListingField, string>> = {
  materialId: 'Elegí el material.',
  sector: 'Elegí el sector.',
  currentAlternative: 'Elegí el combustible que usás hoy.',
  moisture: `La humedad debe estar entre 0 y ${Math.round(LISTING_MAX_MOISTURE * 100)} %.`,
  location: 'Ese punto queda fuera del NEA. Marcá un punto dentro de la región.',
};

export function fieldOf(message: string): ListingField | null {
  return MESSAGE_FIELDS.find(([re]) => re.test(message))?.[1] ?? null;
}

/** Reparte una lista de mensajes de validación por campo (el primero de cada campo). */
export function mapServerDetails(details: string[]): { fieldErrors: FieldErrors; unmapped: string[] } {
  const fieldErrors: FieldErrors = {};
  const unmapped: string[] = [];
  for (const msg of details) {
    const field = fieldOf(msg);
    if (!field) unmapped.push(msg);
    else fieldErrors[field] ??= FRIENDLY[field] ?? msg;
  }
  return { fieldErrors, unmapped };
}

export type DraftValidation = { ok: true; value: ListingInput } | { ok: false; fieldErrors: FieldErrors; unmapped: string[] };

/** Valida con `validateListing` de core (mismas reglas que el servidor) y devuelve errores por campo. */
export function validateDraft(d: ListingDraft): DraftValidation {
  const result = validateListing(draftToRaw(d));
  if (result.ok) return { ok: true, value: result.value };
  const mapped = mapServerDetails(result.errors);
  if (!d.location) mapped.fieldErrors.location = 'Marcá la ubicación en el mapa o usá tu ubicación.';
  return { ok: false, ...mapped };
}

/** "Publicado hace 5 min" a partir del `createdAt` ISO; null si la fecha no se puede leer. */
export function publishedAgo(createdAt: string, now: Date = new Date()): string | null {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return null;
  const minutes = Math.floor((now.getTime() - t) / 60_000);
  if (minutes < 1) return 'Publicado recién';
  if (minutes < 60) return `Publicado hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Publicado hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Publicado hace ${days} ${days === 1 ? 'día' : 'días'}`;
}
