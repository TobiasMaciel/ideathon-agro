import { cn } from '@/lib/utils';

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  tone?: 'ok' | 'bad';
}

/**
 * Franja de KPIs flotante sobre el mapa: label mono arriba, cifra grande, sublabel chico abajo.
 * Si la barra superior (contenedor `@container`) no tiene lugar, las cards se compactan (cifra 20 px, sin sublabel).
 */
export default function KpiStrip({ items, className }: { items: Kpi[]; className?: string }) {
  return (
    <ul aria-label="Resumen" className={cn('flex gap-2', className)}>
      {items.map((k) => (
        <li
          key={k.label}
          className="max-w-52 min-w-36 shrink-0 rounded-md border border-line bg-surface/90 px-3.5 py-2.5 shadow-overlay backdrop-blur-md @max-[58rem]:min-w-0 @max-[58rem]:px-2.5 @max-[58rem]:py-1.5"
        >
          <p className="eyebrow whitespace-nowrap">{k.label}</p>
          <p className={cn('mt-0.5 font-display text-figure whitespace-nowrap tabular-nums font-stretch-semi-expanded @max-[58rem]:text-title @max-[58rem]:font-bold', k.tone === 'ok' ? 'text-ok' : k.tone === 'bad' ? 'text-bad' : 'text-fg')}>
            {k.value}
          </p>
          <p className="text-caption text-pretty text-fg-muted @max-[58rem]:sr-only">{k.sub}</p>
        </li>
      ))}
    </ul>
  );
}
