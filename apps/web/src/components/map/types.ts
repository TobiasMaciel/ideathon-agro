// Contrato entre la página (estado) y el mapa (presentación). El mapa no calcula nada.
import type { Buyer, Generator } from '@mapa/core/data';
import type { TrafficLight } from '@mapa/core/viability';

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
  /** Comprador resaltado desde el ranking (hover o foco en la fila); null = ninguno. */
  hotBuyerId: string | null;
  /** El puntero entra o sale de un pin de comprador (para resaltar su fila). */
  onHoverBuyer: (id: string | null) => void;
  /** Px del mapa tapados por la UI flotante (panel a la derecha en desktop, drawer abajo en mobile). */
  insets: { top: number; right: number; bottom: number; left: number };
  /** Desktop: leyenda y atribución abajo a la izquierda. Mobile: arriba a la derecha (abajo está el drawer). */
  wide: boolean;
}
