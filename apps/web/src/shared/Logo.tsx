/**
 * Marca de Sobra: una pila de residuo en píxeles de la que sale un píxel que sube y se enciende (lo que sobra gana
 * valor). Grilla de 9 × 9 sobre un cuadrado redondeado; copia en public/logo-mark.svg y favicon.svg.
 */
const CELLS: [x: number, y: number, opacity: number][] = [
  [7, 0, 1],
  [6, 1, 0.8],
  [5, 2, 0.6],
  [4, 4, 0.5],
  [3, 5, 0.6],
  [4, 5, 0.5],
  [5, 5, 0.6],
  [2, 6, 0.5],
  [3, 6, 0.6],
  [4, 6, 0.7],
  [5, 6, 0.6],
  [6, 6, 0.5],
  [1, 7, 0.4],
  [2, 7, 0.5],
  [3, 7, 0.6],
  [4, 7, 0.7],
  [5, 7, 0.6],
  [6, 7, 0.5],
  [7, 7, 0.4],
  [0, 8, 0.3],
  [1, 8, 0.4],
  [2, 8, 0.5],
  [3, 8, 0.6],
  [4, 8, 0.7],
  [5, 8, 0.6],
  [6, 8, 0.5],
  [7, 8, 0.4],
  [8, 8, 0.3],
];

const PITCH = 3.9;
const ORIGIN = 2.8;
const CELL = 3.2;

export default function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className={className}>
      <rect width={40} height={40} rx={6} fill="var(--color-selection-solid)" />
      {CELLS.map(([x, y, o]) => (
        <rect key={`${x}-${y}`} x={ORIGIN + x * PITCH} y={ORIGIN + y * PITCH} width={CELL} height={CELL} fill="var(--color-on-accent)" opacity={o} />
      ))}
    </svg>
  );
}
