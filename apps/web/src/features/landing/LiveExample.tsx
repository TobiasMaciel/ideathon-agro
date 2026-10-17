import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ars, formatKm, formatNumber, pct } from '@/shared/format';
import { GENERATOR_KIND_LABELS, LIGHT_LABELS, MATERIAL_LABELS, SECTOR_SINGULAR, STATE_LABELS } from '@/shared/labels';
import Light from '@/shared/Light';
import { HREF } from '@/shared/route';
import type { Example } from './examples';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Ventana de la portada: recorre plantas reales y muestra qué pasa al venderlas suelto, compactado o en pellet. */
export default function LiveExample({ examples }: { examples: Example[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduced() || examples.length < 2) return;
    const t = setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % examples.length);
    }, 6500);
    return () => clearInterval(t);
  }, [paused, examples.length]);

  const ex = examples[i % examples.length];
  if (!ex) return null;
  const { generator, rows, best } = ex;
  const maxKm = Math.max(...rows.map((r) => r.roadKm), 1);

  return (
    <figure
      className="relative m-0 overflow-hidden rounded-lg border border-line bg-surface shadow-overlay"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="kicker">Ejemplo en vivo</p>
        <div role="tablist" aria-label="Elegir planta" className="flex gap-1.5">
          {examples.map((e, n) => (
            <button
              key={e.generator.id}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={e.generator.name}
              onClick={() => setI(n)}
              className={cn(
                'h-1.5 w-5 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection',
                n === i ? 'bg-selection-solid' : 'bg-line hover:bg-line-strong',
              )}
            />
          ))}
        </div>
      </div>

      <div key={generator.id} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-500">
        <div className="px-5 pt-4">
          <p className="font-display text-title font-semibold text-pretty text-fg">{generator.name}</p>
          <p className="mt-1 font-mono text-caption text-fg-subtle uppercase tabular-nums">
            {GENERATOR_KIND_LABELS[generator.kind]} · {MATERIAL_LABELS[generator.materialId]} · {generator.locality} ·{' '}
            {formatNumber(generator.tonsPerMonth.value)} t/mes
          </p>
        </div>

        <ul aria-label="Radio viable según cómo se vende" className="mt-4 space-y-2.5 px-5">
          {rows.map((r) => (
            <li key={r.state} className="grid grid-cols-[5.75rem_minmax(0,1fr)_5.5rem] items-center gap-3 text-small">
              <span className={cn('font-medium', best?.state === r.state ? 'text-fg' : 'text-fg-muted')}>{STATE_LABELS[r.state]}</span>
              <span className="relative h-2 overflow-hidden rounded-full bg-surface-subtle" aria-hidden="true">
                <span
                  className={cn('absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out', best?.state === r.state ? 'bg-selection-solid' : 'bg-line-strong/60')}
                  style={{ width: `${Math.max(4, (r.roadKm / maxKm) * 100)}%` }}
                />
              </span>
              <span className="text-right font-mono text-caption text-fg-muted tabular-nums">
                {formatKm(r.roadKm)} · <span className={r.closes > 0 ? 'text-ok' : 'text-bad'}>{r.closes}✓</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 px-5 font-mono text-caption text-fg-subtle">Radio por ruta en el que el flete no se come el precio · ✓ = compradores con los que cierra</p>

        {best && (
          <div className="mt-4 bg-selection-solid px-5 pt-3.5 pb-4 text-on-accent">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="kicker text-on-accent/85 before:bg-on-accent">Mejor negocio · {STATE_LABELS[best.state]}</p>
              <p className="flex items-center gap-1.5 rounded-sm bg-surface py-0.5 pr-2 pl-1 font-mono text-caption font-medium tracking-wide text-ok uppercase tabular-nums">
                <Light light="verde" size="xs" />
                {LIGHT_LABELS.verde}: margen {pct(best.match.result.marginPct)}
              </p>
            </div>
            <p className="mt-2 font-display text-heading font-semibold text-pretty">{best.match.buyer.name}</p>
            <p className="mt-0.5 font-mono text-caption text-on-accent/85 uppercase tabular-nums">
              {SECTOR_SINGULAR[best.match.buyer.sector]} · {best.match.buyer.locality} · {formatKm(best.match.result.distanceKm)} por ruta
            </p>
            <p className="mt-3 font-mono text-overline tracking-[0.12em] text-on-accent/85 uppercase">Margen por mes</p>
            <p className="font-display text-[2.25rem] leading-10 font-extrabold tracking-[-0.03em] tabular-nums">{ars(best.match.result.marginPerMonth)}</p>
          </div>
        )}
      </div>

      <a
        href={HREF.mapa}
        className="group flex items-center justify-between gap-2 border-t border-line px-5 py-3 text-small font-semibold text-selection transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-selection"
      >
        Ver todos los compradores en el mapa
        <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </a>
    </figure>
  );
}
