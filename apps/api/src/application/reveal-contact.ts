import type { Source } from '@mapa/core/catalog';
import { resolveContact, type ContactCard, type ContactSubject } from '@mapa/core/contact';
import type { Deps } from './deps';
import { AppError } from './errors';

const PUB = 'pub-';

/**
 * Contacto bajo demanda (no viaja en el catálogo), con límite por IP. `pub-*`: el que dejó quien publicó.
 * Curados: contacto corporativo con fuente o, si no tienen, el de la plataforma (si está configurado).
 */
export async function revealContact(deps: Deps, id: string, ip: string): Promise<ContactCard> {
  const ipHash = await deps.hashIp(ip);
  if (!(await deps.rateLimiter.allow('contact', ipHash))) {
    throw new AppError('rate_limited', 'Demasiadas consultas de contacto desde esta conexión. Probá más tarde.');
  }

  let subject: ContactSubject;
  let sources: Source[] = [];
  if (id.startsWith(PUB)) {
    const listing = await deps.listings.get(id.slice(PUB.length));
    if (!listing) throw new AppError('not_found', 'No existe la publicación.');
    subject = { listing };
  } else {
    const data = await deps.catalog.load();
    const generator = data.generators.find((g) => g.id === id);
    const entity = generator ?? data.buyers.find((b) => b.id === id);
    if (!entity) throw new AppError('not_found', 'No existe el establecimiento.');
    const materialName = generator
      ? data.materials.find((m) => m.id === generator.materialId)?.name.toLowerCase()
      : undefined;
    subject = { establishmentName: entity.name, materialName, curated: await deps.contacts.get(id) };
    sources = data.sources;
  }

  const card = resolveContact(subject, sources, deps.platformContact);
  if (!card) throw new AppError('not_found', 'Este establecimiento no tiene datos de contacto publicados.');
  return card;
}
