// Medidas del único layout (escritorio): panel flotante a la derecha.
export const PANEL_W = 400;

/** Px del mapa tapados por el panel de la derecha (para encuadrar sin que quede nada debajo). */
export const MAP_INSETS = { top: 0, right: PANEL_W + 16, bottom: 0, left: 0 };

/** Zona libre del mapa para tarjetas flotantes: entre la leyenda (izquierda, 240 px) y el panel. */
export const MAP_FREE = { left: 264, right: PANEL_W + 16 };

export const TITLE = 'Mapa Circular NEA — ¿Cierra el negocio?';
