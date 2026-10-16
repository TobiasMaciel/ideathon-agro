import { useState } from 'react';
import { ExternalLink, Globe, Loader2, Mail, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getListingContact, type ContactInfo, type ContactVia } from '@/api/interpret';
import { publishedAgo } from './form';

interface Entity {
  id: string;
  origin?: 'curado' | 'publicacion';
  createdAt?: string;
}

const isPublished = (e: Entity) => e.origin === 'publicacion';

/** "SIN VERIFICAR": mono, tono terciario, borde punteado (el mismo lenguaje que "estimado"). No alarma. */
export function UnverifiedBadge({ className }: { className?: string }) {
  return (
    <span
      data-testid="unverified-badge"
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded-xs border border-dashed border-line-strong px-1.5 font-mono text-caption whitespace-nowrap text-fg-subtle uppercase',
        className,
      )}
    >
      Sin verificar
    </span>
  );
}

/** Badge + "Publicado hace X" en una línea. */
export function PublishedMeta({ entity, className }: { entity: Entity; className?: string }) {
  const ago = entity.createdAt ? publishedAgo(entity.createdAt) : null;
  return (
    <span className={cn('flex flex-wrap items-center gap-x-2 gap-y-1', className)}>
      <UnverifiedBadge />
      {ago && <span className="text-caption text-fg-subtle">{ago}</span>}
    </span>
  );
}

/** Respuestas ya pedidas en esta sesión (también los 404): no se vuelve a gastar el límite por IP. */
type Settled = { kind: 'ready'; contact: ContactInfo } | { kind: 'none' };
const cache = new Map<string, Settled>();

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string } | Settled;

const LINK = 'rounded-xs text-fg-muted underline underline-offset-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection';

function SourcesLink({ onShowSources }: { onShowSources: () => void }) {
  return (
    <button type="button" onClick={onShowSources} className={LINK}>
      Ver fuente
    </button>
  );
}

const VIA_TITLE: Record<ContactVia, string> = {
  empresa: 'Contacto publicado por la empresa',
  publicacion: 'Contacto de quien publicó',
  plataforma: 'Contactar a través de Circular NEA',
};

function ContactCard({ contact }: { contact: ContactInfo }) {
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

/** Dominio de la fuente como texto del link ("empresa.com.ar"). */
function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** "Ver contacto": lo pide a la API recién al tocar el botón (publicaciones y establecimientos curados). */
function ContactReveal({ id, curated, onShowSources }: { id: string; curated: boolean; onShowSources: () => void }) {
  const [status, setStatus] = useState<Status>(() => cache.get(id) ?? { kind: 'idle' });
  const [forId, setForId] = useState(id);
  if (forId !== id) {
    // Cambió el establecimiento mostrado: arranca de nuevo (o del cache).
    setForId(id);
    setStatus(cache.get(id) ?? { kind: 'idle' });
  }

  const load = async () => {
    if (status.kind === 'loading') return;
    setStatus({ kind: 'loading' });
    const r = await getListingContact(id);
    if (r.ok || r.kind === 'notfound') {
      const settled: Settled = r.ok ? { kind: 'ready', contact: r.contact } : { kind: 'none' };
      cache.set(id, settled);
      setStatus(settled);
    } else {
      setStatus({ kind: 'error', message: r.message });
    }
  };

  if (status.kind === 'ready') return <ContactCard contact={status.contact} />;
  if (status.kind === 'none') {
    return (
      <p className="mt-1.5 text-caption text-fg-subtle" data-testid="contact-none">
        Sin datos de contacto publicados
        {curated && (
          <>
            {' · '}
            <SourcesLink onShowSources={onShowSources} />
          </>
        )}
      </p>
    );
  }
  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="outline"
        data-testid="contact-reveal"
        aria-disabled={status.kind === 'loading' || undefined}
        onClick={load}
        className="h-8 px-3 text-small"
      >
        {status.kind === 'loading' ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Phone aria-hidden="true" />}
        {status.kind === 'loading' ? 'Buscando contacto…' : 'Ver contacto'}
      </Button>
      {status.kind === 'error' && (
        <p role="alert" className="mt-1.5 text-caption text-bad">
          {status.message}
        </p>
      )}
    </div>
  );
}

/**
 * Debajo de "Tu planta" y del comprador elegido: "Ver contacto" para todos. Publicación: además badge y antigüedad.
 * Si la API no tiene contacto (404), lo dice; en un curado, ofrece ir a Fuentes.
 */
export default function ListingInfo({ entity, onShowSources, className }: { entity: Entity; onShowSources: () => void; className?: string }) {
  const published = isPublished(entity);
  return (
    <div className={className} data-testid={`listing-info-${entity.id}`}>
      {published && <PublishedMeta entity={entity} />}
      <ContactReveal id={entity.id} curated={!published} onShowSources={onShowSources} />
    </div>
  );
}
