// Medidas del único layout (escritorio): panel flotante a la derecha.
// El ancho del panel es fluido (variable --panel-w en index.css); estas expresiones CSS lo siguen.

/** Borde derecho de lo que flota sobre el mapa sin meterse debajo del panel. */
export const RIGHT_OF_PANEL = 'calc(var(--panel-w) + 1rem)';

/** Zona libre del mapa para tarjetas flotantes: entre la leyenda (izquierda, 15 rem) y el panel. */
export const MAP_FREE = { left: '16.5rem', right: RIGHT_OF_PANEL };

/** Px del mapa tapados por el panel de la derecha (para encuadrar sin que quede nada debajo). */
export function mapInsets(panelWidth: number) {
  return { top: 0, right: panelWidth + 16, bottom: 0, left: 0 };
}

export const TITLE = 'Sobra — ¿Cierra el negocio?';
