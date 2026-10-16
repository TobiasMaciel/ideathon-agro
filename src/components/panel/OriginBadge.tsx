import type { DataOrigin } from '@/lib/api/types';

export default function OriginBadge({ origin }: { origin: DataOrigin }) {
  return (
    <p data-testid="origin-badge" className="text-xs text-stone-600">
      {origin === 'supabase' ? 'Datos: Supabase' : 'Datos: locales (src/data)'}
    </p>
  );
}
