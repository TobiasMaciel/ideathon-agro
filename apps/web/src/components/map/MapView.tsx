import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { AttributionControl, Circle, MapContainer, Marker, Polyline, ScaleControl, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Beef, ChevronDown, Citrus, Crosshair, Leaf, Warehouse, Zap, type LucideIcon } from 'lucide-react';
import type { Buyer, BuyerSector, Generator, MaterialId } from '@mapa/core/data';
import type { TrafficLight } from '@mapa/core/viability';
import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { MapViewProps } from './types';
import {
  GENERATOR_KIND_ICON,
  GENERATOR_KIND_LABELS,
  LIGHT_LABELS,
  MAP_COLORS,
  MATERIAL_COLORS,
  MATERIAL_LABELS,
  SECTOR_ICON,
  buyerPinHtml,
  buyerPinSpec,
  generatorPinHtml,
  generatorPinSpec,
  mergedLabelHost,
} from './markers';

const CENTER: [number, number] = [-28.6, -57.6];
const MAX_RADIUS_KM = 1500;
const FLY_SECONDS = 0.6;

/** Esri Canvas (sin API key): base plana + capa de nombres, en gris oscuro o gris claro según el tema. */
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
const TILES: Record<Theme, { base: string; labels: string }> = {
  dark: { base: `${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labels: `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
  light: { base: `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, labels: `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}` },
};

type Insets = MapViewProps['insets'];

/** Radio dibujable: finito, positivo y acotado; si no, null. */
function safeRadiusKm(radiusKm: number | null | undefined): number | null {
  if (radiusKm == null || !Number.isFinite(radiusKm) || radiusKm <= 0) return null;
  return Math.min(radiusKm, MAX_RADIUS_KM);
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function padding(i: Insets): L.FitBoundsOptions {
  return { paddingTopLeft: [i.left + 24, i.top + 24], paddingBottomRight: [i.right + 24, i.bottom + 24] };
}

/** Ajusta la vista a bounds válidos (un círculo enorme o NaN rompe Leaflet), descontando la UI flotante. */
function safeFitBounds(map: L.Map, bounds: L.LatLngBounds, insets: Insets) {
  if (!bounds.isValid()) return;
  try {
    if (reducedMotion()) map.fitBounds(bounds, { ...padding(insets), animate: false });
    else map.flyToBounds(bounds, { ...padding(insets), duration: FLY_SECONDS });
  } catch {
    /* la vista queda como estaba */
  }
}

/** Ajusta la vista al círculo cuando cambia la planta elegida, y aleja si el radio crece y ya no entra. */
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

/** Nombre accesible del pin: Leaflet lo vuelve role="button" y enfocable; le damos aria-label. */
function labelOnAdd(label: string) {
  return (e: L.LeafletEvent) => {
    (e.target as L.Marker).getElement()?.setAttribute('aria-label', label);
  };
}

/** Zoom actual del mapa (para medir distancias en pantalla); null hasta que el mapa existe. */
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

type LabelDir = 'top' | 'bottom';

/**
 * Etiqueta permanente del pin elegido. Arriba en desktop; abajo en mobile, donde arriba están los KPIs y la atribución.
 * Abajo hay que correrla el alto del pin (el ancla de Leaflet está en su borde superior).
 */
function PinLabel({ text, dir, box }: { text: string; dir: LabelDir; box: number }) {
  return (
    <Tooltip key={`label-${dir}-${text}`} permanent direction={dir} offset={dir === 'bottom' ? [0, box - 8] : [0, 0]} className="pin-label">
      {text}
    </Tooltip>
  );
}

/**
 * Pin elegido: `label` es su etiqueta permanente (string) o null si otra etiqueta combinada la reemplaza
 * (planta y comprador muy cerca: ver mergedLabelHost).
 */
function GeneratorPin({ g, selected, label: pinned, labelDir, onSelect }: { g: Generator; selected: boolean; label: string | null; labelDir: LabelDir; onSelect: (id: string) => void }) {
  const published = g.origin === 'publicacion';
  const spec = generatorPinSpec(g.materialId, { selected, hot: false }, published);
  const { icon, box } = useMemo(() => {
    const { html, width, height } = generatorPinHtml(generatorPinSpec(g.materialId, { selected, hot: false }, published), GENERATOR_KIND_ICON[g.kind], `gen-${g.id}`);
    return {
      icon: L.divIcon({ className: 'pin', html, iconSize: [width, height], iconAnchor: [width / 2, height / 2], tooltipAnchor: [0, -height / 2 + 4] }),
      box: height,
    };
  }, [g.id, g.kind, g.materialId, selected, published]);
  const place = g.locality ? ` · ${g.locality}` : '';
  const label = `${g.name}${place} — ${GENERATOR_KIND_LABELS[g.kind]}, ${MATERIAL_LABELS[g.materialId].toLowerCase()}${published ? ' (publicación sin verificar)' : ''}`;
  return (
    <Marker
      position={[g.location.lat, g.location.lng]}
      icon={icon}
      zIndexOffset={spec.zIndexOffset}
      eventHandlers={{ click: () => onSelect(g.id), add: labelOnAdd(label) }}
    >
      {selected && pinned !== null ? (
        <PinLabel text={pinned} dir={labelDir} box={box} />
      ) : (
        <Tooltip key="hover" direction="top">
          {label}
        </Tooltip>
      )}
    </Marker>
  );
}

function BuyerPin({
  b,
  light,
  selected,
  label: pinned,
  labelDir,
  hot,
  onSelect,
  onHover,
}: {
  b: Buyer;
  light: TrafficLight | undefined;
  selected: boolean;
  label: string | null;
  labelDir: LabelDir;
  hot: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const published = b.origin === 'publicacion';
  const spec = buyerPinSpec(light, { selected, hot }, published);
  const { icon, box } = useMemo(() => {
    const { html, width: box } = buyerPinHtml(buyerPinSpec(light, { selected, hot }, published), SECTOR_ICON[b.sector], `buyer-${b.id}`, light ?? 'none');
    const icon = L.divIcon({
      className: `pin${hot ? ' pin-hot' : ''}`,
      html,
      iconSize: [box, box],
      iconAnchor: [box / 2, box / 2],
      tooltipAnchor: [0, -box / 2 + 4],
    });
    return { icon, box };
  }, [b.id, b.sector, light, selected, hot, published]);
  const status = LIGHT_LABELS[light ?? 'sinEvaluar'];
  const place = b.locality ? ` · ${b.locality}` : '';
  const label = `${b.name}${place} — ${status}${published ? ' (publicación sin verificar)' : ''}`;
  return (
    <Marker
      position={[b.location.lat, b.location.lng]}
      icon={icon}
      zIndexOffset={spec.zIndexOffset}
      eventHandlers={{
        click: () => onSelect(b.id),
        mouseover: () => onHover(b.id),
        mouseout: () => onHover(null),
        add: labelOnAdd(label),
      }}
    >
      {selected && pinned !== null ? (
        <PinLabel text={pinned} dir={labelDir} box={box} />
      ) : (
        <Tooltip key="hover" direction="top">
          {label}
        </Tooltip>
      )}
    </Marker>
  );
}

/* ---------- Publicar: marcar en el mapa ---------- */

/** En modo marcado, el click en el mapa devuelve la coordenada; el contenedor lleva la clase `picking` (cursor en cruz). */
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

/** Encuadra los puntos pedidos, una vez por `key` (p. ej. planta + comprador recién publicado). */
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

const DRAFT_ICON = L.divIcon({
  className: 'pin',
  html: `<div class="pin-body" data-testid="draft-pin" style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px"><span style="width:18px;height:18px;border-radius:9999px;background:${MAP_COLORS.selection};box-shadow:0 0 0 2px ${MAP_COLORS.ink}, 0 0 0 4px ${MAP_COLORS.selection}, 0 1px 6px ${MAP_COLORS.shadow}"></span><span style="position:absolute;width:6px;height:6px;border-radius:9999px;background:${MAP_COLORS.ink}"></span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Banner del modo marcado: instrucción (o error), "Usar el centro" (para teclado) y "Cancelar". Esc también cancela. */
function PickBanner({
  map,
  message,
  onPick,
  onCancel,
}: {
  map: L.Map | null;
  message: string | null;
  onPick?: (ll: { lat: number; lng: number }) => void;
  onCancel?: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[1050] flex justify-center">
      <div
        data-testid="pick-banner"
        className="pointer-events-auto flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-selection bg-surface/95 py-2 pr-2 pl-3.5 shadow-overlay backdrop-blur-md"
      >
        <Crosshair size={16} aria-hidden="true" className="shrink-0 text-selection" />
        <p role="status" className={cn('min-w-0 flex-1 text-small font-medium text-pretty', message ? 'text-warn' : 'text-fg')}>
          {message ?? 'Tocá el mapa para ubicar tu establecimiento'}
        </p>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const c = map?.getCenter();
              if (c) onPick?.({ lat: c.lat, lng: c.lng });
            }}
            className="h-8 px-2.5 text-small text-fg-muted"
          >
            Usar el centro
          </Button>
          <Button ref={cancelRef} type="button" variant="outline" data-testid="pick-cancel" onClick={onCancel} className="h-8 px-3 text-small">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Leyenda: los mismos pines (mismo HTML), en tamaño normal ---------- */

function PinSample({ html }: { html: string }) {
  // HTML propio y estático (markers.ts escapa los atributos).
  return <span aria-hidden="true" className="flex w-6 shrink-0 justify-center" dangerouslySetInnerHTML={{ __html: html }} />;
}

const idle = { selected: false, hot: false };
const SECTOR_LUCIDE: Record<BuyerSector, LucideIcon> = { central_biomasa: Zap, yerbatera: Leaf, citricola: Citrus, secadero_granos: Warehouse, frigorifico: Beef };
const SECTOR_LEGEND: [BuyerSector, string][] = [
  ['central_biomasa', 'Central de biomasa'],
  ['yerbatera', 'Yerbatera'],
  ['citricola', 'Citrícola'],
  ['secadero_granos', 'Secadero de granos'],
  ['frigorifico', 'Frigorífico'],
];

function Legend({ wide }: { wide: boolean }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <div className={cn('absolute z-[1000] flex flex-col gap-1.5', wide ? 'bottom-16 left-3 items-start' : 'top-[11.25rem] left-3 items-start')}>
      {!wide && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-8 items-center gap-1 rounded-full bg-surface px-3 text-caption font-medium text-fg shadow-overlay transition-colors duration-120 ease-out hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection"
        >
          Referencias
          <ChevronDown size={14} aria-hidden="true" className={cn('text-fg-subtle motion-safe:transition-transform motion-safe:duration-150', open && 'rotate-180')} />
        </button>
      )}
      <div
        id={contentId}
        className={cn(
          wide || open ? 'block' : 'hidden',
          'w-60 space-y-3 rounded-xl border border-border bg-surface/95 p-3 text-caption text-fg-muted shadow-overlay backdrop-blur-sm',
        )}
      >
        <div>
          <p className="mb-1.5 text-overline text-fg-muted uppercase">Plantas</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <PinSample html={generatorPinHtml({ ...generatorPinSpec('aserrin', idle), fill: MAP_COLORS.neutral }, 'tree-pine', 'legend').html} />
              Aserradero o foresto-industria
            </li>
            <li className="flex items-center gap-2">
              <PinSample html={generatorPinHtml({ ...generatorPinSpec('aserrin', idle), fill: MAP_COLORS.neutral }, 'wheat', 'legend').html} />
              Molino arrocero
            </li>
          </ul>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
            {(Object.keys(MATERIAL_COLORS) as MaterialId[]).map((m) => (
              <li key={m} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: MATERIAL_COLORS[m] }} />
                {MATERIAL_LABELS[m]}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-overline text-fg-muted uppercase">Compradores</p>
          <ul className="space-y-1">
            {(['verde', 'amarillo', 'rojo', undefined] as const).map((l) => (
              <li key={l ?? 'none'} className="flex items-center gap-2">
                <PinSample html={buyerPinHtml(buyerPinSpec(l, idle), 'warehouse', 'legend', l ?? 'none').html} />
                {LIGHT_LABELS[l ?? 'sinEvaluar']}
              </li>
            ))}
          </ul>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
            {SECTOR_LEGEND.map(([sector, label]) => {
              const Icon = SECTOR_LUCIDE[sector];
              return (
                <li key={sector} className="flex items-center gap-1.5">
                  <Icon size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-fg" />
                  {label}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-overline text-fg-muted uppercase">Publicaciones</p>
          <p className="flex items-center gap-2">
            <PinSample html={generatorPinHtml({ ...generatorPinSpec('aserrin', idle, true), fill: MAP_COLORS.neutral }, 'tree-pine', 'legend').html} />
            Contorno punteado: publicada por un usuario, sin verificar
          </p>
        </div>
      </div>
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
  hotBuyerId,
  onHoverBuyer,
  insets,
  wide,
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
  const labelDir: LabelDir = wide ? 'top' : 'bottom';
  const buyerStatus = selBuyer ? LIGHT_LABELS[buyerLights[selBuyer.id] ?? 'sinEvaluar'] : '';
  const host =
    map && zoom !== null && selGen && selBuyer
      ? mergedLabelHost(map.project([selGen.location.lat, selGen.location.lng], zoom), map.project([selBuyer.location.lat, selBuyer.location.lng], zoom), labelDir)
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
        <AttributionControl key={wide ? 'bl' : 'tr'} position={wide ? 'bottomleft' : 'topright'} prefix='<a href="https://leafletjs.com">Leaflet</a>' />
        {wide && <ZoomControl position="topleft" />}
        <ScaleControl position={wide ? 'bottomleft' : 'topright'} metric imperial={false} />
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
            labelDir={labelDir}
            hot={b.id === hotBuyerId}
            onSelect={onSelectBuyer}
            onHover={onHoverBuyer}
          />
        ))}
        {generators.map((g) => (
          <GeneratorPin key={g.id} g={g} selected={g.id === selectedGeneratorId} label={g.id === selectedGeneratorId ? genLabel : null} labelDir={labelDir} onSelect={onSelectGenerator} />
        ))}
        {draftPin && <Marker position={[draftPin.lat, draftPin.lng]} icon={DRAFT_ICON} interactive={false} keyboard={false} zIndexOffset={3000} />}
        <FlyToSelection lat={genCenter?.[0] ?? null} lng={genCenter?.[1] ?? null} radiusKm={radiusKm} insets={insets} />
        <FocusPoints focus={focus} insets={insets} />
        <PickLayer picking={picking} onPick={onPick} />
      </MapContainer>
      {picking && <PickBanner map={map} message={pickMessage} onPick={onPick} onCancel={onCancelPick} />}
      {!picking && <Legend wide={wide} />}
    </div>
  );
}
