// Contrato entre la página (estado) y el mapa (presentación). El mapa no calcula nada.
import type { Buyer, Generator } from '@/data/types';
import type { TrafficLight } from '@/lib/viability/types';

export interface MapViewProps {
  /** Generadores ya filtrados por la página. */
  generators: Generator[];
  /** Compradores ya filtrados por la página. */
  buyers: Buyer[];
  selectedGeneratorId: string | null;
  selectedBuyerId: string | null;
  /**
   * Radio de viabilidad en km de LÍNEA RECTA alrededor del generador elegido (B2).
   * null = no dibujar círculo.
   */
  radiusKm: number | null;
  /** Semáforo por comprador para el generador y estado elegidos; ausente = comprador sin evaluar (gris). */
  buyerLights: Record<string, TrafficLight>;
  onSelectGenerator: (id: string) => void;
  onSelectBuyer: (id: string) => void;
}
