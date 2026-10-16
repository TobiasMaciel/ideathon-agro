import type { Buyer, BuyerSector, Material, MaterialId } from '@/data/types';

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
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 ${
        active ? 'border-green-800 bg-green-800 text-white' : 'border-stone-400 bg-white text-stone-900 hover:bg-stone-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function Filters({ materials, buyers, selectedMaterials, selectedSectors, onToggleMaterial, onToggleSector }: Props) {
  const sectors = [...new Set(buyers.map((b) => b.sector))];
  return (
    <div className="space-y-2">
      <div role="group" aria-label="Filtrar plantas por material" className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-stone-700">Plantas:</span>
        {materials.map((m) => (
          <Chip key={m.id} active={selectedMaterials.includes(m.id)} onClick={() => onToggleMaterial(m.id)}>
            {m.name}
          </Chip>
        ))}
      </div>
      <div role="group" aria-label="Filtrar compradores por sector" className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-stone-700">Compradores:</span>
        {sectors.map((s) => (
          <Chip key={s} active={selectedSectors.includes(s)} onClick={() => onToggleSector(s)}>
            {SECTOR_LABELS[s]}
          </Chip>
        ))}
      </div>
    </div>
  );
}
