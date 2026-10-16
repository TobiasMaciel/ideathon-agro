// Funciones puras de estilo para los marcadores del mapa (sin dependencias de Leaflet en runtime).
import type { MaterialId } from '@/data/types';
import type { TrafficLight } from '@/lib/viability/types';

export const LIGHT_COLORS = {
  verde: '#16a34a',
  amarillo: '#ca8a04',
  rojo: '#dc2626',
  sinEvaluar: '#94a3b8',
} as const;

/** Paleta apta para daltonismo (Okabe-Ito). */
export const MATERIAL_COLORS: Record<MaterialId, string> = {
  aserrin: '#e69f00',
  chips: '#0072b2',
  costaneros: '#cc79a7',
  cascarilla: '#8c6d31',
};

export const MATERIAL_LABELS: Record<MaterialId, string> = {
  aserrin: 'Aserrín',
  chips: 'Chips',
  costaneros: 'Costaneros',
  cascarilla: 'Cascarilla',
};

export const LIGHT_LABELS: Record<TrafficLight | 'sinEvaluar', string> = {
  verde: 'Viable',
  amarillo: 'Ajustado',
  rojo: 'No viable',
  sinEvaluar: 'Sin evaluar',
};

export function lightColor(light: TrafficLight | undefined): string {
  return light ? LIGHT_COLORS[light] : LIGHT_COLORS.sinEvaluar;
}

export interface MarkerStyle {
  radius: number;
  pathOptions: {
    className: string;
    color: string;
    weight: number;
    fillColor: string;
    fillOpacity: number;
    dashArray?: string;
  };
}

export function generatorStyle(materialId: MaterialId, selected: boolean, id: string): MarkerStyle {
  return {
    radius: selected ? 12 : 8,
    pathOptions: {
      className: `gen-${id}`,
      color: '#111827',
      weight: selected ? 4 : 2,
      fillColor: MATERIAL_COLORS[materialId],
      fillOpacity: 0.95,
    },
  };
}

export function buyerStyle(light: TrafficLight | undefined, selected: boolean, id: string): MarkerStyle {
  return {
    radius: selected ? 11 : 7,
    pathOptions: {
      className: `buyer-${id}`,
      color: '#111827',
      weight: selected ? 4 : 2,
      dashArray: '3 3',
      fillColor: lightColor(light),
      fillOpacity: 0.95,
    },
  };
}
