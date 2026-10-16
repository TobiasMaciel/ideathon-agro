import type { Generator, Material } from '@/data/types';
import { formatNumber } from '@/lib/format';

interface Props {
  generators: Generator[];
  materials: Material[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function GeneratorPicker({ generators, materials, selectedId, onSelect }: Props) {
  return (
    <div>
      <label htmlFor="generator-select" className="mb-1 block text-sm font-semibold text-stone-900">
        Tu planta (generador del residuo)
      </label>
      <select
        id="generator-select"
        data-testid="generator-select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-md border border-stone-400 bg-white px-2 py-2 text-sm text-stone-900 focus-visible:outline-2 focus-visible:outline-green-800"
      >
        {materials.map((m) => {
          const list = generators.filter((g) => g.materialId === m.id);
          if (list.length === 0) return null;
          return (
            <optgroup key={m.id} label={m.name}>
              {list.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} · {g.locality} · {formatNumber(g.tonsPerMonth.value)} t/mes
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );
}
