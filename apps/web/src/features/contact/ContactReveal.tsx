import { Loader2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactCard from './ContactCard';
import { LINK } from './link';
import { useContact } from './use-contact';

function SourcesLink({ onShowSources }: { onShowSources: () => void }) {
  return (
    <button type="button" onClick={onShowSources} className={LINK}>
      Ver fuente
    </button>
  );
}

/** "Ver contacto": lo pide a la API recién al tocar el botón (publicaciones y establecimientos curados). */
export default function ContactReveal({ id, curated, onShowSources }: { id: string; curated: boolean; onShowSources?: () => void }) {
  const { status, load } = useContact(id);

  if (status.kind === 'ready') return <ContactCard contact={status.contact} />;
  if (status.kind === 'none') {
    return (
      <p className="mt-1.5 text-caption text-fg-subtle" data-testid="contact-none">
        Sin datos de contacto publicados
        {curated && onShowSources && (
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
