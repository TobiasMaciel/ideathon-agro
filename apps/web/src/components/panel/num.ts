import { formatArs } from '@mapa/core/format';

/** Pesos con signo menos tipográfico (U+2212) para negativos: "−$ 5.000". */
export function ars(n: number): string {
  return formatArs(n).replace(/^-/, '−');
}

/** Resta de un monto positivo: "−$ 5.000". */
export function minusArs(n: number): string {
  return `−${formatArs(n)}`;
}
