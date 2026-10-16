import type { Alternative, Buyer, ViabilityResult } from '@mapa/core/contracts';

export interface MatchProps {
  buyer: Buyer;
  alternative: Alternative | undefined;
  result: ViabilityResult;
}

/** Nombre del combustible que el comprador usa hoy, para las frases ("más caro que GLP"). */
export function altName(alternative: Alternative | undefined): string {
  return alternative ? (alternative.id === 'glp' ? 'GLP' : 'la leña') : 'su combustible actual';
}
