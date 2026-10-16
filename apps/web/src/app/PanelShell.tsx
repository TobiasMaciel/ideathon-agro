import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PANEL_W } from './layout';

/** Card flotante a la derecha con la calculadora. */
export default function PanelShell({ children }: { children: React.ReactNode }) {
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

export function PanelError({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
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

export function PanelLoading() {
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
