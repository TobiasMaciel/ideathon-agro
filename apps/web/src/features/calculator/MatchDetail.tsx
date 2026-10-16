import { CircleCheck, TriangleAlert } from 'lucide-react';
import { PublishedMeta } from '@/features/contact';
import { cn } from '@/lib/utils';
import { ars, formatArs, formatNumber, formatTons, minusArs, pct } from '@/shared/format';
import { LIGHT_LABELS, SECTOR_SINGULAR } from '@/shared/labels';
import Light from '@/shared/Light';
import { LIGHT_TONE } from '@/shared/tone';
import { DistanceBar, MarginBar } from './Charts';
import { altName, type MatchProps } from './match-text';

/** Pestaña "Detalle": distancia, desglose en tabla y qué gana el comprador. */
export default function MatchDetail({ buyer, alternative, result, radiusKm, threshold }: MatchProps & { radiusKm: number; threshold: number }) {
  const s = result.buyerSavingsPerMonth;
  const name = altName(alternative);
  const rows: [string, string, boolean?][] = [
    ['Vendés', `${formatTons(result.productTonsPerMonth)}/mes`],
    ['Carga por camión', formatTons(result.truckLoadTons)],
    ['Viajes por mes', formatNumber(result.tripsPerMonth)],
    ['Ingreso', ars(result.revenuePerMonth)],
    ['Flete ida y vuelta', minusArs(result.freightPerMonth)],
    ['Acondicionamiento', minusArs(result.conditioningPerMonth)],
  ];
  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow">Negocio con</p>
          <p className={cn('flex items-center gap-1.5 font-mono text-caption font-medium uppercase tabular-nums', LIGHT_TONE[result.light])}>
            <Light light={result.light} size="xs" />
            {LIGHT_LABELS[result.light]}: margen {pct(result.marginPct)}
          </p>
        </div>
        <h2 className="mt-1 text-title text-pretty text-fg">{buyer.name}</h2>
        <p className="mt-0.5 font-mono text-caption text-fg-muted uppercase tabular-nums">
          {SECTOR_SINGULAR[buyer.sector]} · {buyer.locality ? `${buyer.locality} · ` : ''}usa {altName(alternative)}
        </p>
        {buyer.origin === 'publicacion' && <PublishedMeta entity={buyer} className="mt-1.5" />}
      </header>
      <div>
        <MarginBar value={result.marginPct} from={null} threshold={threshold} light={result.light} />
      </div>
      <DistanceBar distanceKm={result.distanceKm} radiusKm={radiusKm} />
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">Desglose mensual del negocio</caption>
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="eyebrow pb-1.5 text-left font-medium">
              Concepto
            </th>
            <th scope="col" className="eyebrow pb-1.5 text-right font-medium">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-divider">
              <th scope="row" className="py-1.5 text-left font-normal text-fg-muted">
                {label}
              </th>
              <td className="py-1.5 text-right font-mono text-fg tabular-nums">{value}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="pt-2 text-left font-semibold text-fg">
              Margen
            </th>
            <td className={cn('pt-2 text-right font-mono font-semibold tabular-nums', result.marginPerMonth >= 0 ? 'text-ok' : 'text-bad')}>
              {ars(result.marginPerMonth)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div>
        <p className="eyebrow mb-1.5">Para el comprador</p>
        <p
          data-testid="buyer-savings"
          className={cn('flex gap-1.5 rounded-md border px-3 py-2 text-small font-medium', s >= 0 ? 'border-ok-line bg-ok-bg text-ok' : 'border-bad-line bg-bad-bg text-bad')}
        >
          {s >= 0 ? <CircleCheck size={16} aria-hidden="true" className="mt-px shrink-0" /> : <TriangleAlert size={16} aria-hidden="true" className="mt-px shrink-0" />}
          <span>{s >= 0 ? `Le ahorra ${formatArs(s)}/mes frente a ${name}` : `Le cuesta ${formatArs(-s)}/mes más que ${name}`}</span>
        </p>
      </div>
      <p className="text-caption text-fg-subtle">Calculado con los valores de Fuentes y Supuestos.</p>
    </div>
  );
}
