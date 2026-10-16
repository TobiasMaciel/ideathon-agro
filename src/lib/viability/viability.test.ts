import { describe, expect, it } from 'vitest';
import {
  buyerSavings,
  evaluateViability,
  haversineKm,
  maxViableDistanceKm,
  productTons,
  routeDistanceKm,
  tripsPerMonth,
  trafficLight,
  truckLoadTons,
} from './index';
import type { BuyerAlternative, FreightParams, MaterialStateSpec, ViabilityInput } from './types';

const corrientes = { lat: -27.4692, lng: -58.8306 };
const mercedes = { lat: -29.1826, lng: -58.0756 };

const state: MaterialStateSpec = {
  bulkDensityTPerM3: 0.5,
  moisture: 0,
  lhvMJPerKg: 10,
  pricePerTon: 1000,
  conditioningCostPerTon: 200,
};
const freight: FreightParams = { truck: { maxTons: 25, volumeM3: 100 }, costPerKm: 10, routeFactor: 1 };
const energy: BuyerAlternative = {
  kind: 'energia',
  pricePerUnit: 2,
  lhvMJPerUnit: 20,
  efficiency: 0.5,
  biomassEfficiency: 0.5,
};

describe('haversineKm', () => {
  it('Corrientes a Mercedes ~204 km (la recta real; el brief decía 196)', () => {
    expect(Math.abs(haversineKm(corrientes, mercedes) - 204)).toBeLessThanOrEqual(3);
  });
  it('un punto contra sí mismo es 0', () => {
    expect(haversineKm(corrientes, corrientes)).toBe(0);
  });
});

describe('routeDistanceKm', () => {
  it('multiplica la recta por el factor de ruta', () => {
    expect(routeDistanceKm(corrientes, mercedes, 1.3)).toBeCloseTo(haversineKm(corrientes, mercedes) * 1.3, 9);
  });
});

describe('productTons', () => {
  it('45% a 10% de humedad: 100 t dan 61,1 t', () => {
    expect(productTons(100, 0.45, 0.1)).toBeCloseTo(61.11, 2);
  });
  it('humedad >= 1 no produce NaN ni Infinity', () => {
    expect(productTons(100, 0.4, 1)).toBe(0);
    expect(productTons(100, 1, 0.1)).toBe(0);
    expect(productTons(100, 1, 1)).toBe(0);
  });
  it('si la humedad final >= cruda devuelve lo mismo', () => {
    expect(productTons(100, 0.1, 0.1)).toBe(100);
    expect(productTons(100, 0.1, 0.45)).toBe(100);
  });
});

describe('truckLoadTons', () => {
  it('limitado por volumen', () => {
    expect(truckLoadTons({ maxTons: 30, volumeM3: 90 }, 0.108)).toBeCloseTo(9.72, 6);
  });
  it('limitado por peso', () => {
    expect(truckLoadTons({ maxTons: 30, volumeM3: 90 }, 0.65)).toBe(30);
  });
});

describe('tripsPerMonth', () => {
  it('redondea hacia arriba', () => {
    expect(tripsPerMonth(61, 30)).toBe(3);
    expect(tripsPerMonth(60, 30)).toBe(2);
  });
  it('0 t da 0 viajes', () => {
    expect(tripsPerMonth(0, 30)).toBe(0);
  });
});

describe('trafficLight', () => {
  it('exactamente 0 es amarillo', () => expect(trafficLight(0, 0.15)).toBe('amarillo'));
  it('exactamente el umbral es verde', () => expect(trafficLight(0.15, 0.15)).toBe('verde'));
  it('entre 0 y el umbral es amarillo', () => expect(trafficLight(0.1, 0.15)).toBe('amarillo'));
  it('negativo es rojo', () => expect(trafficLight(-0.01, 0.15)).toBe('rojo'));
});

describe('buyerSavings', () => {
  it('energía: equivalencia por PCI y eficiencias', () => {
    // 10 t: costoAlt = (10*1000*10*0.5)/(20*0.5)*2 = 10000; paga 10*1000 = 10000
    expect(buyerSavings(10, state, energy)).toBeCloseTo(0, 6);
    // con precio de alternativa 3: costoAlt 15000, ahorro 5000
    expect(buyerSavings(10, state, { ...energy, pricePerUnit: 3 })).toBeCloseTo(5000, 6);
  });
  it('volumen: sustituye m³ del insumo actual', () => {
    // 10 t / 0.5 = 20 m³ × 800 = 16000 − 10000 = 6000
    expect(buyerSavings(10, state, { kind: 'volumen', pricePerM3: 800 })).toBeCloseTo(6000, 6);
  });
});

describe('maxViableDistanceKm', () => {
  it('(precio - acond) × carga / (2 × costo km)', () => {
    // carga = min(25, 100*0.5=50) = 25; (800 × 25) / 20 = 1000
    expect(maxViableDistanceKm(state, freight)).toBeCloseTo(1000, 6);
  });
  it('precio <= acondicionamiento da 0', () => {
    expect(maxViableDistanceKm({ ...state, pricePerTon: 200 }, freight)).toBe(0);
    expect(maxViableDistanceKm({ ...state, pricePerTon: 100 }, freight)).toBe(0);
  });
});

