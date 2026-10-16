// Cliente de las rutas de publicaciones. `interpret*` es puro (testeado); `post*`/`get*` agregan fetch y errores de red.
import type { ListingContactResponse, ListingCreatedResponse } from '@mapa/core/api';
import type { ListingInput } from '@mapa/core/listings';

const BASE = import.meta.env?.VITE_API_URL ?? '';
const GENERIC = 'No pudimos completar la operación. Probá de nuevo en un rato.';
const NETWORK = 'No hay conexión con el servidor. Revisá tu conexión y probá de nuevo.';

export type CreateOutcome =
  | { ok: true; created: ListingCreatedResponse }
  | { ok: false; kind: 'validation'; message: string; details: string[] }
  | { ok: false; kind: 'rate' | 'server' | 'network'; message: string };

/**
 * Contacto tal como lo muestra la web. Extiende el contrato de core con campos que el back puede sumar para los
 * establecimientos curados (contacto corporativo público, con fuente). Todos opcionales.
 */
export type ContactVia = 'empresa' | 'publicacion' | 'plataforma';

export interface ContactInfo extends ListingContactResponse {
  /** Quién responde: la empresa (contacto público con fuente), quien publicó, o Circular NEA como intermediario. */
  via?: ContactVia;
  website?: string;
  sourceUrl?: string;
  sourceIds?: string[];
}

export type ContactOutcome =
  | { ok: true; contact: ContactInfo }
  | { ok: false; kind: 'rate' | 'notfound' | 'server' | 'network'; message: string };

function errorText(body: unknown): string | null {
  if (typeof body === 'object' && body !== null && typeof (body as { error?: unknown }).error === 'string') {
    return (body as { error: string }).error;
  }
  return null;
}

export function interpretCreate(status: number, body: unknown): CreateOutcome {
  if (status === 201 && typeof body === 'object' && body !== null && 'listing' in body) {
    return { ok: true, created: body as ListingCreatedResponse };
  }
  const message = errorText(body) ?? GENERIC;
  if (status === 400) {
    const raw = (body as { details?: unknown } | null)?.details;
    const details = Array.isArray(raw) ? raw.filter((d): d is string => typeof d === 'string') : [];
    return { ok: false, kind: 'validation', message, details };
  }
  if (status === 429) return { ok: false, kind: 'rate', message };
  return { ok: false, kind: 'server', message };
}

/** Solo http(s): cualquier otro esquema (javascript:, data:) se descarta. */
function safeHttp(url: unknown): string | undefined {
  return typeof url === 'string' && /^https?:\/\//i.test(url) ? url : undefined;
}

/** Solo links de wa.me: el resto se descarta (se abre en una pestaña nueva). */
function safeWhatsapp(url: unknown): string | undefined {
  return typeof url === 'string' && url.startsWith('https://wa.me/') ? url : undefined;
}

export function interpretContact(status: number, body: unknown): ContactOutcome {
  if (status === 200 && typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === 'string' && v !== '' ? v : undefined);
    const contact: ContactInfo = {};
    if (str(b.name)) contact.name = str(b.name);
    if (str(b.phone)) contact.phone = str(b.phone);
    if (str(b.email)) contact.email = str(b.email);
    const wa = safeWhatsapp(b.whatsappUrl);
    if (wa) contact.whatsappUrl = wa;
    const website = safeHttp(b.website);
    if (website) contact.website = website;
    const sourceUrl = safeHttp(b.sourceUrl);
    if (sourceUrl) contact.sourceUrl = sourceUrl;
    if (b.via === 'empresa' || b.via === 'publicacion' || b.via === 'plataforma') contact.via = b.via;
    if (Array.isArray(b.sourceIds)) {
      const ids = b.sourceIds.filter((x): x is string => typeof x === 'string');
      if (ids.length > 0) contact.sourceIds = ids;
    }
    return { ok: true, contact };
  }
  const message = errorText(body) ?? GENERIC;
  if (status === 429) return { ok: false, kind: 'rate', message };
  if (status === 404) return { ok: false, kind: 'notfound', message };
  return { ok: false, kind: 'server', message };
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function postListing(input: ListingInput): Promise<CreateOutcome> {
  try {
    const res = await fetch(`${BASE}/api/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return interpretCreate(res.status, await readJson(res));
  } catch {
    return { ok: false, kind: 'network', message: NETWORK };
  }
}

export async function getListingContact(id: string): Promise<ContactOutcome> {
  try {
    const res = await fetch(`${BASE}/api/listings/${encodeURIComponent(id)}/contact`);
    return interpretContact(res.status, await readJson(res));
  } catch {
    return { ok: false, kind: 'network', message: NETWORK };
  }
}
