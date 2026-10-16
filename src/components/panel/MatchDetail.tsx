import type { Alternative, Buyer, Generator } from '@/data/types';
import { formatArs, formatPct, formatNumber, formatTons } from '@/lib/format';
import type { ViabilityResult } from '@/lib/viability/types';
import Light, { LIGHT_TEXT } from './Light';

interface Props {
  generator: Generator;
  buyer: Buyer;
  alternative: Alternative | undefined;
  result: ViabilityResult;
}

const BG = { verde: 'bg-green-50 border-green-700', amarillo: 'bg-amber-50 border-amber-600', rojo: 'bg-red-50 border-red-700' } as const;

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 py-0.5 ${strong ? 'font-semibold' : ''}`}>
      <dt className="text-stone-700">{label}</dt>
      <dd className="text-right text-stone-900">{value}</dd>
    </div>
  );
}

export default function MatchDetail({ generator, buyer, alternative, result }: Props) {
  const s = result.buyerSavingsPerMonth;
  const altName = alternative ? (alternative.id === 'glp' ? 'GLP' : 'la leña') : 'su combustible actual';
  const savingsText =
    s >= 0 ? `Le ahorra ${formatArs(s)}/mes frente a ${altName}` : `Le cuesta ${formatArs(-s)}/mes más que ${altName}`;
  const buyerPays = !result.buyerBenefits && result.sellerLight !== 'rojo';
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-700">
        {generator.name} → <strong>{buyer.name}</strong>
      </p>
      <div
        className={`flex items-center gap-3 rounded-lg border-2 p-3 ${BG[result.light]}`}
        data-testid="result-light"
        data-light={result.light}
      >
        <Light light={result.light} size="lg" />
        <div>
          <p className="text-xl font-bold text-stone-900">{LIGHT_TEXT[result.light]}</p>
          <p className="text-sm text-stone-900" data-testid="result-margin">
            Margen {formatArs(result.marginPerMonth)}/mes · {formatPct(result.marginPct)}
          </p>
          {buyerPays && (
            <p className="mt-1 text-sm font-medium text-red-900" data-testid="buyer-pays-more">
              Al vendedor le cierra, pero al comprador le sale {formatArs(-s)}/mes más caro que {altName}
            </p>
          )}
        </div>
      </div>
      <dl className="text-sm">
        <Row label="Vendés" value={`${formatTons(result.productTonsPerMonth)}/mes`} />
        <Row label="Carga por camión" value={formatTons(result.truckLoadTons)} />
        <Row label="Viajes por mes" value={formatNumber(result.tripsPerMonth)} />
        <Row label="Ingreso" value={formatArs(result.revenuePerMonth)} />
        <Row label="Flete (ida y vuelta)" value={`-${formatArs(result.freightPerMonth)}`} />
        <Row label="Acondicionamiento" value={`-${formatArs(result.conditioningPerMonth)}`} />
        <div className="mt-1 border-t border-stone-300 pt-1">
          <Row label="Margen" value={formatArs(result.marginPerMonth)} strong />
        </div>
      </dl>
      <p className="text-xs text-stone-700">Calculado con los supuestos de &quot;Datos usados&quot; y &quot;Supuestos&quot;.</p>
      <p
        data-testid="buyer-savings"
        className={`rounded-md px-3 py-2 text-sm font-medium ${s >= 0 ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}
      >
        {savingsText}
      </p>
    </div>
  );
}
