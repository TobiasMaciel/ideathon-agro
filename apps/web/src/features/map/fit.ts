// Encuadre del mapa (Leaflet puro, sin React): respeta prefers-reduced-motion y la UI que tapa el mapa.
import L from 'leaflet';
import type { MapViewProps } from './types';

export const FLY_SECONDS = 0.6;

export type Insets = MapViewProps['insets'];

export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function padding(i: Insets): L.FitBoundsOptions {
  return { paddingTopLeft: [i.left + 24, i.top + 24], paddingBottomRight: [i.right + 24, i.bottom + 24] };
}

/** Ajusta la vista a bounds válidos (un círculo enorme o NaN rompe Leaflet), descontando la UI flotante. */
export function safeFitBounds(map: L.Map, bounds: L.LatLngBounds, insets: Insets) {
  if (!bounds.isValid()) return;
  try {
    if (reducedMotion()) map.fitBounds(bounds, { ...padding(insets), animate: false });
    else map.flyToBounds(bounds, { ...padding(insets), duration: FLY_SECONDS });
  } catch {
    /* la vista queda como estaba */
  }
}
