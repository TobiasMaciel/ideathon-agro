// Comportamientos del mapa sin UI propia: encuadre, foco y modo "marcar en el mapa".
import { useEffect, useRef } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FLY_SECONDS, reducedMotion, safeFitBounds, type Insets } from './fit';
import type { MapViewProps } from './types';

export /** Ajusta la vista al círculo cuando cambia la planta elegida, y aleja si el radio crece y ya no entra. */
function FlyToSelection({ lat, lng, radiusKm, insets }: { lat: number | null; lng: number | null; radiusKm: number | null; insets: Insets }) {
  const map = useMap();
  const latest = useRef({ radiusKm, insets });
  useEffect(() => {
    latest.current = { radiusKm, insets };
  });
  useEffect(() => {
    if (lat === null || lng === null) return;
    const { radiusKm: r, insets: i } = latest.current;
    if (r && r > 0) {
      safeFitBounds(map, L.latLng(lat, lng).toBounds(r * 2000), i);
    } else {
      const zoom = Math.max(map.getZoom(), 9);
      if (reducedMotion()) map.setView([lat, lng], zoom, { animate: false });
      else map.flyTo([lat, lng], zoom, { duration: FLY_SECONDS });
    }
  }, [map, lat, lng]);
  useEffect(() => {
    if (lat === null || lng === null || !radiusKm || radiusKm <= 0) return;
    const circle = L.latLng(lat, lng).toBounds(radiusKm * 2000);
    if (!map.getBounds().contains(circle)) safeFitBounds(map, circle, latest.current.insets);
  }, [map, lat, lng, radiusKm]);
  return null;
}

export /** En modo marcado, el click en el mapa devuelve la coordenada; el contenedor lleva la clase `picking` (cursor en cruz). */
function PickLayer({ picking, onPick }: { picking: boolean; onPick?: (ll: { lat: number; lng: number }) => void }) {
  const map = useMapEvents({
    click: (e) => {
      if (picking) onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  useEffect(() => {
    const el = map.getContainer();
    el.classList.toggle('picking', picking);
    return () => el.classList.remove('picking');
  }, [map, picking]);
  return null;
}

export /** Encuadra los puntos pedidos, una vez por `key` (p. ej. planta + comprador recién publicado). */
function FocusPoints({ focus, insets }: { focus: MapViewProps['focus']; insets: Insets }) {
  const map = useMap();
  const latest = useRef({ focus, insets });
  useEffect(() => {
    latest.current = { focus, insets };
  });
  const key = focus?.key;
  useEffect(() => {
    const pts = latest.current.focus?.points;
    if (key === undefined || !pts || pts.length === 0) return;
    if (pts.length === 1) {
      const zoom = Math.max(map.getZoom(), 9);
      if (reducedMotion()) map.setView(pts[0], zoom, { animate: false });
      else map.flyTo(pts[0], zoom, { duration: FLY_SECONDS });
      return;
    }
    safeFitBounds(map, L.latLngBounds(pts).pad(0.15), latest.current.insets);
  }, [map, key]);
  return null;
}
