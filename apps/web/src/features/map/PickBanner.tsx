import { useEffect, useRef } from 'react';
import { Crosshair } from 'lucide-react';
import type L from 'leaflet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Banner del modo marcado: instrucción (o error), "Usar el centro" (para teclado) y "Cancelar". Esc también cancela. */
export default function PickBanner({
  map,
  message,
  onPick,
  onCancel,
}: {
  map: L.Map | null;
  message: string | null;
  onPick?: (ll: { lat: number; lng: number }) => void;
  onCancel?: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[1050] flex justify-center">
      <div
        data-testid="pick-banner"
        className="pointer-events-auto flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-selection bg-surface/95 py-2 pr-2 pl-3.5 shadow-overlay backdrop-blur-md"
      >
        <Crosshair size={16} aria-hidden="true" className="shrink-0 text-selection" />
        <p role="status" className={cn('min-w-0 flex-1 text-small font-medium text-pretty', message ? 'text-warn' : 'text-fg')}>
          {message ?? 'Tocá el mapa para ubicar tu establecimiento'}
        </p>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const c = map?.getCenter();
              if (c) onPick?.({ lat: c.lat, lng: c.lng });
            }}
            className="h-8 px-2.5 text-small text-fg-muted"
          >
            Usar el centro
          </Button>
          <Button ref={cancelRef} type="button" variant="outline" data-testid="pick-cancel" onClick={onCancel} className="h-8 px-3 text-small">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
