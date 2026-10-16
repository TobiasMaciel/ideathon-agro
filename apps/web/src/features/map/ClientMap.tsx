import { lazy, Suspense } from 'react';
import type { MapViewProps } from './types';

const MapView = lazy(() => import('./MapView'));

export default function ClientMap(props: MapViewProps) {
  return (
    <Suspense
      fallback={
        <div
          data-testid="map-loading"
          className="flex h-full w-full items-center justify-center bg-surface-subtle text-small text-fg-subtle motion-safe:animate-pulse"
        >
          Cargando mapa…
        </div>
      }
    >
      <MapView {...props} />
    </Suspense>
  );
}
