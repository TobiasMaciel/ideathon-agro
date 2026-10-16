import { CircleCheck, TriangleAlert } from 'lucide-react';
import { orderRanking, type RankedBuyer } from '@mapa/core/match';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LIGHT_TONE } from '@/shared/tone';
import { SECTOR_SINGULAR } from '@/shared/labels';
import { PublishedMeta } from '@/features/contact';
import Light from '@/shared/Light';
import { ars, formatArs, formatKm, pct } from '@/shared/format';

interface Props {
  ranking: RankedBuyer[];
  selectedBuyerId: string | null;
  onSelect: (id: string) => void;
  /** Comprador resaltado desde el mapa o por hover en la fila. */
  hotBuyerId: string | null;
  onHover: (id: string | null) => void;
  /** Hay sectores filtrados: el vacío ofrece quitarlos. */
  filtered: boolean;
  onClearFilters: () => void;
}

export default function BuyerRanking({ ranking, selectedBuyerId, onSelect, hotBuyerId, onHover, filtered, onClearFilters }: Props) {
  if (ranking.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center">
        <p className="text-body font-medium text-fg">Ningún comprador compra este material</p>
        {filtered && (
          <>
            <p className="mt-1 text-small text-fg-muted">Probá con otros sectores en Filtros.</p>
            <Button variant="outline" onClick={onClearFilters} className="mt-3 h-9 text-body">
              Quitar filtros
            </Button>
          </>
        )}
      </div>
    );
  }
  return (
    <ul className="-mx-4 divide-y divide-divider border-y border-divider" onMouseLeave={() => onHover(null)}>
      {orderRanking(ranking).map(({ buyer, result }) => {
        const selected = buyer.id === selectedBuyerId;
        const hot = buyer.id === hotBuyerId;
        const s = result.buyerSavingsPerMonth;
        return (
          <li key={buyer.id}>
            <button
              type="button"
              data-testid={`buyer-row-${buyer.id}`}
              data-light={result.light}
              aria-pressed={selected}
              onClick={() => onSelect(buyer.id)}
              onMouseEnter={() => onHover(buyer.id)}
              onFocus={() => onHover(buyer.id)}
              onBlur={() => onHover(null)}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-120 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-selection',
                selected ? 'bg-selection-subtle shadow-[inset_2px_0_0_var(--color-selection)]' : hot ? 'bg-surface-subtle' : 'hover:bg-surface-subtle',
              )}
            >
              <Light light={result.light} className="mt-0.5" />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-medium text-pretty text-fg">{buyer.name}</span>
                <span className="mt-0.5 block font-mono text-caption text-fg-subtle uppercase tabular-nums">
                  {SECTOR_SINGULAR[buyer.sector]} · {buyer.locality ? `${buyer.locality} · ` : ''}
                  <span className="whitespace-nowrap">{formatKm(result.distanceKm)}</span>
                </span>
                {buyer.origin === 'publicacion' && <PublishedMeta entity={buyer} className="mt-1" />}
                {result.buyerBenefits ? (
                  <span className="mt-1 flex items-start gap-1 text-caption text-fg-muted">
                    <CircleCheck size={12} strokeWidth={2.5} aria-hidden="true" className="mt-0.5 shrink-0 text-ok" />
                    <span>
                      El comprador ahorra <span className="font-mono whitespace-nowrap text-fg tabular-nums">{formatArs(s)}/mes</span>
                    </span>
                  </span>
                ) : (
                  <span className="mt-1 flex items-start gap-1 text-caption font-medium text-bad">
                    <TriangleAlert size={12} strokeWidth={2.5} aria-hidden="true" className="mt-0.5 shrink-0" />
                    No le conviene al comprador
                  </span>
                )}
              </span>
              <span className="shrink-0 text-right">
                <span className={cn('block font-mono text-body font-semibold tabular-nums', LIGHT_TONE[result.light])}>
                  {pct(result.marginPct)}
                </span>
                <span className="block font-mono text-caption whitespace-nowrap text-fg-muted tabular-nums">{ars(result.marginPerMonth)}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
