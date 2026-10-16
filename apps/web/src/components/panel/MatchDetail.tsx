import { useState } from 'react';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import type { Alternative, Buyer } from '@mapa/core/data';
import { formatArs, formatKm, formatNumber, formatPct, formatTons } from '@mapa/core/format';
import type { TrafficLight, ViabilityResult } from '@mapa/core/viability';
import { cn } from '@/lib/utils';
import { PublishedMeta } from '../listing/ListingInfo';
import { DistanceBar, MarginBar } from './Charts';
import Light, { LIGHT_TEXT } from './Light';
import { SECTOR_SINGULAR } from './labels';
import { ars, minusArs } from './num';
import { nextTrack, type MarginTrack } from './trajectory';

interface Props {
  buyer: Buyer;
  alternative: Alternative | undefined;
  result: ViabilityResult;
}

const TONE: Record<TrafficLight, string> = { verde: 'text-ok', amarillo: 'text-warn', rojo: 'text-bad' };

function altName(alternative: Alternative | undefined): string {
  return alternative ? (alternative.id === 'glp' ? 'GLP' : 'la leña') : 'su combustible actual';
}

function pct(fraction: number): string {
  return formatPct(fraction).replace(/^-/, '−');
}

/** Margen antes del último cambio de estado con la misma planta y comprador (p. ej. de suelto a pellet); si no, null. */
function useStateTrajectory(key: string, state: string, value: number): number | null {
  const [track, setTrack] = useState<MarginTrack>({ key, state, value, from: null });
  const next = nextTrack(track, key, state, value);
  if (next !== track) setTrack(next);
  return next.from;
}

/** La respuesta: card con el comprador elegido, el estado arriba a la derecha y la escala del margen. */
export function Answer({
  buyer,
  alternative,
  result,
  threshold,
  contact,
  generatorId,
  state,
}: Props & { threshold: number; contact?: React.ReactNode; generatorId: string; state: string }) {
  const s = result.buyerSavingsPerMonth;
  const buyerPays = !result.buyerBenefits && result.sellerLight !== 'rojo';
  const from = useStateTrajectory(`${generatorId}|${buyer.id}`, state, result.marginPct);
  return (
    <div className="rounded-lg border border-line bg-surface-subtle p-3.5" data-testid="result-light" data-light={result.light}>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">Resultado</p>
        <p className={cn('flex items-center gap-1.5 font-mono text-caption font-medium tracking-wide uppercase tabular-nums', TONE[result.light])}>
          <Light light={result.light} size="xs" />
          {LIGHT_TEXT[result.light]}: margen {pct(result.marginPct)}
        </p>
      </div>
      <p className="mt-1 text-heading text-pretty text-fg">{buyer.name}</p>
      <p className="mt-0.5 font-mono text-caption text-fg-muted uppercase tabular-nums">
        {SECTOR_SINGULAR[buyer.sector]} · {buyer.locality ? `${buyer.locality} · ` : ''}
        {formatKm(result.distanceKm)} por ruta
      </p>
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Margen por mes</p>
          <p className={cn('font-mono text-title font-bold whitespace-nowrap tabular-nums sm:text-figure', result.marginPerMonth >= 0 ? 'text-fg' : 'text-bad')} data-testid="result-margin">
            {ars(result.marginPerMonth)}
          </p>
        </div>
        <p className="pb-1 text-right font-mono text-caption text-fg-subtle tabular-nums">
          {from !== null && Math.abs(from - result.marginPct) > 0.0005 ? (
            <>
              {pct(from)} → <span className="text-fg">{pct(result.marginPct)}</span>
            </>
          ) : (
            <span className="uppercase">Cierra desde {pct(threshold)}</span>
          )}
        </p>
      </div>
      {buyerPays && (
        <p className="mt-3 flex gap-1.5 border-t border-line pt-3 text-small font-medium text-bad" data-testid="buyer-pays-more">
          <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>
            Al vendedor le cierra, pero al comprador le sale {formatArs(-s)}/mes más caro que {altName(alternative)}
          </span>
        </p>
      )}
      {contact && <div className="mt-3 border-t border-line pt-2.5">{contact}</div>}
    </div>
  );
}

/** Pestaña "Detalle": distancia, desglose en tabla y qué gana el comprador. */
export default function MatchDetail({ buyer, alternative, result, radiusKm, threshold }: Props & { radiusKm: number; threshold: number }) {
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
          <p className={cn('flex items-center gap-1.5 font-mono text-caption font-medium uppercase tabular-nums', TONE[result.light])}>
            <Light light={result.light} size="xs" />
            {LIGHT_TEXT[result.light]}: margen {pct(result.marginPct)}
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
