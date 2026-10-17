import { useId } from 'react';
import type { TrafficLight } from '@mapa/core/viability';
import { formatKm, formatNumber } from '@/shared/format';
import { cn } from '@/lib/utils';

const DOT: Record<TrafficLight, string> = { verde: 'bg-ok', amarillo: 'bg-warn', rojo: 'bg-bad' };

/** "−281 %" con signo menos tipográfico; sin decimales para la escala. */
function pct0(v: number): string {
  return `${v < 0 ? '−' : v > 0 ? '+' : ''}${formatNumber(Math.abs(v * 100))} %`;
}

/**
 * Escala horizontal del margen: zona negativa en coral tenue, línea punteada en 0 % y en el umbral de "Cierra",
 * marcador redondo en el valor actual y, si cambió (p. ej. de suelto a pellet), el trayecto "antes → ahora".
 * Los valores fuera de la escala se clavan en el borde con una flecha.
 */
export function MarginBar({ value, from, threshold, light }: { value: number; from: number | null; threshold: number; light: TrafficLight }) {
  const min = -0.5;
  const max = 0.6;
  const pos = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;
  const zero = pos(0);
  const thr = pos(threshold);
  const x = pos(value);
  const fx = from === null ? null : pos(from);
  const descId = useId();
  const desc = `Margen ${pct0(value)}${from !== null ? `, antes ${pct0(from)}` : ''}. Para cerrar hace falta ${pct0(threshold)}.`;
  return (
    <figure aria-describedby={descId} className="m-0">
      <p id={descId} className="sr-only">
        {desc}
      </p>
      <div aria-hidden="true" className="relative h-9">
        {/* pista */}
        <div className="absolute inset-x-0 top-3.5 h-2 overflow-hidden rounded-full bg-surface">
          <div className="absolute inset-y-0 left-0 bg-bad-bg" style={{ width: `${zero}%` }} />
          <div className="absolute inset-y-0 bg-ok-bg" style={{ left: `${thr}%`, right: 0 }} />
        </div>
        {/* 0 % y umbral */}
        <div className="absolute top-1.5 h-6 border-l border-dashed border-fg-subtle" style={{ left: `${zero}%` }} />
        <div className="absolute top-1.5 h-6 border-l border-dashed border-ok" style={{ left: `${thr}%` }} />
        {/* trayecto */}
        {fx !== null && Math.abs(fx - x) > 0.5 && (
          <div className="absolute top-[17px] h-0.5 bg-fg-muted" style={{ left: `${Math.min(fx, x)}%`, width: `${Math.abs(x - fx)}%` }} />
        )}
        {fx !== null && Math.abs(fx - x) > 0.5 && (
          <span className="absolute top-3 size-3 -translate-x-1/2 rounded-full border-2 border-fg-muted bg-surface" style={{ left: `${fx}%` }} />
        )}
        <span
          className={cn('absolute top-2 size-5 -translate-x-1/2 rounded-full ring-2 ring-canvas', DOT[light])}
          style={{ left: `${x}%` }}
        />
        {(value < min || value > max) && (
          <span className="absolute top-2.5 font-mono text-caption text-fg-muted" style={value < min ? { left: 0 } : { right: 0 }}>
            {value < min ? '◂' : '▸'}
          </span>
        )}
      </div>
      <div aria-hidden="true" className="relative mt-0.5 h-4 font-mono text-caption text-fg-subtle tabular-nums">
        <span className="absolute left-0">{pct0(min)}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${zero}%` }}>
          0 %
        </span>
        <span className="absolute -translate-x-1/2 text-ok" style={{ left: `${thr}%` }}>
          {pct0(threshold)}
        </span>
        <span className="absolute right-0">{pct0(max)}</span>
      </div>
      {from !== null && Math.abs(from - value) > 0.0005 && (
        <figcaption className="mt-1.5 font-mono text-caption text-fg-muted tabular-nums">
          {pct0(from)} → <span className="text-fg">{pct0(value)}</span>
        </figcaption>
      )}
    </figure>
  );
}

/** Distancia por ruta al comprador contra el radio viable (línea punteada). */
export function DistanceBar({ distanceKm, radiusKm }: { distanceKm: number; radiusKm: number }) {
  const max = Math.max(distanceKm, radiusKm) * 1.15 || 1;
  const d = (distanceKm / max) * 100;
  const r = (radiusKm / max) * 100;
  const inside = distanceKm <= radiusKm;
  return (
    <figure className="mx-0 mt-0">
      <figcaption className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="eyebrow whitespace-nowrap">Distancia vs. radio</span>
        <span className={cn('font-mono text-caption whitespace-nowrap tabular-nums', inside ? 'text-ok' : 'text-bad')}>
          {formatKm(distanceKm)} / {formatKm(radiusKm)}
        </span>
      </figcaption>
      <div aria-hidden="true" className="relative h-5">
        <div className="absolute inset-x-0 top-2 h-1.5 rounded-full bg-surface" />
        <div className={cn('absolute top-2 h-1.5 rounded-full', inside ? 'bg-ok' : 'bg-bad')} style={{ width: `${d}%` }} />
        <div className="absolute top-0 h-5 border-l border-dashed border-fg-muted" style={{ left: `${r}%` }} />
      </div>
      <p className="mt-1 text-caption text-fg-muted">
        {inside ? 'Dentro del radio: el flete no se come el precio.' : 'Fuera del radio: el flete se come el precio de venta.'}
      </p>
    </figure>
  );
}
