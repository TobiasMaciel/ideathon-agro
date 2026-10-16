'use client';

import { useMemo, useReducer, useState } from 'react';
import ClientMap from '@/components/map/ClientMap';
import type { CatalogResponse } from '@/lib/api/types';
import { assumptionValues, availableStates, rankBuyers, viableRadiusMapKm } from '@/lib/match';
import { formatArs, formatNumber, formatTons } from '@/lib/format';
import type { TrafficLight } from '@/lib/viability/types';
import AssumptionsEditor from '@/components/panel/AssumptionsEditor';
import BuyerRanking, { orderRanking } from '@/components/panel/BuyerRanking';
import DataUsed, { type DataItem } from '@/components/panel/DataUsed';
import Filters from '@/components/panel/Filters';
import GeneratorPicker from '@/components/panel/GeneratorPicker';
import MatchDetail from '@/components/panel/MatchDetail';
import OriginBadge from '@/components/panel/OriginBadge';
import RadiusSummary from '@/components/panel/RadiusSummary';
import StateSelector from '@/components/panel/StateSelector';
import { initialState, reducer } from './state';
import { useCatalog } from './useCatalog';

const DEFAULT_GENERATOR = 'molinos-ala-mercedes';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 border-b border-stone-300 px-4 py-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-green-900">{title}</h2>
      {children}
    </section>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-stone-800">{children}</div>;
}

