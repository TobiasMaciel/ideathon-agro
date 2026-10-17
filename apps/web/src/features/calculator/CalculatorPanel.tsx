import { useState } from 'react';
import type { CatalogResponse, Generator, Material } from '@mapa/core/contracts';
import type { RankedBuyer } from '@mapa/core/match';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BuyerRanking, Filters } from '@/features/buyers';
import { ListingInfo } from '@/features/contact';
import { DataUsed } from '@/features/sources';
import Answer from './Answer';
import AssumptionsEditor from './AssumptionsEditor';
import GeneratorPicker from './GeneratorPicker';
import MatchDetail from './MatchDetail';
import RadiusSummary from './RadiusSummary';
import StateSelector from './StateSelector';
import { countLights, dataItems, stateStats, type Derived } from './derive';
import type { Calculator } from './use-calculator';

const TAB_TRIGGER =
  'h-full flex-none rounded-none px-1 select-none text-small font-medium text-fg-muted transition-colors duration-150 hover:text-fg focus-visible:ring-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-selection data-active:text-fg after:bg-selection group-data-horizontal/tabs:after:bottom-[-1px]';
const TAB_CONTENT = 'px-5 pt-4 pb-6';

export type PanelTab = 'compradores' | 'detalle' | 'supuestos' | 'fuentes';

interface Props {
  catalog: CatalogResponse;
  calc: Calculator;
  generator: Generator;
  material: Material;
  d: Derived;
  selected: RankedBuyer | undefined;
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  hotBuyerId: string | null;
  onHoverBuyer: (id: string | null) => void;
}

/** Contenido del panel: bloque fijo (planta, estado, respuesta) y pestañas (compradores, detalle, supuestos, fuentes). */
export default function CalculatorPanel({ catalog, calc, generator, material, d, selected, tab, onTabChange, hotBuyerId, onHoverBuyer }: Props) {
  const { app, dispatch, selectGenerator } = calc;
  const [showFilters, setShowFilters] = useState(false);
  const counts = countLights(d.ranking);
  const alternative = selected ? catalog.alternatives.find((a) => a.id === selected.buyer.currentAlternative) : undefined;
  const edited = Object.keys(app.overrides).length > 0;
  const showSources = () => onTabChange('fuentes');

  return (
    <>
      {/* Bloque fijo: dónde estoy y la respuesta. */}
      <div className="grid-paper shrink-0 space-y-3.5 border-b border-border px-5 pt-4 pb-5">
        <div>
          <GeneratorPicker generators={catalog.generators} materials={catalog.materials} selectedId={generator.id} onSelect={(id) => selectGenerator(id)} />
          <ListingInfo entity={generator} onShowSources={showSources} className="mt-1" />
        </div>
        <StateSelector
          value={d.state}
          available={d.states}
          materialName={material.name}
          stats={stateStats(catalog, generator, material, app, d)}
          onChange={(s) => dispatch({ type: 'setState', state: s })}
        />
        <RadiusSummary roadKm={d.roadKm} mapKm={d.mapKm} />
        {selected ? (
          <Answer
            buyer={selected.buyer}
            alternative={alternative}
            result={selected.result}
            threshold={d.values.greenThreshold}
            generatorId={generator.id}
            state={d.state}
            contact={<ListingInfo entity={selected.buyer} onShowSources={showSources} />}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-small text-fg-muted">Ningún comprador compra este material.</p>
        )}
      </div>

      {/* Un solo scroll: el del panel. Las pestañas quedan pegadas arriba mientras se baja. */}
      <Tabs value={tab} onValueChange={(v) => onTabChange(v as PanelTab)} className="flex flex-col gap-0">
        <TabsList variant="line" className="sticky top-0 z-10 flex h-11 w-full shrink-0 justify-between gap-2 border-b border-line bg-surface/95 px-5 pt-1 backdrop-blur-md">
          <TabsTrigger value="compradores" className={TAB_TRIGGER}>
            Compradores
          </TabsTrigger>
          <TabsTrigger value="detalle" className={TAB_TRIGGER}>
            Detalle
          </TabsTrigger>
          <TabsTrigger value="supuestos" className={TAB_TRIGGER}>
            Supuestos{edited && <span aria-label="(editados)" className="size-1.5 rounded-full bg-selection" />}
          </TabsTrigger>
          <TabsTrigger value="fuentes" className={TAB_TRIGGER}>
            Fuentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compradores" className={TAB_CONTENT}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-caption text-fg-subtle tabular-nums">
              {d.ranking.length > 0 ? `${counts.verde} cierran · ${counts.amarillo} justos · ${counts.rojo} no cierran` : 'Sin compradores'}
            </p>
          </div>
          <Filters
            materials={catalog.materials}
            buyers={catalog.buyers}
            selectedMaterials={app.materials}
            selectedSectors={app.sectors}
            onToggleMaterial={(id) => dispatch({ type: 'toggleMaterial', id })}
            onToggleSector={(id) => dispatch({ type: 'toggleSector', id })}
            onClear={() => dispatch({ type: 'clearFilters' })}
            open={showFilters}
            onOpenChange={setShowFilters}
          />
          <div className="mt-2">
            <BuyerRanking
              ranking={d.ranking}
              selectedBuyerId={selected?.buyer.id ?? null}
              onSelect={(id) => dispatch({ type: 'selectBuyer', id })}
              hotBuyerId={hotBuyerId}
              onHover={onHoverBuyer}
              filtered={app.sectors.length > 0}
              onClearFilters={() => dispatch({ type: 'clearFilters' })}
            />
          </div>
        </TabsContent>

        <TabsContent value="detalle" className={TAB_CONTENT}>
          {selected ? (
            <MatchDetail buyer={selected.buyer} alternative={alternative} result={selected.result} radiusKm={d.roadKm} threshold={d.values.greenThreshold} />
          ) : (
            <p className="text-small text-fg-muted">Elegí un comprador en la pestaña Compradores.</p>
          )}
        </TabsContent>

        <TabsContent value="supuestos" className={TAB_CONTENT}>
          <AssumptionsEditor
            values={d.values}
            hasOverrides={edited}
            onChange={(key, value) => dispatch({ type: 'setOverride', key, value })}
            onReset={() => dispatch({ type: 'resetOverrides' })}
          />
        </TabsContent>

        <TabsContent value="fuentes" className={TAB_CONTENT}>
          <p className="text-small text-pretty text-fg-muted">Cada valor dice si es real o estimado. Tocá "Ver fuente" para saber de dónde sale.</p>
          <DataUsed items={dataItems(catalog, generator, material, d, selected)} sources={catalog.sources} />
        </TabsContent>
      </Tabs>
    </>
  );
}
