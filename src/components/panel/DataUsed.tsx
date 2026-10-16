'use client';

import { useId, useState } from 'react';
import type { Source, Tagged } from '@/data/types';
import TagBadge from './TagBadge';

export interface DataItem {
  label: string;
  valueText: string;
  tagged: Tagged;
}

function Item({ item, sources }: { item: DataItem; sources: Source[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { tagged } = item;
  const linked = tagged.sourceIds
    .map((id) => sources.find((s) => s.id === id))
    .filter((s): s is Source => s !== undefined);
  return (
    <li className="py-1.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-stone-700">{item.label}</span>
        <span className="flex items-center gap-2">
          <span className="font-medium text-stone-900">{item.valueText}</span>
          <TagBadge tag={tagged.tag} />
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`Ver fuente de ${item.label}`}
            onClick={() => setOpen((o) => !o)}
            className="h-6 w-6 rounded-full border border-stone-500 text-xs font-bold text-stone-800 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
          >
            i
          </button>
        </span>
      </div>
      {open && (
        <div id={panelId} className="mt-1 rounded-md bg-stone-100 p-2 text-xs text-stone-800">
          <p>{tagged.note ?? 'Sin nota.'}</p>
          {linked.length > 0 ? (
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {linked.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-green-900 underline">
                    {s.title}
                  </a>{' '}
                  ({s.date})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 italic">Sin fuente publicada: supuesto del proyecto.</p>
          )}
        </div>
      )}
    </li>
  );
}

export default function DataUsed({ items, sources }: { items: DataItem[]; sources: Source[] }) {
  return (
    <ul className="divide-y divide-stone-200">
      {items.map((it) => (
        <Item key={it.label} item={it} sources={sources} />
      ))}
    </ul>
  );
}
