// Política de contacto (GET /api/listings/:id/contact): publicación → empresa (con fuente) → plataforma → ninguno.
import type { CuratedContact, Source } from '../catalog';
import type { StoredListing } from '../listings/types';
import { waLink, whatsappUrl } from './whatsapp';

/** Tarjeta de contacto que se revela al tocar "Ver contacto". */
export interface ContactCard {
  /** Quién atiende: la empresa (contacto corporativo curado), quien publicó, o la plataforma como intermediaria. */
  via?: 'empresa' | 'publicacion' | 'plataforma';
  name?: string;
  phone?: string;
  email?: string;
  /** Solo si hay teléfono. */
  whatsappUrl?: string;
  /** Solo en establecimientos curados: sitio oficial. */
  website?: string;
  /** Solo en establecimientos curados: página oficial de donde sale el contacto (primera fuente). */
  sourceUrl?: string;
  /** Solo con `via: 'plataforma'`: asunto sugerido para el mailto. */
  mailtoSubject?: string;
}

/** Contacto de la plataforma (Circular NEA) como intermediaria, configurado por el despliegue. */
export interface PlatformContact {
  name: string;
  phone?: string;
  email?: string;
}

/** El contacto que dejó quien publicó. */
export function publicationContactCard(listing: StoredListing): ContactCard {
  const { name, phone, email } = listing.input.contact;
  return {
    via: 'publicacion',
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone, whatsappUrl: whatsappUrl(phone, listing.input.materialId) }),
    ...(email !== undefined && { email }),
  };
}

/** Contacto corporativo curado (`sourceUrl` = primera fuente). */
export function curatedContactCard(c: CuratedContact, sources: Source[], materialName?: string): ContactCard {
  const sourceUrl = sources.find((s) => s.id === c.sourceIds[0])?.url;
  const text = `Hola, los contacto desde Circular NEA por ${materialName ?? 'sus subproductos'}`;
  return {
    via: 'empresa',
    name: c.name,
    ...(c.website !== undefined && { website: c.website }),
    ...(c.phone !== undefined && { phone: c.phone, whatsappUrl: waLink(c.phone, text) }),
    ...(c.email !== undefined && { email: c.email }),
    ...(sourceUrl !== undefined && { sourceUrl }),
  };
}

/**
 * Contacto de la plataforma para un establecimiento curado sin contacto propio, con un mensaje que nombra
 * al establecimiento. Undefined si la plataforma no tiene teléfono ni email.
 */
export function platformContactCard(
  p: PlatformContact,
  establishmentName: string,
  materialName?: string,
): ContactCard | undefined {
  if (!p.phone && !p.email) return undefined;
  const what = materialName ? materialName : 'sus subproductos';
  const text = `Hola, me interesa contactar a ${establishmentName} por ${what}, vi su ficha en Circular NEA`;
  return {
    via: 'plataforma',
    name: p.name,
    ...(p.phone && { phone: p.phone, whatsappUrl: waLink(p.phone, text) }),
    ...(p.email && { email: p.email, mailtoSubject: `Consulta por ${establishmentName} (Circular NEA)` }),
  };
}

/** A quién se contacta: una publicación, o un establecimiento curado (con o sin contacto corporativo). */
export type ContactSubject =
  | { listing: StoredListing }
  | { establishmentName: string; materialName?: string; curated?: CuratedContact };

/** Aplica la política completa. Undefined = no hay contacto para mostrar. */
export function resolveContact(
  subject: ContactSubject,
  sources: Source[],
  platform: PlatformContact,
): ContactCard | undefined {
  if ('listing' in subject) return publicationContactCard(subject.listing);
  if (subject.curated) return curatedContactCard(subject.curated, sources, subject.materialName);
  return platformContactCard(platform, subject.establishmentName, subject.materialName);
}
