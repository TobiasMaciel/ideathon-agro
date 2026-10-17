import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ars, formatArs, formatKm, pct } from '@/shared/format';
import { LIGHT_LABELS, SECTOR_SINGULAR } from '@/shared/labels';
import Light from '@/shared/Light';
import { LIGHT_TONE } from '@/shared/tone';
import { altName, type MatchProps } from './match-text';
import { nextTrack, type MarginTrack } from './trajectory';

/** Margen antes del último cambio de estado con la misma planta y comprador (p. ej. de suelto a pellet); si no, null. */
function useStateTrajectory(key: string, state: string, value: number): number | null {
  const [track, setTrack] = useState<MarginTrack>({ key, state, value, from: null });
  const next = nextTrack(track, key, state, value);
  if (next !== track) setTrack(next);
  return next.from;
}

/** La respuesta: card con el comprador elegido, el estado arriba a la derecha y la escala del margen. */
export default function Answer({
  buyer,
  alternative,
  result,
  threshold,
  contact,
  generatorId,
  state,
}: MatchProps & { threshold: number; contact?: React.ReactNode; generatorId: string; state: string }) {
  const s = result.buyerSavingsPerMonth;
  const buyerPays = !result.buyerBenefits && result.sellerLight !== 'rojo';
  const from = useStateTrajectory(`${generatorId}|${buyer.id}`, state, result.marginPct);
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface shadow-overlay" data-testid="result-light" data-light={result.light}>
      {/* La respuesta es el bloque de color de la pantalla: cobalto sólido, con el semáforo en una ficha clara. */}
      <div className="bg-selection-solid px-3.5 pt-3 pb-3.5 text-on-accent">
        <div className="flex items-center justify-between gap-3">
          <p className="kicker text-on-accent/85 before:bg-on-accent">Resultado</p>
          <p
            className={cn(
              'flex items-center gap-1.5 rounded-sm bg-surface py-0.5 pr-2 pl-1 font-mono text-caption font-medium tracking-wide uppercase tabular-nums',
              LIGHT_TONE[result.light],
            )}
          >
            <Light light={result.light} size="xs" />
            {LIGHT_LABELS[result.light]}: margen {pct(result.marginPct)}
          </p>
        </div>
        <p className="mt-2 font-display text-heading font-semibold text-pretty">{buyer.name}</p>
        <p className="mt-0.5 font-mono text-caption text-on-accent/85 uppercase tabular-nums">
          {SECTOR_SINGULAR[buyer.sector]} · {buyer.locality ? `${buyer.locality} · ` : ''}
          {formatKm(result.distanceKm)} por ruta
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <div>
            <p className="font-mono text-overline tracking-[0.12em] text-on-accent/85 uppercase">Margen por mes</p>
            <p className="font-display text-[2rem] leading-9 font-extrabold tracking-[-0.03em] whitespace-nowrap tabular-nums" data-testid="result-margin">
              {ars(result.marginPerMonth)}
            </p>
          </div>
          <p className="ml-auto pb-1.5 text-right font-mono text-caption whitespace-nowrap text-on-accent/85 tabular-nums">
            {from !== null && Math.abs(from - result.marginPct) > 0.0005 ? (
              <>
                {pct(from)} → <span className="font-semibold text-on-accent">{pct(result.marginPct)}</span>
              </>
            ) : (
              <span className="uppercase">Cierra desde {pct(threshold)}</span>
            )}
          </p>
        </div>
      </div>
      {buyerPays && (
        <p className="flex gap-1.5 bg-bad-bg px-3.5 py-2.5 text-small font-medium text-bad" data-testid="buyer-pays-more">
          <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>
            Al vendedor le cierra, pero al comprador le sale {formatArs(-s)}/mes más caro que {altName(alternative)}
          </span>
        </p>
      )}
      {contact && <div className="px-3.5 pt-2.5 pb-3">{contact}</div>}
    </div>
  );
}
