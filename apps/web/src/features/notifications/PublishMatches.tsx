import { useId } from 'react';
import { X } from 'lucide-react';
import { ContactReveal } from '@/features/contact';
import { cn } from '@/lib/utils';
import { formatKm, pct } from '@/shared/format';
import { LIGHT_LABELS, STATE_LABELS } from '@/shared/labels';
import Light from '@/shared/Light';
import { LIGHT_TONE } from '@/shared/tone';
import type { MatchItem } from './matches';

const SHOWN = 5;
const NONE = 'Todavía no hay negocios que cierren; te avisamos cuando aparezca uno.';

/** Al terminar de publicar: los negocios que cierran con la publicación (los mejores primero), con su contacto. */
export default function PublishMatches({ matches, onClose }: { matches: MatchItem[]; onClose: () => void }) {
  const titleId = useId();
  const top = matches.slice(0, SHOWN);
  const n = matches.length;
  return (
    <section
      aria-labelledby={titleId}
      data-testid="publish-matches"
      className="pointer-events-auto flex max-h-[min(30rem,calc(100dvh-12rem))] w-[26rem] max-w-full flex-col rounded-xl border border-line bg-surface shadow-overlay"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line py-3 pr-2.5 pl-4">
        <div className="min-w-0">
          <p className="kicker">Publicación creada</p>
          <h2 id={titleId} data-testid="publish-matches-title" className={cn('mt-0.5 text-pretty', n > 0 ? 'text-heading text-fg' : 'text-body text-fg-muted')}>
            {n > 0 ? `Te cierran ${n} negocio${n > 1 ? 's' : ''}` : NONE}
          </h2>
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          data-testid="publish-matches-close"
          onClick={onClose}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors duration-120 ease-out hover:bg-surface-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-selection"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </header>
      {top.length > 0 && (
        <ul className="min-h-0 divide-y divide-divider overflow-y-auto overscroll-contain">
          {top.map((m) => (
            <li key={m.counterpartId} className="px-4 py-3" data-testid={`publish-match-${m.counterpartId}`}>
              <div className="flex items-start gap-3">
                <Light light={m.light} className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-pretty text-fg">{m.counterpartName}</p>
                  <p className="mt-0.5 font-mono text-caption text-fg-subtle uppercase tabular-nums">
                    {m.locality ? `${m.locality} · ` : ''}
                    {STATE_LABELS[m.state]} · <span className="whitespace-nowrap">{formatKm(m.distanceKm)}</span>
                  </p>
                </div>
                <p className="shrink-0 text-right">
                  <span className={cn('block font-mono text-body font-semibold tabular-nums', LIGHT_TONE[m.light])}>{pct(m.marginPct)}</span>
                  <span className="block font-mono text-caption text-fg-subtle uppercase">{LIGHT_LABELS[m.light]}</span>
                </p>
              </div>
              <ContactReveal id={m.counterpartId} curated={m.counterpartOrigin !== 'publicacion'} />
            </li>
          ))}
        </ul>
      )}
      {n > top.length && (
        <p className="shrink-0 border-t border-line px-4 py-2 text-caption text-fg-subtle">
          Y {n - top.length} más en la campanita.
        </p>
      )}
    </section>
  );
}