describe('evaluateViability', () => {
  const input: ViabilityInput = {
    origin: corrientes,
    destination: mercedes,
    rawTonsPerMonth: 100,
    rawMoisture: 0.5,
    buyerMaxTonsPerMonth: Infinity,
    state,
    freight,
    alternative: energy,
    greenThreshold: 0.15,
  };

  it('caso completo calculado a mano', () => {
    const d = haversineKm(corrientes, mercedes);
    const r = evaluateViability(input);
    // 100 × 0.5 / 1 = 50 t; carga 25 t; 2 viajes
    expect(r.productTonsPerMonth).toBeCloseTo(50, 9);
    expect(r.truckLoadTons).toBe(25);
    expect(r.tripsPerMonth).toBe(2);
    expect(r.distanceKm).toBeCloseTo(d, 9);
    expect(r.revenuePerMonth).toBeCloseTo(50_000, 6);
    expect(r.conditioningPerMonth).toBeCloseTo(10_000, 6);
    expect(r.freightPerMonth).toBeCloseTo(2 * d * 2 * 10, 6);
    expect(r.marginPerMonth).toBeCloseTo(40_000 - 40 * d, 6);
    expect(r.marginPct).toBeCloseTo((40_000 - 40 * d) / 50_000, 9);
    expect(r.light).toBe('verde');
    expect(r.buyerSavingsPerMonth).toBeCloseTo(buyerSavings(50, state, energy), 6);
    expect(r.maxViableDistanceKm).toBeCloseTo(1000, 6);
  });

  it('respeta el tope de demanda del comprador', () => {
    const r = evaluateViability({ ...input, buyerMaxTonsPerMonth: 20 });
    expect(r.productTonsPerMonth).toBe(20);
    expect(r.tripsPerMonth).toBe(1);
    expect(r.revenuePerMonth).toBeCloseTo(20_000, 6);
  });

  it('ingreso 0 da marginPct 0 sin NaN', () => {
    const r = evaluateViability({ ...input, state: { ...state, pricePerTon: 0 } });
    expect(r.marginPct).toBe(0);
    expect(Number.isNaN(r.marginPct)).toBe(false);
  });

  it('flete caro da semáforo rojo', () => {
    const r = evaluateViability({ ...input, freight: { ...freight, costPerKm: 1000 } });
    expect(r.light).toBe('rojo');
  });

  it('0 t: sin viajes, sin ingreso, margen 0 y semáforo amarillo', () => {
    const r = evaluateViability({ ...input, rawTonsPerMonth: 0 });
    expect(r.productTonsPerMonth).toBe(0);
    expect(r.tripsPerMonth).toBe(0);
    expect(r.marginPerMonth).toBe(0);
    expect(r.sellerLight).toBe('amarillo');
  });

  it('demanda 0 del comprador: sin toneladas', () => {
    const r = evaluateViability({ ...input, buyerMaxTonsPerMonth: 0 });
    expect(r.productTonsPerMonth).toBe(0);
    expect(r.tripsPerMonth).toBe(0);
    expect(r.revenuePerMonth).toBe(0);
  });

  it('sin ingreso pero con costo (margen negativo) es rojo', () => {
    const r = evaluateViability({ ...input, state: { ...state, pricePerTon: 0, conditioningCostPerTon: 100 } });
    expect(r.revenuePerMonth).toBe(0);
    expect(r.marginPerMonth).toBeLessThan(0);
    expect(r.sellerLight).toBe('rojo');
  });

  it('caso amarillo intermedio: margen entre 0 y el umbral', () => {
    const d = haversineKm(corrientes, mercedes);
    // margen% = (40_000 - 40 d) / 50_000; se elige costo/km para que dé 5%
    const costPerKm = (40_000 - 2_500) / (40 * d) * 10;
    const r = evaluateViability({ ...input, freight: { ...freight, costPerKm } });
    expect(r.marginPct).toBeCloseTo(0.05, 6);
    expect(r.sellerLight).toBe('amarillo');
    expect(r.light).toBe('amarillo');
  });

  it('buyerBenefits false: light rojo aunque sellerLight sea verde', () => {
    const r = evaluateViability({ ...input, state: { ...state, pricePerTon: 1000 }, alternative: { ...energy, pricePerUnit: 1 } });
    expect(r.sellerLight).toBe('verde');
    expect(r.buyerSavingsPerMonth).toBeLessThan(0);
    expect(r.buyerBenefits).toBe(false);
    expect(r.light).toBe('rojo');
  });

  it('buyerBenefits true con ahorro exactamente 0 y light igual al del vendedor', () => {
    const r = evaluateViability(input);
    expect(r.buyerBenefits).toBe(true);
    expect(r.light).toBe(r.sellerLight);
  });

  it('carga por camión inválida con toneladas lanza error', () => {
    expect(() => evaluateViability({ ...input, freight: { ...freight, truck: { maxTons: 0, volumeM3: 100 } } })).toThrow(
      'Carga por camión inválida',
    );
  });

  it('carga por camión 0 sin toneladas no lanza', () => {
    expect(() =>
      evaluateViability({ ...input, rawTonsPerMonth: 0, freight: { ...freight, truck: { maxTons: 0, volumeM3: 100 } } }),
    ).not.toThrow();
  });
});
