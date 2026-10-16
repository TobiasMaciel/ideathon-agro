import { useId } from 'react';
import { Check, ChevronRight, ListFilter } from 'lucide-react';
import type { Buyer, BuyerSector, Material, MaterialId } from '@mapa/core/data';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Toggle } from '@/components/ui/toggle';

export const SECTOR_LABELS: Record<BuyerSector, string> = {
  yerbatera: 'Yerbateras',
  central_biomasa: 'Centrales de biomasa',
  citricola: 'Citrícolas',
  secadero_granos: 'Secaderos de granos',
  frigorifico: 'Frigoríficos',
};

interface Props {
  materials: Material[];
  buyers: Buyer[];
  selectedMaterials: MaterialId[];
  selectedSectors: BuyerSector[];
  onToggleMaterial: (id: MaterialId) => void;
  onToggleSector: (id: BuyerSector) => void;
  onClear: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={active}
      onPressedChange={onClick}
      className="h-8 rounded-md border-border px-2.5 text-small font-medium text-fg-muted hover:bg-surface-subtle focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-selection data-[state=on]:border-selection data-[state=on]:bg-selection-subtle data-[state=on]:text-selection"
    >
      {active && <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />}
      {children}
    </Toggle>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div>
      <p id={id} className="mb-1.5 text-caption font-medium text-fg-subtle">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  );
}

export default function Filters({
  materials,
  buyers,
  selectedMaterials,
  selectedSectors,
  onToggleMaterial,
  onToggleSector,
  onClear,
  open,
  onOpenChange,
}: Props) {
  const sectors = [...new Set(buyers.map((b) => b.sector))];
  const active = selectedMaterials.length + selectedSectors.length;
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center justify-between gap-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="-ml-2 h-8 gap-1.5 px-2 text-small text-fg-muted hover:text-fg">
            <ListFilter aria-hidden="true" />
            Filtros
            {active > 0 && (
              <span className="tabular-nums">
                · {active} {active === 1 ? 'activo' : 'activos'}
              </span>
            )}
            <ChevronRight aria-hidden="true" className={`text-fg-subtle motion-safe:transition-transform motion-safe:duration-150 ${open ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        {active > 0 && (
          <Button variant="link" size="sm" onClick={onClear} className="h-8 px-1 text-small text-selection hover:text-selection-hover">
            Quitar filtros
          </Button>
        )}
      </div>
      <CollapsibleContent className="mt-3 space-y-3">
        <Group label="Plantas en el mapa">
          {materials.map((m) => (
            <Chip key={m.id} active={selectedMaterials.includes(m.id)} onClick={() => onToggleMaterial(m.id)}>
              {m.name}
            </Chip>
          ))}
        </Group>
        <Group label="Compradores">
          {sectors.map((s) => (
            <Chip key={s} active={selectedSectors.includes(s)} onClick={() => onToggleSector(s)}>
              {SECTOR_LABELS[s]}
            </Chip>
          ))}
        </Group>
      </CollapsibleContent>
    </Collapsible>
  );
}
