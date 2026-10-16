// Valores cerrados del dominio: fuente única. Los tipos se derivan de las listas (`as const`), así que
// agregar un valor acá lo suma al tipo, a la validación de publicaciones y a los filtros de la API.

export const MATERIAL_IDS = ['aserrin', 'chips', 'costaneros', 'cascarilla'] as const;
export type MaterialId = (typeof MATERIAL_IDS)[number];

/** Estados de acondicionamiento, en orden de menor a mayor procesamiento. */
export const MATERIAL_STATES = ['suelto', 'compactado', 'pellet'] as const;
export type MaterialState = (typeof MATERIAL_STATES)[number];

export const BUYER_SECTORS = ['yerbatera', 'central_biomasa', 'citricola', 'secadero_granos', 'frigorifico'] as const;
export type BuyerSector = (typeof BUYER_SECTORS)[number];

export const ALTERNATIVE_IDS = ['glp', 'lena'] as const;
export type AlternativeId = (typeof ALTERNATIVE_IDS)[number];

export const GENERATOR_KINDS = ['aserradero', 'molino_arrocero', 'foresto_industria'] as const;
export type GeneratorKind = (typeof GENERATOR_KINDS)[number];

export const LISTING_KINDS = ['oferta', 'demanda'] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

export const DATA_LABELS = ['real', 'estimado'] as const;
export type DataLabel = (typeof DATA_LABELS)[number];

/** Type guard: `value` es uno de los elementos de `list`. */
export const isOneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);
