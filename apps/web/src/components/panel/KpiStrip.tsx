import { cn } from '@/lib/utils';

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  tone?: 'ok' | 'bad';
}

/** Franja de KPIs flotante sobre el mapa: label mono arriba, cifra grande, sublabel chico abajo. */
export default function KpiStrip({ items, className, compact = false }: { items: Kpi[]; className?: string; compact?: boolean }) {
  return (
    <ul aria-label="Resumen" className={cn('flex gap-2', className)}>
      {items.map((k) => (
        <li
          key={k.label}
          className={cn('shrink-0 snap-start rounded-lg border border-line bg-surface/90 shadow-overlay backdrop-blur-md', compact ? 'px-2.5 py-1.5' : 'max-w-52 min-w-36 px-3 py-2')}
        >
          <p className="eyebrow whitespace-nowrap">{k.label}</p>
          <p
            className={cn(
              'font-mono whitespace-nowrap tabular-nums', compact ? 'text-title font-bold' : 'text-figure',
              k.tone === 'ok' ? 'text-ok' : k.tone === 'bad' ? 'text-bad' : 'text-fg',
            )}
          >
            {k.value}
          </p>
          {!compact && <p className="text-caption text-pretty text-fg-muted">{k.sub}</p>}
        </li>
      ))}
    </ul>
  );
}
