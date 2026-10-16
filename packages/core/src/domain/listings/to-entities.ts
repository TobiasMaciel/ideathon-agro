// Publicación -> entidad del catálogo (Generator si es oferta, Buyer si es demanda), sin contacto.
import type { Buyer, Generator, Tagged } from '../catalog';
import type { ListingInput, StoredListing } from './types';

const DECLARED_NOTE = 'declarado por quien publicó, sin verificar';
const declared = (value: number): Tagged => ({ value, tag: 'estimado', sourceIds: [], note: DECLARED_NOTE });
const LOCATION_NOTE = 'ubicación marcada por quien publicó';

/**
 * Oferta -> Generator. La humedad declarada NO cambia el material del catálogo: el modelo de cálculo usa
 * `material.rawMoisture`, igual que para los generadores curados. El contacto no se incluye.
 */
export function listingToGenerator(l: ListingInput, id: string, createdAt: string): Generator {
  return {
    id: `pub-${id}`,
    name: l.name,
    kind: l.materialId === 'cascarilla' ? 'molino_arrocero' : 'aserradero',
    locality: l.locality ?? '',
    location: { lat: l.lat, lng: l.lng },
    locationNote: LOCATION_NOTE,
    materialId: l.materialId,
    tonsPerMonth: declared(l.tonsPerMonth),
    seasonality: l.seasonality ?? 'Sin dato',
    sourceIds: [],
    origin: 'publicacion',
    verified: false,
    createdAt,
  };
}

/** Demanda -> Buyer. `tonsPerMonth` es el consumo mensual de su combustible actual (t del combustible). */
export function listingToBuyer(l: ListingInput, id: string, createdAt: string): Buyer {
  const currentAlternative = l.currentAlternative ?? 'lena';
  return {
    id: `pub-${id}`,
    name: l.name,
    sector: l.sector ?? 'secadero_granos',
    locality: l.locality ?? '',
    location: { lat: l.lat, lng: l.lng },
    locationNote: LOCATION_NOTE,
    currentAlternative,
    currentAlternativeTag: { value: currentAlternative, tag: 'estimado', sourceIds: [], note: DECLARED_NOTE },
    demandTonsPerMonth: declared(l.tonsPerMonth),
    accepts: [l.materialId],
    sourceIds: [],
    origin: 'publicacion',
    verified: false,
    createdAt,
  };
}

/** Publicación persistida -> Generator (oferta) o Buyer (demanda), sin contacto. */
export function storedToEntry(s: StoredListing): { kind: 'oferta'; generator: Generator } | { kind: 'demanda'; buyer: Buyer } {
  return s.input.kind === 'oferta'
    ? { kind: 'oferta', generator: listingToGenerator(s.input, s.id, s.createdAt) }
    : { kind: 'demanda', buyer: listingToBuyer(s.input, s.id, s.createdAt) };
}

