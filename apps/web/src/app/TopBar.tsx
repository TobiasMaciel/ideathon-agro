import { Plus } from 'lucide-react';
import { KpiStrip, type Kpi } from '@/features/calculator';
import BrandPill from './BrandPill';
import { RIGHT_OF_PANEL } from './layout';

/** Pastilla de acción principal: abre el formulario de publicación. */
function PublishButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      data-testid="publish-open"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-selection-solid pr-3.5 pl-3 text-small font-semibold text-on-accent shadow-overlay transition-colors duration-120 ease-out hover:bg-selection focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection"
    >
      <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
      Publicar
    </button>
  );
}

/** Arriba a la izquierda, sobre el mapa: marca, "Publicar", lo que se pase como `actions` y los KPIs. */
export default function TopBar({ kpis, onPublish, actions }: { kpis: Kpi[]; onPublish: () => void; actions?: React.ReactNode }) {
  return (
    <div className="@container absolute top-3 left-3 z-[1000] flex items-start gap-2" style={{ right: `calc(${RIGHT_OF_PANEL} + 1.5rem)` }}>
      <div className="flex shrink-0 items-center gap-2">
        <BrandPill />
        <PublishButton onClick={onPublish} />
        {actions}
      </div>
      {/* Si no entran en una fila, los KPIs bajan a una segunda (debajo de ellos mismos, no del zoom). */}
      <KpiStrip items={kpis} className="min-w-0 flex-wrap" />
    </div>
  );
}
