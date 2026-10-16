import type { TrafficLight } from '@/lib/viability/types';

export const LIGHT_TEXT: Record<TrafficLight, string> = { verde: 'Cierra', amarillo: 'Justo', rojo: 'No cierra' };
const COLORS: Record<TrafficLight, string> = {
  verde: 'bg-green-700 text-white',
  amarillo: 'bg-amber-400 text-stone-900',
  rojo: 'bg-red-700 text-white',
};
const ICONS: Record<TrafficLight, string> = { verde: '✓', amarillo: '!', rojo: '✕' };

/** Punto de semáforo; el significado también va en texto accesible. */
export default function Light({ light, size = 'sm' }: { light: TrafficLight; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-10 w-10 text-xl' : 'h-5 w-5 text-[11px]';
  return (
    <span
      role="img"
      aria-label={LIGHT_TEXT[light]}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${COLORS[light]} ${dim}`}
    >
      {ICONS[light]}
    </span>
  );
}
