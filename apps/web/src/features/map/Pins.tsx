// Pines de plantas y compradores (Leaflet divIcon con el HTML de markers.ts) y su etiqueta permanente.
import { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Buyer, Generator, TrafficLight } from '@mapa/core/contracts';
import { GENERATOR_KIND_LABELS, LIGHT_LABELS, MATERIAL_LABELS } from '@/shared/labels';
import { GENERATOR_KIND_ICON, SECTOR_ICON, buyerPinHtml, buyerPinSpec, generatorPinHtml, generatorPinSpec } from './markers';

/** Nombre accesible del pin: Leaflet lo vuelve role="button" y enfocable; le damos aria-label. */
function labelOnAdd(label: string) {
  return (e: L.LeafletEvent) => {
    (e.target as L.Marker).getElement()?.setAttribute('aria-label', label);
  };
}

/** Etiqueta permanente del pin elegido, arriba del pin. */
function PinLabel({ text }: { text: string }) {
  return (
    <Tooltip key={`label-top-${text}`} permanent direction="top" className="pin-label">
      {text}
    </Tooltip>
  );
}

/**
 * Pin elegido: `label` es su etiqueta permanente (string) o null si otra etiqueta combinada la reemplaza
 * (planta y comprador muy cerca: ver mergedLabelHost).
 */
export function GeneratorPin({ g, selected, label: pinned, onSelect }: { g: Generator; selected: boolean; label: string | null; onSelect: (id: string) => void }) {
  const published = g.origin === 'publicacion';
  const spec = generatorPinSpec(g.materialId, { selected, hot: false }, published);
  const icon = useMemo(() => {
    const { html, width, height } = generatorPinHtml(generatorPinSpec(g.materialId, { selected, hot: false }, published), GENERATOR_KIND_ICON[g.kind], `gen-${g.id}`);
    return L.divIcon({ className: 'pin', html, iconSize: [width, height], iconAnchor: [width / 2, height / 2], tooltipAnchor: [0, -height / 2 + 4] });
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
        <PinLabel text={pinned} />
      ) : (
        <Tooltip key="hover" direction="top">
          {label}
        </Tooltip>
      )}
    </Marker>
  );
}

export function BuyerPin({
  b,
  light,
  selected,
  label: pinned,
  hot,
  onSelect,
  onHover,
}: {
  b: Buyer;
  light: TrafficLight | undefined;
  selected: boolean;
  label: string | null;
  hot: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const published = b.origin === 'publicacion';
  const spec = buyerPinSpec(light, { selected, hot }, published);
  const icon = useMemo(() => {
    const { html, width: box } = buyerPinHtml(buyerPinSpec(light, { selected, hot }, published), SECTOR_ICON[b.sector], `buyer-${b.id}`, light ?? 'none');
    return L.divIcon({
      className: `pin${hot ? ' pin-hot' : ''}`,
      html,
      iconSize: [box, box],
      iconAnchor: [box / 2, box / 2],
      tooltipAnchor: [0, -box / 2 + 4],
    });
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
        <PinLabel text={pinned} />
      ) : (
        <Tooltip key="hover" direction="top">
          {label}
        </Tooltip>
      )}
    </Marker>
  );
}
