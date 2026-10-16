/**
 * Trayecto del margen ("93,2 % → 98,2 %") en la card de resultado. Solo tiene sentido al cambiar de estado
 * (suelto / compactado / pellet) con la misma planta y el mismo comprador: cualquier otro cambio lo resetea.
 */
export interface MarginTrack {
  /** Planta + comprador. */
  key: string;
  state: string;
  value: number;
  /** Margen antes del último cambio de estado; null = sin flecha. */
  from: number | null;
}

export function nextTrack(prev: MarginTrack, key: string, state: string, value: number): MarginTrack {
  if (prev.key === key && prev.state === state && prev.value === value) return prev;
  const stateChange = prev.key === key && prev.state !== state;
  return { key, state, value, from: stateChange ? prev.value : null };
}
