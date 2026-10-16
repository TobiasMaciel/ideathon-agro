// Contrato del modelo de viabilidad (B1 / B2). Funciones puras: sin I/O, sin fechas, sin random.
// Unidades: toneladas (t), kilómetros (km), pesos argentinos (ARS), megajoules (MJ).

import type { DataLabel, MaterialState } from '../enums';

export type { DataLabel, MaterialState };

export type TrafficLight = 'verde' | 'amarillo' | 'rojo';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TruckSpec {
  /** Carga útil máxima por peso, t. */
  maxTons: number;
  /** Volumen útil de la caja, m³. */
  volumeM3: number;
}

/** Propiedades de un material en un estado de acondicionamiento dado. */
export interface MaterialStateSpec {
  /** Densidad aparente, t/m³. */
  bulkDensityTPerM3: number;
  /** Humedad en base húmeda (0–1) del producto en este estado. */
  moisture: number;
  /** Poder calorífico inferior del producto en este estado, MJ/kg. */
  lhvMJPerKg: number;
  /** Precio de venta puesto en destino, ARS/t de producto. */
  pricePerTon: number;
  /** Costo de llevar el material crudo a este estado, ARS/t de producto (0 para suelto). */
  conditioningCostPerTon: number;
}

export interface FreightParams {
  truck: TruckSpec;
  /** Costo por km recorrido de un camión, ARS/km. */
  costPerKm: number;
  /** Factor de corrección por ruta sobre la línea recta (1 = línea recta pura). */
  routeFactor: number;
}

/** Combustible o insumo que el comprador usa hoy. */
export type BuyerAlternative =
  | {
      kind: 'energia';
      /** Precio de la unidad del combustible actual, ARS. */
      pricePerUnit: number;
      /** PCI por unidad del combustible actual (MJ/kg, MJ/L, etc.). */
      lhvMJPerUnit: number;
      /** Eficiencia de la caldera actual (0–1). */
      efficiency: number;
      /** Eficiencia de la caldera a biomasa que la reemplaza (0–1). */
      biomassEfficiency: number;
    }
  | {
      kind: 'volumen';
      /** Precio del insumo actual por m³ (p. ej. sustrato importado), ARS/m³. */
      pricePerM3: number;
    };

export interface ViabilityInput {
  origin: LatLng;
  destination: LatLng;
  /** Material crudo disponible en origen, t/mes (como sale del generador). */
  rawTonsPerMonth: number;
  /** Humedad del material crudo en origen (0–1). */
  rawMoisture: number;
  /**
   * Demanda máxima del comprador expresada en t/mes de ESTE producto (Infinity si no tiene tope).
   * Si la demanda viene en t de su combustible actual, el adaptador la convierte por equivalencia energética.
   */
  buyerMaxTonsPerMonth: number;
  state: MaterialStateSpec;
  freight: FreightParams;
  alternative: BuyerAlternative;
  /** Margen mínimo para semáforo verde (p. ej. 0.15). Amarillo entre 0 y este valor. */
  greenThreshold: number;
}

export interface ViabilityResult {
  distanceKm: number;
  /** t/mes de producto después de acondicionar (corrección por pérdida de humedad) y del tope del comprador. */
  productTonsPerMonth: number;
  truckLoadTons: number;
  tripsPerMonth: number;
  revenuePerMonth: number;
  freightPerMonth: number;
  conditioningPerMonth: number;
  marginPerMonth: number;
  /** marginPerMonth / revenuePerMonth (0 si no hay ingreso). */
  marginPct: number;
  /** Semáforo solo del vendedor, por margen (verde ≥ umbral; amarillo ≥ 0; rojo < 0 o margen negativo sin ingreso). */
  sellerLight: TrafficLight;
  /** Semáforo del NEGOCIO: el del vendedor, pero 'rojo' si al comprador no le conviene (buyerSavingsPerMonth < 0). */
  light: TrafficLight;
  /** Ahorro mensual del comprador frente a su alternativa actual (negativo = le sale más caro). */
  buyerSavingsPerMonth: number;
  /** true si buyerSavingsPerMonth ≥ 0. */
  buyerBenefits: boolean;
  /** Distancia máxima por ruta a la que el margen es ≥ 0 (B2), km. */
  maxViableDistanceKm: number;
}

// Firmas que implementa ./index.ts:
//
// haversineKm(a: LatLng, b: LatLng): number
// routeDistanceKm(a: LatLng, b: LatLng, routeFactor: number): number
// productTons(rawTons: number, rawMoisture: number, productMoisture: number): number
//   = rawTons × (1 − rawMoisture) / (1 − productMoisture); si productMoisture ≥ rawMoisture, devuelve rawTons
// truckLoadTons(truck: TruckSpec, bulkDensityTPerM3: number): number
// tripsPerMonth(tons: number, loadTons: number): number                      (ceil; 0 si tons = 0)
// trafficLight(marginPct: number, greenThreshold: number): TrafficLight     (verde ≥ umbral; amarillo ≥ 0; rojo < 0)
// buyerSavings(productTons: number, state: MaterialStateSpec, alt: BuyerAlternative): number
//   energía: costoAlt = (t × 1000 × PCI × efBiomasa) / (PCIalt × efAlt) × precioAlt; ahorro = costoAlt − t × precio
//   volumen: ahorro = (t / densidad) × precioM3 − t × precio
// maxViableDistanceKm(state: MaterialStateSpec, freight: FreightParams): number
//   radio por ruta en km = (precio − acond) × carga / (2 × costoKm); 0 si precio ≤ acond.
//   Es el radio "por ruta"; para dibujar en el mapa (línea recta) se divide por routeFactor.
// evaluateViability(input: ViabilityInput): ViabilityResult
