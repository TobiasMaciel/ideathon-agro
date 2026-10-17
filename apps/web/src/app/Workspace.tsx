import { Suspense, lazy, useState } from 'react';
import type { CatalogResponse, ListingCreatedResponse } from '@mapa/core/contracts';
import { CalculatorPanel, buildKpis, mapGenerators, useCalculator, type PanelTab } from '@/features/calculator';
import { insertListing } from '@/features/catalog';
import { selectionAfterCreate, usePublishFlow } from '@/features/listings';
import { ClientMap } from '@/features/map';
import { NotificationBell, PublishMatches, pollIntervalMs, useCatalogPoll, useNotifications, type MatchItem, type Notification } from '@/features/notifications';
import IntroInvite from './IntroInvite';
import Notice from './Notice';
import PanelShell, { PanelError } from './PanelShell';
import TopBar from './TopBar';
import { MAP_FREE, mapInsets } from './layout';
import { useElementWidth } from './use-element-width';
import { useNotice } from './use-notice';

// El formulario (y el Select de Radix) se carga recién al tocar "Publicar".
const PublishDialog = lazy(() => import('@/features/listings/PublishDialog'));

type Focus = { key: number; points: [number, number][] };

/** La pantalla con el catálogo cargado: mapa, barra superior, panel de la calculadora y flujo de publicación. */
interface Props {
  catalog: CatalogResponse;
  onListingCreated: (created: ListingCreatedResponse) => void;
  /** La consulta periódica trajo un catálogo con publicaciones nuevas. */
  onCatalogUpdate: (catalog: CatalogResponse) => void;
}

export default function Workspace({ catalog, onListingCreated, onCatalogUpdate }: Props) {
  const calc = useCalculator(catalog);
  const publish = usePublishFlow();
  const notif = useNotifications(catalog);
  const [hotBuyerId, setHotBuyerId] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>('compradores');
  const [focus, setFocus] = useState<Focus | null>(null);
  const [notice, setNotice] = useNotice();
  const [matches, setMatches] = useState<MatchItem[] | null>(null);
  const [pollMs] = useState(() => pollIntervalMs(window.location.search));
  const [panelRef, panelWidth] = useElementWidth<HTMLElement>(400);
  const { app, dispatch, view, selectGenerator } = calc;

  useCatalogPoll(catalog, pollMs, (next, diff) => {
    onCatalogUpdate(next);
    const text = notif.announce(next, diff);
    if (text) setNotice(text);
  });

  if (view.kind === 'empty') {
    return (
      <PanelShell>
        <p className="p-6 text-body text-fg-muted">No hay plantas cargadas en el catálogo.</p>
      </PanelShell>
    );
  }
  if (view.kind === 'error') {
    return (
      <PanelShell>
        <PanelError
          title="No se pudo calcular el resultado"
          detail="Revisá los valores de los supuestos o restablecelos para volver a los originales."
          action="Restablecer supuestos"
          onAction={() => dispatch({ type: 'resetOverrides' })}
        />
      </PanelShell>
    );
  }

  const { generator, d, selected } = view;
  const onMap = mapGenerators(catalog, generator.id, app.materials);

  /** Muestra un negocio (planta + comprador) en el panel y lo encuadra en el mapa. */
  const showDeal = (generatorId: string, buyerId: string, from: CatalogResponse = catalog) => {
    const g = from.generators.find((x) => x.id === generatorId);
    const b = from.buyers.find((x) => x.id === buyerId);
    if (!g || !b) return;
    selectGenerator(g.id, from);
    if (app.sectors.length > 0 && !app.sectors.includes(b.sector)) dispatch({ type: 'clearFilters' });
    dispatch({ type: 'selectBuyer', id: b.id });
    setTab('compradores');
    setFocus({ key: Date.now(), points: [[g.location.lat, g.location.lng], [b.location.lat, b.location.lng]] });
  };

  const openNotification = (n: Notification) => {
    notif.markRead(n.id);
    if (n.counterpartKind === 'buyer') showDeal(n.myListingId, n.counterpartId);
    else showDeal(n.counterpartId, n.myListingId);
  };

  const handleCreated = (created: ListingCreatedResponse) => {
    onListingCreated(created);
    const next = insertListing(catalog, created);
    const sel = selectionAfterCreate(next, generator.id, created);
    if (created.kind === 'demanda' && sel.buyerId) showDeal(sel.generatorId, sel.buyerId, next);
    else if (created.kind === 'oferta') selectGenerator(sel.generatorId, next);
    else setTab('compradores');
    setMatches(notif.remember(created, next));
    publish.finish();
    setNotice(created.kind === 'oferta' ? 'Publicación creada. Ya es tu planta en el mapa.' : 'Publicación creada. Ya aparece entre los compradores.');
  };

  const openPublish = () => {
    setMatches(null);
    publish.open();
  };

  return (
    <>
      <div className="absolute inset-0" data-testid="map-container">
        <ClientMap
          generators={onMap}
          buyers={d.buyers}
          selectedGeneratorId={generator.id}
          selectedBuyerId={selected?.buyer.id ?? null}
          radiusKm={d.mapKm}
          buyerLights={d.lights}
          onSelectGenerator={(id) => selectGenerator(id)}
          onSelectBuyer={(id) => dispatch({ type: 'selectBuyer', id })}
          hotBuyerId={hotBuyerId}
          onHoverBuyer={setHotBuyerId}
          insets={mapInsets(panelWidth)}
          picking={publish.picking}
          onPick={publish.pick}
          onCancelPick={publish.cancelPick}
          pickMessage={publish.pickMessage}
          draftPin={publish.mode !== 'closed' ? publish.location : null}
          focus={focus}
        />
      </div>

      {!publish.picking && (
        <TopBar
          kpis={buildKpis(catalog, d, onMap.length)}
          onPublish={openPublish}
          actions={<NotificationBell notifications={notif.notifications} unread={notif.unread} onSelect={openNotification} onMarkAllRead={notif.markAllRead} />}
        />
      )}

      {publish.loaded && (
        <Suspense fallback={null}>
          <PublishDialog
            open={publish.mode === 'form'}
            onOpenChange={publish.onOpenChange}
            materials={catalog.materials}
            location={publish.location}
            onLocationChange={publish.setLocation}
            onRequestPick={publish.requestPick}
            returningFromPick={publish.returningFromPick}
            onCreated={handleCreated}
          />
        </Suspense>
      )}
      <IntroInvite hidden={!!notice || !!matches || publish.mode !== 'closed'} />
      <Notice text={notice} />
      {matches && !publish.picking && (
        <div className="pointer-events-none absolute z-[1040] flex justify-center px-3" style={{ ...MAP_FREE, bottom: 72 }}>
          <PublishMatches matches={matches} onClose={() => setMatches(null)} />
        </div>
      )}

      <PanelShell ref={panelRef}>
        <CalculatorPanel
          catalog={catalog}
          calc={calc}
          generator={generator}
          material={view.material}
          d={d}
          selected={selected}
          tab={tab}
          onTabChange={setTab}
          hotBuyerId={hotBuyerId}
          onHoverBuyer={setHotBuyerId}
        />
      </PanelShell>
    </>
  );
}
