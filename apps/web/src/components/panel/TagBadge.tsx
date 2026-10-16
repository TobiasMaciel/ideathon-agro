import type { DataLabel } from '@mapa/core/viability';
import { cn } from '@/lib/utils';

/** real = relleno con punto sólido; estimado = borde punteado con punto hueco. No usa colores del semáforo. */
export default function TagBadge({ tag }: { tag: DataLabel }) {
  const real = tag === 'real';
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 rounded-xs px-1.5 font-mono text-caption whitespace-nowrap uppercase',
        real ? 'bg-surface-subtle text-fg' : 'border border-dashed border-line-strong text-fg-muted',
      )}
    >
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', real ? 'bg-fg' : 'border border-fg-muted')} />
      {real ? 'real' : 'estimado'}
    </span>
  );
}
