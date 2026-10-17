import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
/**
 * Card flotante a la derecha con la calculadora. Ancho fluido (--panel-w); si la pantalla es baja
 * y el contenido no entra, el panel entero scrollea.
 */
export default function PanelShell({ children, ref }: { children: React.ReactNode; ref?: React.Ref<HTMLElement> }) {
  return (
    <aside
      ref={ref}
      aria-label="Calculadora"
      className="absolute top-4 right-4 bottom-4 z-[1000] flex w-(--panel-w) flex-col panel-scroll overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface shadow-overlay"
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
