// Formato es-AR para la UI.
const LOCALE = 'es-AR';

export function formatNumber(n: number, maxDecimals = 0): string {
  return n.toLocaleString(LOCALE, { maximumFractionDigits: maxDecimals, useGrouping: 'always' });
}

/** ARS sin decimales: "$ 1.234.567"; negativos "-$ 5.000". */
export function formatArs(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}$ ${formatNumber(Math.abs(rounded))}`;
}

export function formatTons(n: number): string {
  return `${formatNumber(n, 1)} t`;
}

export function formatKm(n: number): string {
  return `${formatNumber(n)} km`;
}

/** Recibe una fracción (0,153) y devuelve "15,3 %". */
export function formatPct(fraction: number): string {
  return `${formatNumber(fraction * 100, 1)} %`;
}
