import { formatKm } from '@/lib/format';

interface Props {
  roadKm: number;
  mapKm: number;
}

export default function RadiusSummary({ roadKm, mapKm }: Props) {
  return (
    <div>
      <p className="text-sm text-stone-900">
        Hasta <strong data-testid="radius-road-km">{formatKm(roadKm)}</strong> por ruta con camión lleno ({formatKm(mapKm)} en línea recta)
      </p>
      <p className="mt-1 text-xs text-stone-700">
        Más allá de ese radio el flete se come el precio de venta y el negocio deja de cerrar.
      </p>
    </div>
  );
}
