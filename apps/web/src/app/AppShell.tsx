import { Skeleton } from '@/components/ui/skeleton';
import { useCatalog } from '@/features/catalog';
import PanelShell, { PanelError, PanelLoading } from './PanelShell';
import Workspace from './Workspace';
import { TITLE } from './layout';

/** Pantalla única de escritorio: mapa a pantalla completa con la calculadora flotante. */
export default function AppShell() {
  const { state, retry, addListing, replace } = useCatalog();
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      <h1 className="sr-only">{TITLE}</h1>
      {state.status === 'ready' ? (
        <Workspace catalog={state.catalog} onListingCreated={addListing} onCatalogUpdate={replace} />
      ) : (
        <>
          <Skeleton className="absolute inset-0 rounded-none" />
          <PanelShell>
            {state.status === 'loading' ? (
              <PanelLoading />
            ) : (
              <PanelError title="No se pudo cargar el catálogo" detail={`Revisá la conexión y reintentá. (${state.message})`} action="Reintentar" onAction={retry} />
            )}
          </PanelShell>
        </>
      )}
    </div>
  );
}
