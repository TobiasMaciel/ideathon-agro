'use client';

import dynamic from 'next/dynamic';
import type { MapViewProps } from './types';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div
      data-testid="map-loading"
      className="flex h-full w-full animate-pulse items-center justify-center bg-slate-100 text-sm text-slate-500"
    >
      Cargando mapa…
    </div>
  ),
});

export default function ClientMap(props: MapViewProps) {
  return <MapView {...props} />;
}
