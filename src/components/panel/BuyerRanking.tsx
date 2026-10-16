import type { RankedBuyer } from '@/lib/match';
import { formatArs, formatKm, formatPct } from '@/lib/format';
import Light from './Light';

interface Props {
  ranking: RankedBuyer[];
  selectedBuyerId: string | null;
  onSelect: (id: string) => void;
}

const LIGHT_ORDER = { verde: 0, amarillo: 1, rojo: 2 } as const;

/** Verde, amarillo, rojo (semáforo del negocio); dentro de cada grupo, mayor margen primero. Estable. */
export function orderRanking(ranking: RankedBuyer[]): RankedBuyer[] {
  return ranking
    .map((r, i) => ({ r, i }))
    .sort(
      (a, b) =>
        LIGHT_ORDER[a.r.result.light] - LIGHT_ORDER[b.r.result.light] ||
        b.r.result.marginPerMonth - a.r.result.marginPerMonth ||
        a.i - b.i,
    )
    .map(({ r }) => r);
}

export default function BuyerRanking({ ranking, selectedBuyerId, onSelect }: Props) {
  if (ranking.length === 0) {
    return <p className="text-sm text-stone-700">Ningún comprador acepta este material con los filtros actuales.</p>;
  }
  return (
    <ul className="divide-y divide-stone-200 rounded-md border border-stone-300 bg-white">
      {orderRanking(ranking).map(({ buyer, result }) => {
        const selected = buyer.id === selectedBuyerId;
        return (
          <li key={buyer.id}>
            <button
              type="button"
              data-testid={`buyer-row-${buyer.id}`}
              data-light={result.light}
              aria-pressed={selected}
              onClick={() => onSelect(buyer.id)}
              className={`flex w-full items-center gap-2 px-2 py-2 text-left text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-green-800 ${
                selected ? 'bg-green-50' : 'hover:bg-stone-50'
              }`}
            >
              <Light light={result.light} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-stone-900">{buyer.name}</span>
                <span className="block truncate text-xs text-stone-700">
                  {buyer.locality} · {formatKm(result.distanceKm)} por ruta
                </span>
                {!result.buyerBenefits && (
                  <span className="block text-xs font-semibold text-red-800">No le conviene al comprador</span>
                )}
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs font-semibold text-stone-900">{formatPct(result.marginPct)}</span>
                <span className="block text-xs text-stone-700">{formatArs(result.marginPerMonth)}/mes</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
