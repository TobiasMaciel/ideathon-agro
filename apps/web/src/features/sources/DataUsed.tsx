import type { Source, Tagged } from '@mapa/core/contracts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TagBadge from './TagBadge';

export interface DataItem {
  label: string;
  valueText: string;
  tagged: Tagged;
}

const LINK =
  'rounded-xs text-selection underline decoration-1 underline-offset-2 transition-colors duration-120 ease-out hover:text-selection-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection';

function SourceCell({ item, sources }: { item: DataItem; sources: Source[] }) {
  const { tagged } = item;
  const linked = tagged.sourceIds.map((id) => sources.find((s) => s.id === id)).filter((s): s is Source => s !== undefined);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Ver fuente de ${item.label}`} className={`${LINK} font-mono text-caption whitespace-nowrap`}>
          Ver fuente ↗
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] gap-2 border border-line p-3 text-small text-fg-muted shadow-overlay ring-0">
        <p className="eyebrow">Fuente</p>
        <p className="font-medium text-fg">{item.label}</p>
        {tagged.note && <p>{tagged.note}</p>}
        {linked.length > 0 ? (
          <ul className="space-y-1.5">
            {linked.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {s.title} ↗
                </a>{' '}
                <span className="font-mono text-caption text-fg-subtle">· {s.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Sin fuente publicada: valor de referencia del modelo.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Pestaña "Fuentes": cada dato con su valor, si es real o estimado y de dónde sale. */
export default function DataUsed({ items, sources }: { items: DataItem[]; sources: Source[] }) {
  return (
    <table className="w-full border-collapse text-small">
      <caption className="sr-only">Datos usados en el cálculo</caption>
      <thead>
        <tr className="border-b border-line">
          <th scope="col" className="eyebrow pb-1.5 text-left font-medium">
            Dato
          </th>
          <th scope="col" className="eyebrow pb-1.5 text-right font-medium">
            Valor
          </th>
          <th scope="col" className="eyebrow pb-1.5 pl-2 text-left font-medium">
            Tipo
          </th>
          <th scope="col" className="pb-1.5">
            <span className="sr-only">Fuente</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.label} className="border-b border-divider align-top">
            <th scope="row" className="py-2 pr-2 text-left font-normal text-fg-muted">
              {it.label}
            </th>
            <td className="py-2 text-right font-mono whitespace-nowrap text-fg tabular-nums">{it.valueText}</td>
            <td className="py-2 pl-2">
              <TagBadge tag={it.tagged.tag} />
            </td>
            <td className="py-2 pl-2 text-right">
              <SourceCell item={it} sources={sources} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
