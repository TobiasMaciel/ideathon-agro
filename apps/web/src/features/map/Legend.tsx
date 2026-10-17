import { useId, useState } from 'react';
import { Beef, ChevronDown, Citrus, Leaf, Warehouse, Zap, type LucideIcon } from 'lucide-react';
import type { BuyerSector, MaterialId } from '@mapa/core/contracts';
import { LIGHT_LABELS, MATERIAL_LABELS, SECTOR_SINGULAR } from '@/shared/labels';
import { MAP_COLORS, MATERIAL_COLORS, buyerPinHtml, buyerPinSpec, generatorPinHtml, generatorPinSpec } from './markers';

function PinSample({ html }: { html: string }) {
  // HTML propio y estático (markers.ts escapa los atributos).
  return <span aria-hidden="true" className="flex w-6 shrink-0 justify-center" dangerouslySetInnerHTML={{ __html: html }} />;
}

const idle = { selected: false, hot: false };
const SECTOR_LUCIDE: Record<BuyerSector, LucideIcon> = { central_biomasa: Zap, yerbatera: Leaf, citricola: Citrus, secadero_granos: Warehouse, frigorifico: Beef };
const SECTOR_LEGEND: BuyerSector[] = ['central_biomasa', 'yerbatera', 'citricola', 'secadero_granos', 'frigorifico'];

/** En pantallas bajas la leyenda arranca plegada para no tapar el mapa. */
const startsOpen = () => typeof window === 'undefined' || window.innerHeight >= 860;

/** Leyenda plegable: los mismos pines (mismo HTML) que el mapa, en tamaño normal. */
export default function Legend() {
  const [open, setOpen] = useState(startsOpen);
  const bodyId = useId();
  return (
    <div className="absolute bottom-16 left-3 z-[1000] flex w-60 flex-col overflow-hidden rounded-xl border border-border bg-surface/95 text-caption text-fg-muted shadow-overlay backdrop-blur-sm">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between px-3 py-2 font-mono text-overline text-fg-muted uppercase transition-colors duration-120 ease-out hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-selection"
      >
        <span className="kicker text-inherit">Leyenda</span>
        <ChevronDown size={14} aria-hidden="true" className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      <div id={bodyId} hidden={!open} className="space-y-3 border-t border-divider p-3">
        <div>
          <p className="mb-1.5 text-overline text-fg-muted uppercase">Plantas</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <PinSample html={generatorPinHtml({ ...generatorPinSpec('aserrin', idle), fill: MAP_COLORS.neutral }, 'tree-pine', 'legend').html} />
              Aserradero o foresto-industria
            </li>
            <li className="flex items-center gap-2">
              <PinSample html={generatorPinHtml({ ...generatorPinSpec('aserrin', idle), fill: MAP_COLORS.neutral }, 'wheat', 'legend').html} />
              Molino arrocero
            </li>
          </ul>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
            {(Object.keys(MATERIAL_COLORS) as MaterialId[]).map((m) => (
              <li key={m} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: MATERIAL_COLORS[m] }} />
                {MATERIAL_LABELS[m]}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-overline text-fg-muted uppercase">Compradores</p>
          <ul className="space-y-1">
            {(['verde', 'amarillo', 'rojo', undefined] as const).map((l) => (
              <li key={l ?? 'none'} className="flex items-center gap-2">
                <PinSample html={buyerPinHtml(buyerPinSpec(l, idle), 'warehouse', 'legend', l ?? 'none').html} />
                {LIGHT_LABELS[l ?? 'sinEvaluar']}
              </li>
            ))}
          </ul>
          <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
            {SECTOR_LEGEND.map((sector) => {
              const Icon = SECTOR_LUCIDE[sector];
              return (
                <li key={sector} className="flex items-center gap-1.5">
                  <Icon size={13} strokeWidth={2} aria-hidden="true" className="shrink-0 text-fg" />
                  {SECTOR_SINGULAR[sector]}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-overline text-fg-muted uppercase">Publicaciones</p>
          <p className="flex items-center gap-2">
            <PinSample html={generatorPinHtml({ ...generatorPinSpec('aserrin', idle, true), fill: MAP_COLORS.neutral }, 'tree-pine', 'legend').html} />
            Contorno punteado: publicada por un usuario, sin verificar
          </p>
        </div>
      </div>
    </div>
  );
}
