import type { TrafficLight } from '@mapa/core/contracts';

/** Color de texto de cada estado del semáforo (tokens ok/warn/bad). */
export const LIGHT_TONE: Record<TrafficLight, string> = { verde: 'text-ok', amarillo: 'text-warn', rojo: 'text-bad' };
