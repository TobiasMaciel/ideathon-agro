// Textos de UI para los enums del dominio: un solo lugar para cada vocabulario.
import type { AlternativeId, BuyerSector, GeneratorKind, MaterialId, MaterialState, TrafficLight } from '@mapa/core/contracts';

/** Semáforo: el mismo vocabulario en panel, mapa y leyenda. `sinEvaluar` = el comprador no compra ese material. */
export const LIGHT_LABELS: Record<TrafficLight | 'sinEvaluar', string> = {
  verde: 'Cierra',
  amarillo: 'Justo',
  rojo: 'No cierra',
  sinEvaluar: 'No compra este material',
};

export const SECTOR_SINGULAR: Record<BuyerSector, string> = {
  yerbatera: 'Yerbatera',
  central_biomasa: 'Central de biomasa',
  citricola: 'Citrícola',
  secadero_granos: 'Secadero de granos',
  frigorifico: 'Frigorífico',
};

/** Plural, para los filtros ("Compradores: Yerbateras, Frigoríficos…"). */
export const SECTOR_PLURAL: Record<BuyerSector, string> = {
  yerbatera: 'Yerbateras',
  central_biomasa: 'Centrales de biomasa',
  citricola: 'Citrícolas',
  secadero_granos: 'Secaderos de granos',
  frigorifico: 'Frigoríficos',
};

export const MATERIAL_LABELS: Record<MaterialId, string> = {
  aserrin: 'Aserrín',
  chips: 'Chips',
  costaneros: 'Costaneros',
  cascarilla: 'Cascarilla',
};

export const GENERATOR_KIND_LABELS: Record<GeneratorKind, string> = {
  aserradero: 'Aserradero',
  foresto_industria: 'Foresto-industria',
  molino_arrocero: 'Molino arrocero',
};

export const ALTERNATIVE_LABELS: Record<AlternativeId, string> = { glp: 'GLP', lena: 'Leña' };

export const STATE_LABELS: Record<MaterialState, string> = { suelto: 'Suelto', compactado: 'Compactado', pellet: 'Pellet' };
