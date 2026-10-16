import type { ListingCreatedResponse } from '@mapa/core/contracts';
import { storedToEntry, validateListing } from '@mapa/core/listings';
import type { Deps } from './deps';
import { AppError } from './errors';

/** Publicación abierta: valida, aplica el límite por IP (hasheada) y guarda. Devuelve la entidad sin contacto. */
export async function createListing(
  deps: Pick<Deps, 'listings' | 'rateLimiter' | 'hashIp'>,
  raw: unknown,
  ip: string,
): Promise<ListingCreatedResponse> {
  const parsed = validateListing(raw);
  if (!parsed.ok) throw new AppError('invalid', 'La publicación no es válida.', parsed.errors);
  const ipHash = await deps.hashIp(ip);
  if (!(await deps.rateLimiter.allow('create', ipHash))) {
    throw new AppError('rate_limited', 'Demasiadas publicaciones desde esta conexión. Probá más tarde.');
  }
  const entry = storedToEntry(await deps.listings.add(parsed.value, ipHash));
  return entry.kind === 'oferta'
    ? { kind: 'oferta', listing: entry.generator }
    : { kind: 'demanda', listing: entry.buyer };
}
