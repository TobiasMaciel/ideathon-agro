import { ExternalLink, Globe, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContactInfo, ContactVia } from '@/api';
import { cn } from '@/lib/utils';
import { LINK } from './link';

const VIA_TITLE: Record<ContactVia, string> = {
  empresa: 'Contacto publicado por la empresa',
  publicacion: 'Contacto de quien publicó',
  plataforma: 'Contactar a través de Sobra',
};

/** Dominio de la fuente como texto del link ("empresa.com.ar"). */
function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Datos de contacto ya revelados: quién responde, teléfono/email y acciones (WhatsApp, email, sitio). */
export default function ContactCard({ contact }: { contact: ContactInfo }) {
  const empty = !contact.name && !contact.phone && !contact.email && !contact.website;
  const via = contact.via;
  // Con via=empresa la fuente va junto al título; en el resto, como línea al pie.
  const sourceInHeader = via === 'empresa' && contact.sourceUrl;
  return (
    <div data-testid="listing-contact" data-via={via} className="mt-2 rounded-md border border-line bg-surface px-3 py-2.5">
      {via && (
        <div className="mb-2">
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span className="text-small font-medium text-fg" data-testid="contact-title">
              {VIA_TITLE[via]}
            </span>
            {sourceInHeader && (
              <a href={contact.sourceUrl} target="_blank" rel="noopener noreferrer" data-testid="contact-source" className={cn(LINK, 'text-caption')}>
                Fuente ↗<span className="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            )}
          </p>
          {via === 'plataforma' && <p className="mt-0.5 text-caption text-fg-subtle">Esta empresa todavía no publicó su contacto. Te conectamos.</p>}
        </div>
      )}
      {empty ? (
        <p className="text-small text-fg-muted">No hay datos de contacto cargados.</p>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-small">
          {contact.name && (
            <>
              <dt className="eyebrow self-center">Nombre</dt>
              <dd className="text-fg">{contact.name}</dd>
            </>
          )}
          {contact.phone && (
            <>
              <dt className="eyebrow self-center">Teléfono</dt>
              <dd>
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="font-mono text-fg tabular-nums underline-offset-2 hover:underline">
                  {contact.phone}
                </a>
              </dd>
            </>
          )}
          {contact.email && (
            <>
              <dt className="eyebrow self-center">Email</dt>
              <dd className="min-w-0 break-all text-fg">{contact.email}</dd>
            </>
          )}
        </dl>
      )}
      {(contact.whatsappUrl || contact.email || contact.website) && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {contact.whatsappUrl && (
            <Button asChild className="h-8 px-3 text-small">
              <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" data-testid="contact-whatsapp">
                <MessageCircle aria-hidden="true" />
                Escribir por WhatsApp
                <span className="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            </Button>
          )}
          {contact.email && (
            <Button asChild variant="outline" className="h-8 px-3 text-small">
              <a href={`mailto:${contact.email}`} data-testid="contact-email">
                <Mail aria-hidden="true" />
                Enviar email
              </a>
            </Button>
          )}
          {contact.website && (
            <Button asChild variant="outline" className="h-8 px-3 text-small">
              <a href={contact.website} target="_blank" rel="noopener noreferrer" data-testid="contact-website">
                <Globe aria-hidden="true" />
                Sitio web ↗<span className="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            </Button>
          )}
        </div>
      )}
      {contact.sourceUrl && !sourceInHeader && (
        <p className="mt-2 text-caption text-fg-subtle" data-testid="contact-source">
          Fuente:{' '}
          <a href={contact.sourceUrl} target="_blank" rel="noopener noreferrer" className={cn(LINK, 'inline-flex items-center gap-0.5 break-all')}>
            {sourceLabel(contact.sourceUrl)}
            <ExternalLink size={11} aria-hidden="true" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </p>
      )}
    </div>
  );
}
