import type {
  BuyerAlternative,
  FreightParams,
  LatLng,
  MaterialStateSpec,
  TrafficLight,
  TruckSpec,
  ViabilityInput,
  ViabilityResult,
} from './types';

export * from './types';

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/** Distancia en línea recta entre dos puntos (gran círculo), km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function routeDistanceKm(a: LatLng, b: LatLng, routeFactor: number): number {
  return haversineKm(a, b) * routeFactor;
}

/** Toneladas de producto tras secar de rawMoisture a productMoisture (base húmeda). */
export function productTons(rawTons: number, rawMoisture: number, productMoisture: number): number {
  if (productMoisture >= 1 || rawMoisture >= 1) return 0;
  if (productMoisture >= rawMoisture) return rawTons;
  return (rawTons * (1 - rawMoisture)) / (1 - productMoisture);
}

export function truckLoadTons(truck: TruckSpec, bulkDensityTPerM3: number): number {
  return Math.min(truck.maxTons, truck.volumeM3 * bulkDensityTPerM3);
}

export function tripsPerMonth(tons: number, loadTons: number): number {
  if (tons <= 0) return 0;
  return Math.ceil(tons / loadTons);
}

export function trafficLight(marginPct: number, greenThreshold: number): TrafficLight {
  if (marginPct >= greenThreshold) return 'verde';
  if (marginPct >= 0) return 'amarillo';
  return 'rojo';
}

/** Ahorro mensual del comprador frente a su alternativa actual. */
export function buyerSavings(tons: number, state: MaterialStateSpec, alt: BuyerAlternative): number {
  const cost = tons * state.pricePerTon;
  if (alt.kind === 'energia') {
    const altCost =
      ((tons * 1000 * state.lhvMJPerKg * alt.biomassEfficiency) / (alt.lhvMJPerUnit * alt.efficiency)) *
      alt.pricePerUnit;
    return altCost - cost;
  }
  return (tons / state.bulkDensityTPerM3) * alt.pricePerM3 - cost;
}

/** Radio máximo por ruta (km) con margen >= 0; 0 si el precio no cubre el acondicionamiento. */
export function maxViableDistanceKm(state: MaterialStateSpec, freight: FreightParams): number {
  const unitMargin = state.pricePerTon - state.conditioningCostPerTon;
  if (unitMargin <= 0) return 0;
  const load = truckLoadTons(freight.truck, state.bulkDensityTPerM3);
  return (unitMargin * load) / (2 * freight.costPerKm);
}

export function evaluateViability(input: ViabilityInput): ViabilityResult {
  const { state, freight } = input;
  const distanceKm = routeDistanceKm(input.origin, input.destination, freight.routeFactor);
  const tons = Math.min(
    productTons(input.rawTonsPerMonth, input.rawMoisture, state.moisture),
    input.buyerMaxTonsPerMonth,
  );
  const load = truckLoadTons(freight.truck, state.bulkDensityTPerM3);
  if (tons > 0 && !(load > 0)) throw new Error('Carga por camión inválida');
  const trips = tripsPerMonth(tons, load);
  const revenue = tons * state.pricePerTon;
  const freightCost = trips * distanceKm * 2 * freight.costPerKm;
  const conditioning = tons * state.conditioningCostPerTon;
  const margin = revenue - freightCost - conditioning;
  const marginPct = revenue > 0 ? margin / revenue : 0;
  const sellerLight: TrafficLight = revenue === 0 && margin < 0 ? 'rojo' : trafficLight(marginPct, input.greenThreshold);
  const buyerSavingsPerMonth = buyerSavings(tons, state, input.alternative);
  const buyerBenefits = buyerSavingsPerMonth >= 0;
  return {
    distanceKm,
    productTonsPerMonth: tons,
    truckLoadTons: load,
    tripsPerMonth: trips,
    revenuePerMonth: revenue,
    freightPerMonth: freightCost,
    conditioningPerMonth: conditioning,
    marginPerMonth: margin,
    marginPct,
    sellerLight,
    light: buyerBenefits ? sellerLight : 'rojo',
    buyerSavingsPerMonth,
    buyerBenefits,
    maxViableDistanceKm: maxViableDistanceKm(state, freight),
  };
}
