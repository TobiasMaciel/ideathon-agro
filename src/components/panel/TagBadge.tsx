import type { DataLabel } from '@/lib/viability/types';

export default function TagBadge({ tag }: { tag: DataLabel }) {
  const real = tag === 'real';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        real ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'
      }`}
    >
      {real ? 'real' : 'estimado'}
    </span>
  );
}
