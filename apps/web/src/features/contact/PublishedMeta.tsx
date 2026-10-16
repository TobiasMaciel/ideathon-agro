import { cn } from '@/lib/utils';
import { publishedAgo } from './published-ago';

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
export default function PublishedMeta({ entity, className }: { entity: { createdAt?: string }; className?: string }) {
  const ago = entity.createdAt ? publishedAgo(entity.createdAt) : null;
  return (
    <span className={cn('flex flex-wrap items-center gap-x-2 gap-y-1', className)}>
      <UnverifiedBadge />
      {ago && <span className="text-caption text-fg-subtle">{ago}</span>}
    </span>
  );
}
