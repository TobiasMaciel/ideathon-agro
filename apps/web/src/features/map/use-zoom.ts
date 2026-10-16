import { useCallback, useSyncExternalStore } from 'react';
import type L from 'leaflet';

export /** Zoom actual del mapa (para medir distancias en pantalla); null hasta que el mapa existe. */
function useZoom(map: L.Map | null): number | null {
  const subscribe = useCallback(
    (cb: () => void) => {
      map?.on('zoomend', cb);
      return () => {
        map?.off('zoomend', cb);
      };
    },
    [map],
  );
  return useSyncExternalStore(subscribe, () => map?.getZoom() ?? null, () => null);
}
