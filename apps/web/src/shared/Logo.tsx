/**
 * Marca de Circular NEA: un ciclo de píxeles que se carga en sentido horario (el material que vuelve al mercado)
 * con el núcleo en el centro. Grilla de 9 × 9 sobre un cuadrado redondeado; copia en public/logo-mark.svg y favicon.svg.
 */
const CELLS: [x: number, y: number, opacity: number][] = [
  [6, 1, 0.3],
  [7, 1, 0.33],
  [7, 2, 0.36],
  [8, 3, 0.4],
  [8, 4, 0.43],
  [8, 5, 0.46],
  [7, 6, 0.49],
  [7, 7, 0.52],
  [6, 7, 0.55],
  [5, 8, 0.59],
  [4, 8, 0.62],
  [3, 8, 0.65],
  [2, 7, 0.68],
  [1, 7, 0.71],
  [1, 6, 0.75],
  [0, 5, 0.78],
  [0, 4, 0.81],
  [0, 3, 0.84],
  [1, 2, 0.87],
  [1, 1, 0.9],
  [2, 1, 0.94],
  [3, 0, 0.97],
  [4, 0, 1],
  [4, 3, 0.85],
  [3, 4, 0.85],
  [4, 4, 1],
  [5, 4, 0.85],
  [4, 5, 0.85],
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
