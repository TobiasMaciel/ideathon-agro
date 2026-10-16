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
    <div className="rounded-lg border border-line bg-surface-subtle p-3.5" data-testid="result-light" data-light={result.light}>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">Resultado</p>
        <p className={cn('flex items-center gap-1.5 font-mono text-caption font-medium tracking-wide uppercase tabular-nums', LIGHT_TONE[result.light])}>
          <Light light={result.light} size="xs" />
          {LIGHT_LABELS[result.light]}: margen {pct(result.marginPct)}
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
          <p className={cn('font-mono text-figure whitespace-nowrap tabular-nums', result.marginPerMonth >= 0 ? 'text-fg' : 'text-bad')} data-testid="result-margin">
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
