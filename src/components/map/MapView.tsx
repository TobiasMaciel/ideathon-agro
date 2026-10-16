'use client';

import { useEffect, useRef } from 'react';
import { Circle, CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapViewProps } from './types';
import {
  LIGHT_COLORS,
  LIGHT_LABELS,
  MATERIAL_COLORS,
  MATERIAL_LABELS,
  buyerStyle,
  generatorStyle,
} from './markers';
import type { MaterialId } from '@/data/types';

const CENTER: [number, number] = [-28.6, -57.6];
const MAX_RADIUS_KM = 1500;

/** Radio dibujable: finito, positivo y acotado; si no, null. */
function safeRadiusKm(radiusKm: number | null | undefined): number | null {
  if (radiusKm == null || !Number.isFinite(radiusKm) || radiusKm <= 0) return null;
  return Math.min(radiusKm, MAX_RADIUS_KM);
}

/** flyToBounds solo con bounds válidos (un círculo enorme o NaN rompe Leaflet). */
function safeFlyToBounds(map: L.Map, bounds: L.LatLngBounds) {
  if (!bounds.isValid()) return;
  try {
    map.flyToBounds(bounds, { duration: 0.8, padding: [20, 20] });
  } catch {
    /* la vista queda como estaba */
  }
}

/** Ajusta la vista al círculo solo cuando cambia el generador elegido (no el radio). */
function FlyToSelection({ lat, lng, radiusKm }: { lat: number | null; lng: number | null; radiusKm: number | null }) {
  const map = useMap();
  const radiusRef = useRef(radiusKm);
  useEffect(() => {
    radiusRef.current = radiusKm;
  });
  useEffect(() => {
    if (lat === null || lng === null) return;
    const r = radiusRef.current;
    if (r && r > 0) {
      safeFlyToBounds(map, L.latLng(lat, lng).toBounds(r * 2000));
    } else {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 9), { duration: 0.8 });
    }
  }, [map, lat, lng]);
  // Si el radio crece (p. ej. de suelto a pellet) y el círculo ya no entra en la vista, alejar para mostrarlo.
  useEffect(() => {
    if (lat === null || lng === null || !radiusKm || radiusKm <= 0) return;
    const circle = L.latLng(lat, lng).toBounds(radiusKm * 2000);
    if (!map.getBounds().contains(circle)) safeFlyToBounds(map, circle);
  }, [map, lat, lng, radiusKm]);
  return null;
}

function Legend() {
  return (
    <div className="pointer-events-none absolute right-2 top-2 z-[1000] max-w-[11rem] rounded-md bg-white/95 p-2 text-[11px] leading-tight text-slate-800 shadow">
      <p className="font-semibold">Generadores</p>
      {(Object.keys(MATERIAL_COLORS) as MaterialId[]).map((m) => (
        <p key={m} className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full border border-slate-900"
            style={{ background: MATERIAL_COLORS[m] }}
          />
          {MATERIAL_LABELS[m]}
        </p>
      ))}
      <p className="mt-1 font-semibold">Compradores</p>
      {(['verde', 'amarillo', 'rojo', 'sinEvaluar'] as const).map((l) => (
        <p key={l} className="flex items-center gap-1">
          <span
            className="inline-block h-2.5 w-2.5 border border-dashed border-slate-900"
            style={{ background: LIGHT_COLORS[l] }}
          />
          {LIGHT_LABELS[l]}
        </p>
      ))}
    </div>
  );
}

export default function MapView({
  generators,
  buyers,
  selectedGeneratorId,
  selectedBuyerId,
  radiusKm: rawRadiusKm,
  buyerLights,
  onSelectGenerator,
  onSelectBuyer,
}: MapViewProps) {
  const radiusKm = safeRadiusKm(rawRadiusKm);
  const selGen = generators.find((g) => g.id === selectedGeneratorId) ?? null;
  const selBuyer = buyers.find((b) => b.id === selectedBuyerId) ?? null;
  const genCenter: [number, number] | null = selGen ? [selGen.location.lat, selGen.location.lng] : null;

  return (
    <div data-testid="map" className="relative h-full w-full">
      <MapContainer center={CENTER} zoom={7} scrollWheelZoom className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {genCenter && radiusKm != null && (
          <Circle
            center={genCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#16a34a',
              weight: 2,
              dashArray: '8 6',
              fillColor: '#16a34a',
              fillOpacity: 0.06,
              className: 'radius-circle',
            }}
            interactive={false}
          />
        )}
        {genCenter && selBuyer && (
          <Polyline
            positions={[genCenter, [selBuyer.location.lat, selBuyer.location.lng]]}
            pathOptions={{ color: '#111827', weight: 2, dashArray: '4 6', className: 'route-line' }}
            interactive={false}
          />
        )}
        {buyers.map((b) => {
          const s = buyerStyle(buyerLights[b.id], b.id === selectedBuyerId, b.id);
          return (
            <CircleMarker
              key={b.id}
              center={[b.location.lat, b.location.lng]}
              radius={s.radius}
              pathOptions={s.pathOptions}
              eventHandlers={{ click: () => onSelectBuyer(b.id) }}
            >
              <Tooltip>
                {b.name} · {b.locality}
              </Tooltip>
            </CircleMarker>
          );
        })}
        {generators.map((g) => {
          const s = generatorStyle(g.materialId, g.id === selectedGeneratorId, g.id);
          return (
            <CircleMarker
              key={g.id}
              center={[g.location.lat, g.location.lng]}
              radius={s.radius}
              pathOptions={s.pathOptions}
              eventHandlers={{ click: () => onSelectGenerator(g.id) }}
            >
              <Tooltip>
                {g.name} · {g.locality}
              </Tooltip>
            </CircleMarker>
          );
        })}
        <FlyToSelection lat={genCenter?.[0] ?? null} lng={genCenter?.[1] ?? null} radiusKm={radiusKm} />
      </MapContainer>
      <Legend />
    </div>
  );
}
