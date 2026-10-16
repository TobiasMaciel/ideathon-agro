// Publicaciones abiertas (F1): lo que declara un usuario, sin cuenta ni verificación.
import type { AlternativeId, BuyerSector, ListingKind, MaterialId } from '../enums';
import { ALTERNATIVE_IDS, BUYER_SECTORS, LISTING_KINDS, MATERIAL_IDS } from '../enums';

export type { ListingKind };

/** Contacto de quien publica. Nunca viaja en el catálogo: se revela con GET /api/listings/:id/contact. */
export interface ListingContact {
  name?: string;
  /** WhatsApp / teléfono AR: dígitos, espacios, +, -, paréntesis (8–20 caracteres). */
  phone?: string;
  email?: string;
}

export interface ListingInput {
  kind: ListingKind;
  name: string;
  locality?: string;
  lat: number;
  lng: number;
  materialId: MaterialId;
  tonsPerMonth: number;
  /** Solo oferta, 0–0.7. Informativa: el modelo usa `material.rawMoisture` del catálogo. */
  moisture?: number;
  /** Solo oferta. */
  seasonality?: string;
  /** Solo demanda: combustible que usa hoy. */
  currentAlternative?: AlternativeId;
  /** Solo demanda. */
  sector?: BuyerSector;
  /** Al menos `phone` o `email`. */
  contact: ListingContact;
}

export type ListingValidation = { ok: true; value: ListingInput } | { ok: false; errors: string[] };

/** Publicación persistida (en Postgres o en memoria). `id` es el uuid sin el prefijo `pub-`. */
export interface StoredListing {
  id: string;
  createdAt: string;
  input: ListingInput;
}

// Valores aceptados al publicar: los mismos enums del dominio (domain/enums.ts).
export { LISTING_KINDS };
export const LISTING_MATERIALS: readonly MaterialId[] = MATERIAL_IDS;
export const LISTING_ALTERNATIVES: readonly AlternativeId[] = ALTERNATIVE_IDS;
export const LISTING_SECTORS: readonly BuyerSector[] = BUYER_SECTORS;

/** Caja del NEA aceptada para ubicar una publicación. */
export const LISTING_BOUNDS = { latMin: -31.5, latMax: -25.5, lngMin: -60.5, lngMax: -53 } as const;
export const LISTING_TONS = { min: 1, max: 100000 } as const;
export const LISTING_MAX_MOISTURE = 0.7;
