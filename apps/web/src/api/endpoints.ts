// Cliente tipado de la API: cada endpoint usado por la web, con sus errores ya interpretados.
import type { ListingInput } from '@mapa/core/listings';
import { request } from './http';
import { NETWORK, interpretCatalog, interpretContact, interpretCreate, type CatalogOutcome, type ContactOutcome, type CreateOutcome } from './interpret';

export async function getCatalog(signal?: AbortSignal): Promise<CatalogOutcome> {
  try {
    const r = await request('/api/catalog', { signal });
    return interpretCatalog(r.status, r.body);
  } catch (err) {
    if (signal?.aborted) throw err;
    return { ok: false, message: err instanceof Error ? err.message : NETWORK };
  }
}

export async function postListing(input: ListingInput): Promise<CreateOutcome> {
  try {
    const r = await request('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return interpretCreate(r.status, r.body);
  } catch {
    return { ok: false, kind: 'network', message: NETWORK };
  }
}

export async function getListingContact(id: string): Promise<ContactOutcome> {
  try {
    const r = await request(`/api/listings/${encodeURIComponent(id)}/contact`);
    return interpretContact(r.status, r.body);
  } catch {
    return { ok: false, kind: 'network', message: NETWORK };
  }
}
