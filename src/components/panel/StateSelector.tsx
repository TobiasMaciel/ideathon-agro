import type { MaterialState } from '@/lib/viability/types';

const LABELS: Record<MaterialState, string> = { suelto: 'Suelto', compactado: 'Compactado', pellet: 'Pellet' };
const ORDER: MaterialState[] = ['suelto', 'compactado', 'pellet'];

interface Props {
  value: MaterialState;
  available: MaterialState[];
  onChange: (s: MaterialState) => void;
}

export default function StateSelector({ value, available, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Estado del material" className="grid grid-cols-3 gap-1 rounded-lg bg-stone-200 p-1">
      {ORDER.map((s) => {
        const ok = available.includes(s);
        const active = value === s;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!ok}
            title={ok ? undefined : 'no disponible para este material'}
            data-testid={`state-${s}`}
            onClick={() => onChange(s)}
            className={`rounded-md px-2 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 ${
              active ? 'bg-green-800 text-white shadow' : 'text-stone-900 hover:bg-stone-100'
            } disabled:cursor-not-allowed disabled:text-stone-600 disabled:hover:bg-transparent`}
          >
            {LABELS[s]}
            {!ok && <span className="block text-[10px] font-normal leading-tight">no disponible para este material</span>}
          </button>
        );
      })}
    </div>
  );
}
