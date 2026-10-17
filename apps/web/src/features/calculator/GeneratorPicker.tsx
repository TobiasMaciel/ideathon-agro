import { useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import type { Generator, Material } from '@mapa/core/contracts';
import { formatNumber } from '@/shared/format';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GENERATOR_KIND_LABELS } from '@/shared/labels';
import { MATERIAL_COLORS } from '@/features/map';

interface Props {
  generators: Generator[];
  materials: Material[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Rombo del material: la misma forma y tono que la planta en el mapa. */
function PlantMark({ g }: { g: Generator }) {
  return (
    <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
      <span className="size-2.5 rotate-45 rounded-[2px] ring-1 ring-white/70" style={{ background: MATERIAL_COLORS[g.materialId] }} />
    </span>
  );
}

/** Selector de planta con búsqueda. El disparador muestra "dónde estoy": nombre, tipo, material, localidad y t/mes. */
export default function GeneratorPicker({ generators, materials, selectedId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const selected = generators.find((g) => g.id === selectedId);
  const materialName = (id: string) => materials.find((m) => m.id === id)?.name ?? id;

  return (
    <div>
    <p className="kicker mb-1">Tu planta</p>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={selected ? `Tu planta: ${selected.name}. Cambiar planta` : 'Elegí tu planta'}
          data-testid="generator-select"
          data-value={selectedId}
          className="group -mx-2 flex w-[calc(100%+1rem)] items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors duration-120 ease-out hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-selection aria-expanded:bg-surface-subtle"
        >
          <span className="mt-1">{selected && <PlantMark g={selected} />}</span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-title text-pretty text-fg">{selected?.name ?? 'Elegí tu planta'}</span>
            {selected && (
              <span className="mt-0.5 block font-mono text-caption text-fg-muted uppercase tabular-nums">
                {GENERATOR_KIND_LABELS[selected.kind]} · {materialName(selected.materialId)} · {selected.locality ? `${selected.locality} · ` : ''}
                <span className="whitespace-nowrap">{formatNumber(selected.tonsPerMonth.value)} t/mes</span>
              </span>
            )}
          </span>
          <ChevronsUpDown size={16} aria-hidden="true" className="mt-1 shrink-0 text-fg-subtle group-hover:text-fg" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-72 p-0 shadow-overlay ring-0">
        <Command>
          <CommandInput placeholder="Buscar planta, localidad o material…" className="text-body" />
          <CommandList className="max-h-80">
            <CommandEmpty>No hay plantas con ese nombre.</CommandEmpty>
            {materials.map((m) => {
              const list = generators.filter((g) => g.materialId === m.id);
              if (list.length === 0) return null;
              return (
                <CommandGroup key={m.id} heading={m.name}>
                  {list.map((g) => (
                    <CommandItem
                      key={g.id}
                      value={`${g.name} ${g.locality} ${m.name} ${g.id}`}
                      data-testid={`generator-option-${g.id}`}
                      data-checked={g.id === selectedId}
                      onSelect={() => {
                        onSelect(g.id);
                        setOpen(false);
                      }}
                      className="items-start gap-2 py-2"
                    >
                      <span className="mt-0.5">
                        <PlantMark g={g} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-pretty">{g.name}</span>
                        <span className="block text-caption text-fg-muted tabular-nums">
                          {g.locality ? `${g.locality} · ` : ''}
                          {formatNumber(g.tonsPerMonth.value)} t/mes
                          {g.origin === 'publicacion' && <span className="font-mono text-fg-subtle uppercase"> · Sin verificar</span>}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    </div>
  );
}
