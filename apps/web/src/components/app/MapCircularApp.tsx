import { Suspense, createContext, lazy, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Moon, Plus, Sun } from 'lucide-react';
import ClientMap from '../map/ClientMap';
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/api';
import type { Buyer, Material, Generator } from '@mapa/core/data';
import { assumptionValues, availableStates, rankBuyers, viableRadiusMapKm, type RankedBuyer } from '@mapa/core/match';
import { formatArs, formatNumber, formatTons } from '@mapa/core/format';
import type { MaterialState, TrafficLight } from '@mapa/core/viability';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { setTheme, useTheme } from '@/lib/theme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssumptionsEditor from '../panel/AssumptionsEditor';
import BuyerRanking, { orderRanking } from '../panel/BuyerRanking';
import DataUsed, { type DataItem } from '../panel/DataUsed';
import Filters from '../panel/Filters';
import GeneratorPicker from '../panel/GeneratorPicker';
import MatchDetail, { Answer } from '../panel/MatchDetail';
import RadiusSummary from '../panel/RadiusSummary';
import StateSelector from '../panel/StateSelector';
import KpiStrip, { type Kpi } from '../panel/KpiStrip';
import type { StateStat } from '../panel/StateSelector';
import { initialState, reducer, type AppState } from './state';
import { insertListing, selectionAfterCreate } from '../listing/after-create';
import { inNea, type LatLng } from '../listing/form';
import ListingInfo from '../listing/ListingInfo';
import { useCatalog } from './useCatalog';

// El formulario (y el Select de Radix) se carga recién al tocar "Publicar".
const PublishDialog = lazy(() => import('../listing/PublishDialog'));

const DEFAULT_GENERATOR = 'molinos-ala-mercedes';
const TITLE = 'Mapa Circular NEA — ¿Cierra el negocio?';
const WIDE_QUERY = '(min-width: 1024px)';
/** Mobile: la hoja arranca mostrando el bloque fijo (planta, estado, respuesta) y las pestañas. */
const SHEET_PEEK = 470;
const PANEL_W = 400;

function useWide(): boolean {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const m = window.matchMedia(WIDE_QUERY);
    const onChange = () => setWide(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);
  return wide;
}

/** Alterna modo claro / oscuro (se recuerda; sin elección, sigue al sistema). */
function ThemeToggle() {
  const theme = useTheme();
  const light = theme === 'light';
  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={light ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      aria-pressed={light}
      onClick={() => setTheme(light ? 'dark' : 'light')}
      className="inline-flex size-7 items-center justify-center rounded-md text-fg-muted transition-colors duration-120 ease-out hover:bg-surface-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-selection"
    >
      {light ? <Moon size={15} aria-hidden="true" /> : <Sun size={15} aria-hidden="true" />}
    </button>
  );
}

/** Marca (copia de public/logo-mark.svg): trazos en currentColor (texto primario); el punto, salvia del tema activo. */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" width={20} height={20} aria-hidden="true" className="shrink-0 text-fg">
      <path d="M9.07 12 A8 8 0 0 1 22.93 12" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M22.93 20 A8 8 0 0 1 9.07 20" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
      <rect x={5.6} y={13.6} width={4.8} height={4.8} transform="rotate(45 8 16)" fill="currentColor" />
      <circle cx={24} cy={16} r={2.7} fill="var(--brand-dot)" />
    </svg>
  );
}

/** Marca chica flotante (el título completo es el h1 sr-only) con el selector de tema. */
function BrandPill() {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-surface/90 pr-1 pl-2.5 shadow-overlay backdrop-blur-md">
      <LogoMark />
      <span aria-hidden="true" className="text-small font-semibold tracking-tight text-fg">
        Circular NEA
      </span>
      <span aria-hidden="true" className="ml-0.5 h-4 w-px bg-line" />
      <ThemeToggle />
    </div>
  );
}

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

/** Aviso breve y discreto (live region siempre montada para que el lector lo anuncie). */
function Notice({ text, wide }: { text: string | null; wide: boolean }) {
  return (
    <div
      className="pointer-events-none absolute left-0 z-[1050] flex justify-center px-3"
      style={wide ? { right: PANEL_W + 16, bottom: 24 } : { right: 0, bottom: SHEET_PEEK + 12 }}
    >
      <p
        role="status"
        data-testid="notice"
        className={text ? 'rounded-lg border border-selection bg-surface px-3.5 py-2 text-small font-medium text-fg shadow-overlay' : 'sr-only'}
      >
        {text}
      </p>
    </div>
  );
}

