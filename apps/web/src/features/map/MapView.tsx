import { useState } from 'react';
import { AttributionControl, Circle, MapContainer, Marker, Polyline, ScaleControl, TileLayer, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme, type Theme } from '@/features/theme';
import { LIGHT_LABELS } from '@/shared/labels';
import Legend from './Legend';
import { FlyToSelection, FocusPoints, PickLayer } from './MapEffects';
import PickBanner from './PickBanner';
import { BuyerPin, GeneratorPin } from './Pins';
import { MAP_COLORS, mergedLabelHost } from './markers';
import type { MapViewProps } from './types';
import { useZoom } from './use-zoom';

const CENTER: [number, number] = [-28.6, -57.6];
const MAX_RADIUS_KM = 1500;

/** Esri Canvas (sin API key): base plana + capa de nombres, en gris oscuro o gris claro según el tema. */
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
const TILES: Record<Theme, { base: string; labels: string }> = {
  dark: { base: `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labels: `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
  light: { base: `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labels: `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
};

/** Radio dibujable: finito, positivo y acotado; si no, null. */
function safeRadiusKm(radiusKm: number | null | undefined): number | null {
  if (radiusKm == null || !Number.isFinite(radiusKm) || radiusKm <= 0) return null;
  return Math.min(radiusKm, MAX_RADIUS_KM);
}

const DRAFT_ICON = L.divIcon({
  className: 'pin',
  html: `<div class="pin-body" data-testid="draft-pin" style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px"><span style="width:18px;height:18px;border-radius:9999px;background:${MAP_COLORS.selection};box-shadow:0 0 0 2px ${MAP_COLORS.ink}, 0 0 0 4px ${MAP_COLORS.selection}, 0 1px 6px ${MAP_COLORS.shadow}"></span><span style="position:absolute;width:6px;height:6px;border-radius:9999px;background:${MAP_COLORS.ink}"></span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function MapView({
  generators,
  buyers,
  selectedGeneratorId,
  selectedBuyerId,
  radiusKm: rawRadiusKm,
  buyerLights,
  onSelectGenerator,
  onSelectBuyer,
  hotBuyerId,
  onHoverBuyer,
  insets,
  picking = false,
  onPick,
  onCancelPick,
  pickMessage = null,
  draftPin = null,
  focus = null,
}: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const radiusKm = safeRadiusKm(rawRadiusKm);
  const selGen = generators.find((g) => g.id === selectedGeneratorId) ?? null;
  const selBuyer = buyers.find((b) => b.id === selectedBuyerId) ?? null;
  const genCenter: [number, number] | null = selGen ? [selGen.location.lat, selGen.location.lng] : null;
  const theme = useTheme();
  const tiles = TILES[theme];

  // Etiquetas permanentes: si la planta y el comprador elegidos se pisan en pantalla, una sola "Planta → Comprador".
  const zoom = useZoom(map);
  const buyerStatus = selBuyer ? LIGHT_LABELS[buyerLights[selBuyer.id] ?? 'sinEvaluar'] : '';
  const host =
    map && zoom !== null && selGen && selBuyer
      ? mergedLabelHost(map.project([selGen.location.lat, selGen.location.lng], zoom), map.project([selBuyer.location.lat, selBuyer.location.lng], zoom))
      : null;
  const combined = selGen && selBuyer ? `${selGen.name} → ${selBuyer.name} · ${buyerStatus}` : '';
  const genLabel = host === null ? (selGen?.name ?? null) : host === 'gen' ? combined : null;
  const buyerLabel = host === null ? (selBuyer ? `${selBuyer.name} · ${buyerStatus}` : null) : host === 'buyer' ? combined : null;

  return (
    <div data-testid="map" className="relative h-full w-full">
      <MapContainer ref={setMap} center={CENTER} zoom={7} scrollWheelZoom zoomControl={false} attributionControl={false} className="h-full w-full">
        {/* Base plana (Esri World Dark/Light Gray Canvas, sin API key) + capa de nombres encima. Cambiar `url`
            hace setUrl en la capa: cambia los tiles sin rehacer el mapa ni perder la vista.
            Alternativas: CARTO (hoy pide API key) o Esri World Imagery (satelital, descartado). */}
        <TileLayer
          url={tiles.base}
          maxZoom={16}
          className="tiles-base"
          attribution="© Esri, HERE, Garmin, © OpenStreetMap contributors"
        />
        <TileLayer
          url={tiles.labels}
          maxZoom={16}
          className="tiles-labels"
        />
        <AttributionControl position="bottomleft" prefix='<a href="https://leafletjs.com">Leaflet</a>' />
        <ZoomControl position="topleft" />
        <ScaleControl position="bottomleft" metric imperial={false} />
        {genCenter && radiusKm != null && (
          <Circle
            center={genCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: MAP_COLORS.selection,
              opacity: 0.8,
              weight: 1.5,
              dashArray: '6 6',
              fillColor: MAP_COLORS.selection,
              fillOpacity: 0.07,
              className: 'radius-circle',
            }}
            interactive={false}
          />
        )}
        {genCenter && selBuyer && (
          <Polyline
            positions={[genCenter, [selBuyer.location.lat, selBuyer.location.lng]]}
            pathOptions={{ color: MAP_COLORS.selection, weight: 2, opacity: 0.8, lineCap: 'round', className: 'route-line' }}
            interactive={false}
          />
        )}
        {buyers.map((b) => (
          <BuyerPin
            key={b.id}
            b={b}
            light={buyerLights[b.id]}
            selected={b.id === selectedBuyerId}
            label={b.id === selectedBuyerId ? buyerLabel : null}
            hot={b.id === hotBuyerId}
            onSelect={onSelectBuyer}
            onHover={onHoverBuyer}
          />
        ))}
        {generators.map((g) => (
          <GeneratorPin key={g.id} g={g} selected={g.id === selectedGeneratorId} label={g.id === selectedGeneratorId ? genLabel : null} onSelect={onSelectGenerator} />
        ))}
        {draftPin && <Marker position={[draftPin.lat, draftPin.lng]} icon={DRAFT_ICON} interactive={false} keyboard={false} zIndexOffset={3000} />}
        <FlyToSelection lat={genCenter?.[0] ?? null} lng={genCenter?.[1] ?? null} radiusKm={radiusKm} insets={insets} />
        <FocusPoints focus={focus} insets={insets} />
        <PickLayer picking={picking} onPick={onPick} />
      </MapContainer>
      {picking && <PickBanner map={map} message={pickMessage} onPick={onPick} onCancel={onCancelPick} />}
      {!picking && <Legend />}
    </div>
  );
}
