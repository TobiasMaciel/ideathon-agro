import { Check, X } from 'lucide-react';
import type { TrafficLight } from '@mapa/core/viability';
import { cn } from '@/lib/utils';

export const LIGHT_TEXT: Record<TrafficLight, string> = { verde: 'Cierra', amarillo: 'Justo', rojo: 'No cierra' };
const BG: Record<TrafficLight, string> = { verde: 'bg-ok', amarillo: 'bg-warn', rojo: 'bg-bad' };
const SIZES = {
  xs: { box: 'size-3.5', icon: 9, stroke: 3.5 },
  sm: { box: 'size-5', icon: 12, stroke: 3 },
  md: { box: 'size-7', icon: 16, stroke: 3 },
} as const;

/** Signo de exclamación suelto (el de lucide viene dentro de un círculo). */
function Bang({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v9" />
      <path d="M12 19v.01" />
    </svg>
  );
}

/** Disco de semáforo: color + ícono; el significado también va en texto accesible. */
export default function Light({ light, size = 'sm', className }: { light: TrafficLight; size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  const icon = { size: s.icon, strokeWidth: s.stroke, 'aria-hidden': true } as const;
  return (
    <span role="img" aria-label={LIGHT_TEXT[light]} className={cn('inline-flex shrink-0 items-center justify-center rounded-full text-on-accent', BG[light], s.box, className)}>
      {light === 'verde' ? <Check {...icon} /> : light === 'rojo' ? <X {...icon} /> : <Bang size={s.icon} strokeWidth={s.stroke} />}
    </span>
  );
}
