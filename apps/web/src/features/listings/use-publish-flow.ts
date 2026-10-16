import { useCallback, useState } from 'react';
import type { LatLng } from '@mapa/core/contracts';
import { inNea } from './form';

export type PublishMode = 'closed' | 'form' | 'picking';

const OUTSIDE_NEA = 'Ese punto queda fuera del NEA. Tocá un punto dentro de la región.';

/** Flujo "Publicar": diálogo abierto/cerrado, modo "marcar en el mapa" y la ubicación elegida. */
export function usePublishFlow() {
  const [mode, setMode] = useState<PublishMode>('closed');
  /** Una vez abierto, el formulario queda montado (oculto) para no perder el borrador. */
  const [loaded, setLoaded] = useState(false);
  const [returningFromPick, setReturningFromPick] = useState(false);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [pickMessage, setPickMessage] = useState<string | null>(null);

  const open = useCallback(() => {
    setLoaded(true);
    setMode('form');
  }, []);

  const onOpenChange = useCallback((isOpen: boolean) => {
    setMode(isOpen ? 'form' : 'closed');
    if (!isOpen) setReturningFromPick(false);
  }, []);

  const requestPick = useCallback(() => {
    setPickMessage(null);
    setMode('picking');
  }, []);

  const cancelPick = useCallback(() => {
    setPickMessage(null);
    setReturningFromPick(true);
    setMode('form');
  }, []);

  const pick = useCallback((ll: LatLng) => {
    if (!inNea(ll)) {
      setPickMessage(OUTSIDE_NEA);
      return;
    }
    setLocation(ll);
    setPickMessage(null);
    setReturningFromPick(true);
    setMode('form');
  }, []);

  /** Publicación creada: se cierra todo y se olvida la ubicación. */
  const finish = useCallback(() => {
    setLocation(null);
    setReturningFromPick(false);
    setMode('closed');
  }, []);

  return { mode, picking: mode === 'picking', loaded, returningFromPick, location, setLocation, pickMessage, open, onOpenChange, requestPick, cancelPick, pick, finish };
}