/** Contacto o "Sin datos de contacto · Ver fuente". En mobile, ir a Fuentes también agranda la hoja. */
function EntityContact({ entity, onShowSources, className }: { entity: Generator | Buyer; onShowSources: () => void; className?: string }) {
  const expand = useContext(SheetContext);
  return (
    <ListingInfo
      entity={entity}
      className={className}
      onShowSources={() => {
        onShowSources();
        expand();
      }}
    />
  );
}

/**
 * Card flotante (desktop) u hoja inferior (mobile), con el mismo contenido.
 * La hoja es propia y NO modal: el Drawer de shadcn (vaul) siempre monta un Dialog modal de Radix, que pone
 * aria-hidden en #root y atrapa el foco; acá el mapa tiene que seguir usable con teclado y lector detrás.
 */
const SheetContext = createContext<() => void>(() => {});

function PanelShell({ wide, children }: { wide: boolean; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  if (wide) {
    return (
      <aside
        aria-label="Calculadora"
        className="absolute top-4 right-4 bottom-4 z-[1000] flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-overlay"
        style={{ width: PANEL_W }}
      >
        {children}
      </aside>
    );
  }
  return (
    <section
      aria-label="Calculadora"
      className="absolute inset-x-0 bottom-0 z-[1000] flex flex-col overflow-hidden rounded-t-2xl border-t border-border bg-surface shadow-[0_-8px_24px_-8px_rgb(0_0_0/0.12)] transition-[height] duration-300 ease-out"
      style={{ height: expanded ? '92dvh' : SHEET_PEEK }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? 'Achicar el panel' : 'Agrandar el panel'}
        onClick={() => setExpanded((v) => !v)}
        className="flex h-6 w-full shrink-0 items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-selection"
      >
        <span aria-hidden="true" className="h-1 w-10 rounded-full bg-faint" />
      </button>
      <SheetContext.Provider value={() => setExpanded(true)}>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SheetContext.Provider>
    </section>
  );
}

function ErrorState({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
  return (
    <div role="alert" className="space-y-3 p-6 text-center">
      <p className="text-heading text-fg">{title}</p>
      <p className="text-small text-fg-muted">{detail}</p>
      <Button onClick={onAction} className="h-9 px-4 text-body">
        {action}
      </Button>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="space-y-3 p-4">
      <p role="status" className="text-small text-fg-subtle">
        Cargando datos…
      </p>
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-9 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-9 rounded-lg" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  );
}

/** Tabs del panel; en mobile, elegir una pestaña agranda la hoja. */
function SheetTabs({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) {
  const expand = useContext(SheetContext);
  return (
    <Tabs
      value={value}
      onValueChange={(v) => {
        onValueChange(v);
        expand();
      }}
      className="flex min-h-0 flex-1 flex-col gap-0"
    >
      {children}
    </Tabs>
  );
}

const TAB_TRIGGER =
  'h-full text-small font-medium text-fg-muted hover:text-fg focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-selection data-active:bg-surface data-active:text-fg data-active:shadow-overlay';
const TAB_CONTENT = 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-5';

interface Derived {
  states: MaterialState[];
  state: MaterialState;
  ranking: RankedBuyer[];
  lights: Record<string, TrafficLight>;
  mapKm: number;
  roadKm: number;
  values: ReturnType<typeof assumptionValues>;
  buyers: CatalogResponse['buyers'];
}

function dataItems(catalog: CatalogResponse, generator: Generator, material: Material, d: Derived, selected: RankedBuyer | undefined): DataItem[] {
  const items: DataItem[] = [];
  const spec = material.states[d.state];
  if (spec) {
    items.push(
      { label: 'Precio de venta', valueText: `${formatArs(spec.pricePerTon.value)}/t`, tagged: spec.pricePerTon },
      { label: 'Densidad', valueText: `${formatNumber(spec.bulkDensityTPerM3.value * 1000)} kg/m³`, tagged: spec.bulkDensityTPerM3 },
      { label: 'Poder calorífico (PCI)', valueText: `${formatNumber(spec.lhvMJPerKg.value, 1)} MJ/kg`, tagged: spec.lhvMJPerKg },
    );
  }
  const costPerKm = catalog.assumptions.find((a) => a.key === 'costPerKm');
  const routeFactor = catalog.assumptions.find((a) => a.key === 'routeFactor');
  if (costPerKm) items.push({ label: 'Costo por km', valueText: `${formatArs(d.values.costPerKm)}/km`, tagged: costPerKm });
  if (routeFactor) items.push({ label: 'Factor de ruta', valueText: `× ${formatNumber(d.values.routeFactor, 2)}`, tagged: routeFactor });
  if (selected) {
    // La demanda está en t/mes del combustible que el comprador usa hoy; el modelo la convierte por energía.
    const alt = catalog.alternatives.find((a) => a.id === selected.buyer.currentAlternative);
    const fuel = alt ? alt.name.split(' (')[0] : 'su combustible';
    items.push({ label: `Consumo actual del comprador (${fuel})`, valueText: `${formatTons(selected.buyer.demandTonsPerMonth.value)}/mes`, tagged: selected.buyer.demandTonsPerMonth });
    if (alt) items.push({ label: `Precio de ${fuel}`, valueText: `${formatArs(alt.pricePerUnit.value)}/${alt.unit}`, tagged: alt.pricePerUnit });
  }
  items.push({ label: 'Generación de la planta', valueText: `${formatTons(generator.tonsPerMonth.value)}/mes`, tagged: generator.tonsPerMonth });
  return items;
}

function derive(catalog: CatalogResponse, generator: Generator, material: Material, app: AppState): Derived {
  const states = availableStates(material);
  const state = states.includes(app.state) ? app.state : 'suelto';
  const buyers = catalog.buyers.filter((b) => app.sectors.length === 0 || app.sectors.includes(b.sector));
  const ranking = orderRanking(
    rankBuyers({
      generator,
      state,
      buyers,
      materials: catalog.materials,
      alternatives: catalog.alternatives,
      assumptions: catalog.assumptions,
      overrides: app.overrides,
    }),
  );
  const lights: Record<string, TrafficLight> = {};
  for (const r of ranking) lights[r.buyer.id] = r.result.light;
  const mapKm = viableRadiusMapKm(material, state, catalog.assumptions, app.overrides);
  const values = assumptionValues(catalog.assumptions, app.overrides);
  return { states, state, buyers, ranking, lights, mapKm, roadKm: mapKm * values.routeFactor, values };
}

type PublishMode = 'closed' | 'form' | 'picking';

function Loaded({ catalog, wide, onListingCreated }: { catalog: CatalogResponse; wide: boolean; onListingCreated: (created: ListingCreatedResponse) => void }) {
  const [app, dispatch] = useReducer(
    reducer,
    catalog.generators.some((g) => g.id === DEFAULT_GENERATOR) ? DEFAULT_GENERATOR : (catalog.generators[0]?.id ?? ''),
    initialState,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [hotBuyerId, setHotBuyerId] = useState<string | null>(null);
  const [tab, setTab] = useState('compradores');
  const [publishMode, setPublishMode] = useState<PublishMode>('closed');
  /** Una vez abierto, el formulario queda montado (oculto) para no perder el borrador. */
  const [publishLoaded, setPublishLoaded] = useState(false);
  const [returningFromPick, setReturningFromPick] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<LatLng | null>(null);
  const [pickMessage, setPickMessage] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ key: number; points: [number, number][] } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const cancelPick = useCallback(() => {
    setPickMessage(null);
    setReturningFromPick(true);
    setPublishMode('form');
  }, []);

  const generator = catalog.generators.find((g) => g.id === app.selectedGeneratorId);
  const material = catalog.materials.find((m) => m.id === generator?.materialId);

  const derived = useMemo(() => {
    if (!generator || !material) return null;
    try {
      return { ok: true as const, d: derive(catalog, generator, material, app) };
    } catch (e) {
      console.error(e);
      return { ok: false as const };
    }
  }, [catalog, generator, material, app]);

  const insets = wide ? { top: 0, right: PANEL_W + 16, bottom: 0, left: 0 } : { top: 180, right: 0, bottom: SHEET_PEEK, left: 0 };

  if (!generator || !material || !derived) {
    return (
      <PanelShell wide={wide}>
        <p className="p-6 text-body text-fg-muted">No hay plantas cargadas en el catálogo.</p>
      </PanelShell>
    );
  }
  if (!derived.ok) {
    return (
      <PanelShell wide={wide}>
        <ErrorState
          title="No se pudo calcular el resultado"
          detail="Revisá los valores de los supuestos o restablecelos para volver a los originales."
          action="Restablecer supuestos"
          onAction={() => dispatch({ type: 'resetOverrides' })}
        />
      </PanelShell>
    );
  }

  const d = derived.d;
  const handleSelectGenerator = (id: string) => {
    const g = catalog.generators.find((x) => x.id === id);
    const m = catalog.materials.find((x) => x.id === g?.materialId);
    dispatch({ type: 'selectGenerator', id, availableStates: m ? availableStates(m) : ['suelto'] });
  };
  const selected = d.ranking.find((r) => r.buyer.id === app.selectedBuyerId) ?? d.ranking[0];
  const selectedBuyerId = selected?.buyer.id ?? null;
  const selectedAlternative = selected ? catalog.alternatives.find((a) => a.id === selected.buyer.currentAlternative) : undefined;
  const counts = { verde: 0, amarillo: 0, rojo: 0 };
  for (const r of d.ranking) counts[r.result.light] += 1;
  const mapGenerators = catalog.generators.filter(
    (g) => g.id === generator.id || app.materials.length === 0 || app.materials.includes(g.materialId),
  );
  const items = dataItems(catalog, generator, material, d, selected);
  const stats: Partial<Record<MaterialState, StateStat>> = {};
  for (const st of d.states) {
    try {
      const alt = st === d.state ? d : derive(catalog, generator, material, { ...app, state: st });
      stats[st] = { radiusKm: alt.roadKm, closes: alt.ranking.filter((r) => r.result.light === 'verde').length };
    } catch {
      /* sin dato para ese estado */
    }
  }
  const STATE_WORD: Record<MaterialState, string> = { suelto: 'suelto', compactado: 'compactado', pellet: 'en pellet' };
  const kpis: Kpi[] = [
    { label: 'Plantas', value: formatNumber(catalog.generators.length), sub: `${mapGenerators.length} en el mapa` },
    {
      label: 'Toneladas/mes',
      value: formatNumber(catalog.generators.reduce((sum, g) => sum + g.tonsPerMonth.value, 0)),
      sub: 'disponibles',
    },
    { label: 'Compradores', value: formatNumber(catalog.buyers.length), sub: `${d.ranking.length} para este material` },
    {
      label: 'Cierran',
      value: `${counts.verde} de ${d.ranking.length}`,
      sub: `vendiendo ${STATE_WORD[d.state]}`,
      tone: counts.verde > 0 ? 'ok' : 'bad',
    },
  ];
  const edited = Object.keys(app.overrides).length > 0;
  const picking = publishMode === 'picking';

  const handlePick = (ll: LatLng) => {
    if (!inNea(ll)) {
      setPickMessage('Ese punto queda fuera del NEA. Tocá un punto dentro de la región.');
      return;
    }
    setPickedLocation(ll);
    setPickMessage(null);
    setReturningFromPick(true);
    setPublishMode('form');
  };

  const handleCreated = (created: ListingCreatedResponse) => {
    onListingCreated(created);
    const next = insertListing(catalog, created);
    const sel = selectionAfterCreate(next, generator.id, created);
    const g = next.generators.find((x) => x.id === sel.generatorId);
    const m = next.materials.find((x) => x.id === g?.materialId);
    if (sel.generatorId !== generator.id || created.kind === 'oferta') {
      dispatch({ type: 'selectGenerator', id: sel.generatorId, availableStates: m ? availableStates(m) : ['suelto'] });
    }
    if (created.kind === 'demanda') {
      const b = created.listing as Buyer;
      if (app.sectors.length > 0 && !app.sectors.includes(b.sector)) dispatch({ type: 'clearFilters' });
      if (sel.buyerId) dispatch({ type: 'selectBuyer', id: sel.buyerId });
      setTab('compradores');
      if (g) setFocus({ key: Date.now(), points: [[g.location.lat, g.location.lng], [b.location.lat, b.location.lng]] });
    }
    setPickedLocation(null);
    setReturningFromPick(false);
    setPublishMode('closed');
    setNotice(created.kind === 'oferta' ? 'Publicación creada. Ya es tu planta en el mapa.' : 'Publicación creada. Ya aparece entre los compradores.');
  };

  return (
    <>
      <div className="absolute inset-0" data-testid="map-container">
        <ClientMap
          generators={mapGenerators}
          buyers={d.buyers}
          selectedGeneratorId={generator.id}
          selectedBuyerId={selectedBuyerId}
          radiusKm={d.mapKm}
          buyerLights={d.lights}
          onSelectGenerator={handleSelectGenerator}
          onSelectBuyer={(id) => dispatch({ type: 'selectBuyer', id })}
          hotBuyerId={hotBuyerId}
          onHoverBuyer={setHotBuyerId}
          insets={insets}
          wide={wide}
          picking={picking}
          onPick={handlePick}
          onCancelPick={cancelPick}
          pickMessage={pickMessage}
          draftPin={publishMode !== 'closed' ? pickedLocation : null}
          focus={focus}
        />
      </div>

      {!picking && (
        <div className={wide ? 'absolute top-3 left-3 z-[1000] flex items-start gap-2' : 'absolute inset-x-0 top-3 z-[1000] space-y-2 px-3'} style={wide ? { right: PANEL_W + 40 } : undefined}>
          <div className="flex items-center gap-2">
            <BrandPill />
            <PublishButton
              onClick={() => {
                setPublishLoaded(true);
                setPublishMode('form');
              }}
            />
          </div>
          <KpiStrip items={kpis} compact={!wide} />
        </div>
      )}

      {publishLoaded && (
        <Suspense fallback={null}>
          <PublishDialog
            open={publishMode === 'form'}
            onOpenChange={(open) => {
              setPublishMode(open ? 'form' : 'closed');
              if (!open) setReturningFromPick(false);
            }}
            materials={catalog.materials}
            location={pickedLocation}
            onLocationChange={setPickedLocation}
            onRequestPick={() => {
              setPickMessage(null);
              setPublishMode('picking');
            }}
            returningFromPick={returningFromPick}
            onCreated={handleCreated}
          />
        </Suspense>
      )}
      <Notice text={notice} wide={wide} />

      <PanelShell wide={wide}>
        {/* Bloque fijo: dónde estoy y la respuesta. */}
        <div className="space-y-3 border-b border-border px-4 pt-3 pb-4">
          <div>
            <GeneratorPicker generators={catalog.generators} materials={catalog.materials} selectedId={generator.id} onSelect={handleSelectGenerator} />
            <EntityContact entity={generator} onShowSources={() => setTab('fuentes')} className="mt-1" />
          </div>
          <StateSelector value={d.state} available={d.states} materialName={material.name} stats={stats} onChange={(s) => dispatch({ type: 'setState', state: s })} />
          <RadiusSummary roadKm={d.roadKm} mapKm={d.mapKm} />
          {selected ? (
            <Answer
              buyer={selected.buyer}
              alternative={selectedAlternative}
              result={selected.result}
              threshold={d.values.greenThreshold}
              generatorId={generator.id}
              state={d.state}
              contact={<EntityContact entity={selected.buyer} onShowSources={() => setTab('fuentes')} />}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-small text-fg-muted">Ningún comprador compra este material.</p>
          )}
        </div>

        <SheetTabs value={tab} onValueChange={setTab}>
          <TabsList className="mx-4 mt-3 grid h-9 w-auto shrink-0 grid-cols-4 rounded-lg bg-surface-subtle p-0.5">
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
                selectedBuyerId={selectedBuyerId}
                onSelect={(id) => dispatch({ type: 'selectBuyer', id })}
                hotBuyerId={hotBuyerId}
                onHover={setHotBuyerId}
                filtered={app.sectors.length > 0}
                onClearFilters={() => dispatch({ type: 'clearFilters' })}
              />
            </div>
          </TabsContent>

          <TabsContent value="detalle" className={TAB_CONTENT}>
            {selected ? (
              <MatchDetail buyer={selected.buyer} alternative={selectedAlternative} result={selected.result} radiusKm={d.roadKm} threshold={d.values.greenThreshold} />
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
            <p className="mb-1 text-small text-fg-muted">Cada valor dice si es real o estimado. Tocá la i para ver la fuente.</p>
            <DataUsed items={items} sources={catalog.sources} />
          </TabsContent>
        </SheetTabs>

        {!wide && <div aria-hidden="true" className="shrink-0 pb-[env(safe-area-inset-bottom)]" />}
      </PanelShell>
    </>
  );
}

export default function MapCircularApp() {
  const { state, retry, addListing } = useCatalog();
  const wide = useWide();
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <h1 className="sr-only">{TITLE}</h1>
      {state.status === 'ready' ? (
        <Loaded catalog={state.catalog} wide={wide} onListingCreated={addListing} />
      ) : (
        <>
          <Skeleton className="absolute inset-0 rounded-none" />
          <PanelShell wide={wide}>
            {state.status === 'loading' ? (
              <LoadingPanel />
            ) : (
              <ErrorState title="No se pudo cargar el catálogo" detail={`Revisá la conexión y reintentá. (${state.message})`} action="Reintentar" onAction={retry} />
            )}
          </PanelShell>
        </>
      )}
      {!wide && state.status !== 'ready' && (
        <div className="absolute top-3 left-3 z-[1000]">
          <BrandPill />
        </div>
      )}
    </div>
  );
}
