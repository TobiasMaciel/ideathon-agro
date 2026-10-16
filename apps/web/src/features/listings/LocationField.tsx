import { Crosshair, Loader2, LocateFixed, MapPin } from 'lucide-react';
import type { LatLng } from '@mapa/core/contracts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { coordText } from './form-ui';

interface Props {
  location: LatLng | null;
  locality: string;
  error: string | undefined;
  /** Cierra el diálogo y deja marcar la ubicación en el mapa. */
  onRequestPick: () => void;
  canGeolocate: boolean;
  locating: boolean;
  onLocate: () => void;
}

/** Ubicación del establecimiento: lo marcado (localidad + coordenadas), "Marcar en el mapa" y "Usar mi ubicación". */
export default function LocationField({ location, locality, error, onRequestPick, canGeolocate, locating, onLocate }: Props) {
  return (
    <div>
      <p id="listing-location-label" className="mb-1.5 text-small font-medium text-fg-muted">
        Ubicación
      </p>
      <div
        className={cn(
          'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border px-3 py-2.5',
          error ? 'border-bad' : location ? 'border-line' : 'border-dashed border-line-strong',
        )}
      >
        <MapPin size={16} aria-hidden="true" className={cn('shrink-0', location ? 'text-selection' : 'text-fg-subtle')} />
        <p className="min-w-0 flex-1 text-small" data-testid="listing-location-value">
          {location ? (
            <>
              {locality.trim() && <span className="mr-2 text-fg">{locality.trim()}</span>}
              <span className="font-mono text-fg-muted tabular-nums">{coordText(location)}</span>
            </>
          ) : (
            <span className="text-fg-subtle">Sin marcar</span>
          )}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          type="button"
          id="listing-location"
          variant="outline"
          data-testid="pick-on-map"
          aria-describedby={['listing-location-label', error ? 'listing-location-error' : null].filter(Boolean).join(' ')}
          onClick={onRequestPick}
          className="h-9 px-3 text-body"
        >
          <Crosshair aria-hidden="true" />
          {location ? 'Cambiar en el mapa' : 'Marcar en el mapa'}
        </Button>
        {canGeolocate && (
          <Button type="button" variant="ghost" onClick={onLocate} aria-disabled={locating || undefined} className="h-9 px-3 text-body text-fg-muted">
            {locating ? <Loader2 aria-hidden="true" className="animate-spin" /> : <LocateFixed aria-hidden="true" />}
            {locating ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
          </Button>
        )}
      </div>
      {error && (
        <p id="listing-location-error" className="mt-1 text-caption text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