function Loaded({ catalog }: { catalog: CatalogResponse }) {
  const [app, dispatch] = useReducer(
    reducer,
    catalog.generators.some((g) => g.id === DEFAULT_GENERATOR) ? DEFAULT_GENERATOR : (catalog.generators[0]?.id ?? ''),
    initialState,
  );
  const [showAssumptions, setShowAssumptions] = useState(false);

  const generator = catalog.generators.find((g) => g.id === app.selectedGeneratorId);
  const material = catalog.materials.find((m) => m.id === generator?.materialId);

  const derived = useMemo(() => {
    if (!generator || !material) return null;
    try {
      const states = availableStates(material);
      const state = states.includes(app.state) ? app.state : 'suelto';
      const buyers = catalog.buyers.filter((b) => app.sectors.length === 0 || app.sectors.includes(b.sector));
      const common = { assumptions: catalog.assumptions, overrides: app.overrides };
      const ranking = orderRanking(
        rankBuyers({ generator, state, buyers, materials: catalog.materials, alternatives: catalog.alternatives, ...common }),
      );
      const lights: Record<string, TrafficLight> = {};
      for (const r of ranking) lights[r.buyer.id] = r.result.light;
      const mapKm = viableRadiusMapKm(material, state, catalog.assumptions, app.overrides);
      const values = assumptionValues(catalog.assumptions, app.overrides);
      return { error: null, states, state, buyers, ranking, lights, mapKm, roadKm: mapKm * values.routeFactor, values };
    } catch (e) {
      console.error(e);
      return { error: 'No pudimos calcular los resultados con estos datos o supuestos. Probá restablecer los supuestos.' };
    }
  }, [catalog, generator, material, app.state, app.sectors, app.overrides]);

  if (!generator || !material || !derived) {
    return <Message>No hay generadores disponibles en el catálogo.</Message>;
  }

  const handleSelectGenerator = (id: string) => {
    const g = catalog.generators.find((x) => x.id === id);
    const m = catalog.materials.find((x) => x.id === g?.materialId);
    dispatch({ type: 'selectGenerator', id, availableStates: m ? availableStates(m) : ['suelto'] });
  };

  if (derived.error !== null) {
    return (
      <Message>
        <p role="alert">{derived.error}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'resetOverrides' })}
          className="rounded-md bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
        >
          Restablecer supuestos
        </button>
      </Message>
    );
  }

  const { states, state, buyers, ranking, lights, mapKm, roadKm, values } = derived;
  const selected = ranking.find((r) => r.buyer.id === app.selectedBuyerId) ?? ranking[0];
  const selectedBuyerId = selected?.buyer.id ?? null;

  const mapGenerators = catalog.generators.filter(
    (g) => g.id === generator.id || app.materials.length === 0 || app.materials.includes(g.materialId),
  );
  const spec = material.states[state];
  const assumption = (key: 'costPerKm' | 'routeFactor') => catalog.assumptions.find((a) => a.key === key);
  const costPerKm = assumption('costPerKm');
  const routeFactor = assumption('routeFactor');

  const items: DataItem[] = [];
  if (spec) {
    items.push(
      { label: 'Precio de venta', valueText: `${formatArs(spec.pricePerTon.value)}/t`, tagged: spec.pricePerTon },
      { label: 'Densidad', valueText: `${formatNumber(spec.bulkDensityTPerM3.value * 1000)} kg/m³`, tagged: spec.bulkDensityTPerM3 },
      { label: 'Poder calorífico (PCI)', valueText: `${formatNumber(spec.lhvMJPerKg.value, 1)} MJ/kg`, tagged: spec.lhvMJPerKg },
    );
  }
  if (costPerKm) items.push({ label: 'Costo por km', valueText: `${formatArs(values.costPerKm)}/km`, tagged: costPerKm });
  if (routeFactor) items.push({ label: 'Factor de ruta', valueText: `× ${formatNumber(values.routeFactor, 2)}`, tagged: routeFactor });
  if (selected) {
    // La demanda está en t/mes del combustible que el comprador usa hoy; el modelo la convierte por energía.
    const alt = catalog.alternatives.find((a) => a.id === selected.buyer.currentAlternative);
    const fuel = alt ? alt.name.split(' (')[0] : 'su combustible';
    items.push({ label: `Consumo actual del comprador (${fuel})`, valueText: `${formatTons(selected.buyer.demandTonsPerMonth.value)}/mes`, tagged: selected.buyer.demandTonsPerMonth });
    if (alt) {
      items.push({ label: `Precio de ${fuel}`, valueText: `${formatArs(alt.pricePerUnit.value)}/${alt.unit}`, tagged: alt.pricePerUnit });
    }
  }
  items.push({ label: 'Generación de la planta', valueText: `${formatTons(generator.tonsPerMonth.value)}/mes`, tagged: generator.tonsPerMonth });

  return (
    <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <div className="h-[45vh] min-h-[260px] lg:h-auto lg:min-h-0 lg:flex-1" data-testid="map-container">
        <ClientMap
          generators={mapGenerators}
          buyers={buyers}
          selectedGeneratorId={generator.id}
          selectedBuyerId={selectedBuyerId}
          radiusKm={mapKm}
          buyerLights={lights}
          onSelectGenerator={handleSelectGenerator}
          onSelectBuyer={(id) => dispatch({ type: 'selectBuyer', id })}
        />
      </div>

      <aside aria-label="Calculadora" className="w-full bg-stone-50 lg:w-[420px] lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-stone-300">
        <Section title="Generador">
          <GeneratorPicker
            generators={catalog.generators}
            materials={catalog.materials}
            selectedId={generator.id}
            onSelect={handleSelectGenerator}
          />
          <Filters
            materials={catalog.materials}
            buyers={catalog.buyers}
            selectedMaterials={app.materials}
            selectedSectors={app.sectors}
            onToggleMaterial={(id) => dispatch({ type: 'toggleMaterial', id })}
            onToggleSector={(id) => dispatch({ type: 'toggleSector', id })}
          />
        </Section>

        <Section title="¿Cómo lo vendés?">
          <StateSelector value={state} available={states} onChange={(s) => dispatch({ type: 'setState', state: s })} />
        </Section>

        <Section title="Radio viable">
          <RadiusSummary roadKm={roadKm} mapKm={mapKm} />
        </Section>

        <Section title="Compradores">
          <BuyerRanking ranking={ranking} selectedBuyerId={selectedBuyerId} onSelect={(id) => dispatch({ type: 'selectBuyer', id })} />
        </Section>

        {selected && (
          <Section title="Detalle del negocio">
            <MatchDetail
              generator={generator}
              buyer={selected.buyer}
              alternative={catalog.alternatives.find((a) => a.id === selected.buyer.currentAlternative)}
              result={selected.result}
            />
          </Section>
        )}

        <Section title="Datos usados">
          <DataUsed items={items} sources={catalog.sources} />
        </Section>

        <section className="border-b border-stone-300 px-4 py-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-green-900">
            <button
              type="button"
              aria-expanded={showAssumptions}
              aria-controls="assumptions-panel"
              onClick={() => setShowAssumptions((v) => !v)}
              className="flex w-full items-center justify-between uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
            >
              Supuestos
              <span aria-hidden="true">{showAssumptions ? '▾' : '▸'}</span>
            </button>
          </h2>
          <div id="assumptions-panel" hidden={!showAssumptions} className="mt-2">
            <AssumptionsEditor
              values={values}
              hasOverrides={Object.keys(app.overrides).length > 0}
              onChange={(key, value) => dispatch({ type: 'setOverride', key, value })}
              onReset={() => dispatch({ type: 'resetOverrides' })}
            />
          </div>
        </section>

        <div className="px-4 py-3">
          <OriginBadge origin={catalog.origin} />
        </div>
      </aside>
    </div>
  );
}

export default function MapCircularApp() {
  const { state, retry } = useCatalog();
  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 lg:h-dvh">
      <header className="shrink-0 border-b border-green-950 bg-green-900 px-4 py-2 text-white">
        <h1 className="text-lg font-bold leading-tight">Mapa Circular NEA — ¿Cierra el negocio?</h1>
        <p className="text-xs text-green-100">Del subproducto al mercado · Corrientes</p>
      </header>
      {state.status === 'loading' && (
        <Message>
          <p role="status">Cargando datos…</p>
        </Message>
      )}
      {state.status === 'error' && (
        <Message>
          <p role="alert">No pudimos cargar el catálogo ({state.message}).</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-md bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
          >
            Reintentar
          </button>
        </Message>
      )}
      {state.status === 'ready' && <Loaded catalog={state.catalog} />}
    </div>
  );
}
