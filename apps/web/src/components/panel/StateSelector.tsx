import { useId } from 'react';
import { formatKm } from '@mapa/core/format';
import type { MaterialState } from '@mapa/core/viability';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

const LABELS: Record<MaterialState, string> = { suelto: 'Suelto', compactado: 'Compactado', pellet: 'Pellet' };
const ORDER: MaterialState[] = ['suelto', 'compactado', 'pellet'];

export interface StateStat {
  /** Radio viable por ruta con ese estado. */
  radiusKm: number;
  /** Compradores con los que cierra. */
  closes: number;
}

interface Props {
  value: MaterialState;
  available: MaterialState[];
  /** Nombre del material, para explicar qué opciones no están disponibles. */
  materialName: string;
  stats: Partial<Record<MaterialState, StateStat>>;
  onChange: (s: MaterialState) => void;
}

function listJoin(items: string[]): string {
  return items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

/**
 * Selector en cards (Radix ToggleGroup de selección única: role="radio"). Cada card adelanta qué pasa con ese
 * estado: radio viable arriba y cuántos negocios cierran abajo. Patrón APG: las flechas eligen la siguiente opción.
 */
export default function StateSelector({ value, available, materialName, stats, onChange }: Props) {
  const labelId = useId();
  const noteId = useId();
  const statId = useId();
  const missing = ORDER.filter((s) => !available.includes(s));
  const note = missing.length
    ? `${listJoin(missing.map((s) => LABELS[s]))} no disponible${missing.length > 1 ? 's' : ''} para ${materialName.toLowerCase()}`
    : null;

  return (
    <div>
      <p id={labelId} className="eyebrow mb-1.5">
        Cómo lo vendés
      </p>
      <ToggleGroup
        type="single"
        role="radiogroup"
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v as MaterialState); // Radix manda "" al tocar la opción elegida: no se puede quedar sin estado.
        }}
        aria-labelledby={labelId}
        aria-describedby={note ? noteId : undefined}
        rovingFocus={false}
        onKeyDown={(e) => {
          const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (!delta) return;
          e.preventDefault();
          const enabled = ORDER.filter((s) => available.includes(s));
          const next = enabled[(enabled.indexOf(value) + delta + enabled.length) % enabled.length];
          if (!next) return;
          onChange(next);
          e.currentTarget.querySelector<HTMLElement>(`[data-testid="state-${next}"]`)?.focus();
        }}
        spacing={2}
        className="grid w-full grid-cols-3 gap-2"
      >
        {ORDER.map((s) => {
          const ok = available.includes(s);
          const st = stats[s];
          // Nombre accesible corto (el estado); las cifras van como descripción.
          const kmId = `${statId}-${s}-km`;
          const closesId = `${statId}-${s}-closes`;
          return (
            <ToggleGroupItem
              key={s}
              value={s}
              disabled={!ok}
              tabIndex={s === value ? 0 : -1}
              data-testid={`state-${s}`}
              aria-label={LABELS[s]}
              aria-describedby={`${kmId} ${closesId}`}
              title={ok ? undefined : `No disponible para ${materialName.toLowerCase()}`}
              className="flex h-auto min-w-0 flex-col items-start gap-0.5 rounded-md border border-line bg-surface px-2.5 py-2 text-left whitespace-normal transition-colors duration-120 ease-out hover:border-line-strong hover:bg-surface-subtle focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection disabled:opacity-100 data-[state=on]:border-selection data-[state=on]:bg-selection-subtle"
            >
              <span id={kmId} className="eyebrow">
                {ok && st ? <><span className="sr-only">Radio viable: </span>{formatKm(st.radiusKm)}</> : '—'}
              </span>
              <span className={cn('text-body font-semibold', ok ? 'text-fg' : 'text-fg-subtle line-through decoration-1')}>{LABELS[s]}</span>
              <span
                id={closesId}
                className={cn(
                  'font-mono text-caption font-medium uppercase tabular-nums',
                  !ok || !st ? 'text-fg-subtle' : st.closes > 0 ? 'text-ok' : 'text-bad',
                )}
              >
                {!ok || !st ? 'No disponible' : st.closes > 0 ? `${st.closes} cierra${st.closes > 1 ? 'n' : ''}` : 'No cierra'}
              </span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      {note && (
        <p id={noteId} className="mt-1.5 text-caption text-fg-subtle">
          {note}
        </p>
      )}
    </div>
  );
}
