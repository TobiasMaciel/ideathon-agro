import { formatKm } from '@/shared/format';

interface Props {
  roadKm: number;
  mapKm: number;
}

/** Hasta dónde llega el negocio. El círculo punteado del mapa es este radio en línea recta. */
export default function RadiusSummary({ roadKm, mapKm }: Props) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="eyebrow flex items-center gap-1.5 whitespace-nowrap">
        <span aria-hidden="true" className="inline-block size-2.5 rounded-full border-[1.5px] border-dashed border-selection" />
        Radio viable
      </p>
      <p className="text-right font-mono text-small text-fg-muted tabular-nums">
        <strong data-testid="radius-road-km" className="font-semibold text-fg">
          {formatKm(roadKm)}
        </strong>{' '}
        por ruta
        <span className="block text-caption text-fg-subtle">{formatKm(mapKm)} en línea recta</span>
      </p>
    </div>
  );
}
