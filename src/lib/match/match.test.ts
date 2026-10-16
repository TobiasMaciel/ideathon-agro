import { describe, expect, it } from 'vitest';
import { assumptions } from '@/data/assumptions';
import { buyers } from '@/data/buyers';
import { generators } from '@/data/generators';
import { alternatives, materials } from '@/data/materials';
import type { MaterialState } from '@/data/types';
import {
  assumptionValues,
  availableStates,
  buildViabilityInput,
  evaluateMatch,
  rankBuyers,
  viableRadiusMapKm,
} from './index';

const generator = generators.find((g) => g.id === 'molinos-ala-mercedes')!;
const cascarilla = materials.find((m) => m.id === 'cascarilla')!;
const aserrin = materials.find((m) => m.id === 'aserrin')!;
const costaneros = materials.find((m) => m.id === 'costaneros')!;
const ibera = buyers.find((b) => b.id === 'ibera-mercantil-secadero')!;
const duhalde = buyers.find((b) => b.id === 'duhalde-curuzu')!;

const base = { generator, material: cascarilla, alternatives, assumptions };

describe('assumptionValues', () => {
  it('mapea clave a valor', () => {
    const v = assumptionValues(assumptions);
    expect(v.costPerKm).toBe(2900);
    expect(v.routeFactor).toBe(1.3);
  });
  it('los overrides pisan el valor', () => {
    expect(assumptionValues(assumptions, { costPerKm: 5000 }).costPerKm).toBe(5000);
  });
});

describe('availableStates', () => {
  it('ordena suelto, compactado, pellet', () => {
    expect(availableStates(cascarilla)).toEqual(['suelto', 'compactado', 'pellet']);
  });
  it('omite estados inexistentes', () => {
    expect(availableStates(costaneros)).toEqual(['suelto']);
    expect(availableStates(aserrin)).toEqual(['suelto', 'compactado', 'pellet']);
  });
});

describe('buildViabilityInput', () => {
  it('arma el input con datos y supuestos', () => {
    const input = buildViabilityInput({ ...base, buyer: ibera, state: 'pellet' });
    expect(input.rawTonsPerMonth).toBe(generator.tonsPerMonth.value);
    expect(input.rawMoisture).toBe(cascarilla.rawMoisture.value);
    expect(input.buyerMaxTonsPerMonth).toBeCloseTo(ibera.demandTonsPerMonth.value * (46.3 * 0.85) / (15 * 0.8), 9);
    expect(input.state.pricePerTon).toBe(cascarilla.states.pellet!.pricePerTon.value);
    expect(input.freight).toEqual({ truck: { maxTons: 30, volumeM3: 90 }, costPerKm: 2900, routeFactor: 1.3 });
    expect(input.greenThreshold).toBe(0.15);
    expect(input.origin).toEqual(generator.location);
    expect(input.destination).toEqual(ibera.location);
    expect(input.alternative).toMatchObject({ kind: 'energia', pricePerUnit: 1556, efficiency: 0.85 });
  });
  it('convierte la demanda (t de su combustible) a t de producto por equivalencia energética', () => {
    // GLP: 46,3 MJ/kg × 0,85 = 39,355 MJ útiles/kg. Pellet de cascarilla: 15 MJ/kg × 0,8 = 12 MJ útiles/kg.
    // 100 t de GLP equivalen a 100 × 39,355 / 12 = 327,958... t de pellet.
    const buyer = { ...ibera, demandTonsPerMonth: { ...ibera.demandTonsPerMonth, value: 100 } };
    const input = buildViabilityInput({ ...base, buyer, state: 'pellet' });
    expect(input.buyerMaxTonsPerMonth).toBeCloseTo(327.9583333, 6);
  });
  it('si el comprador no tiene tope (Infinity) sigue sin tope', () => {
    const buyer = { ...ibera, demandTonsPerMonth: { ...ibera.demandTonsPerMonth, value: Infinity } };
    expect(buildViabilityInput({ ...base, buyer, state: 'pellet' }).buyerMaxTonsPerMonth).toBe(Infinity);
  });
  it('falla claro si la unidad de la alternativa no es kg', () => {
    const odd = alternatives.map((a) => (a.id === 'glp' ? { ...a, unit: 'L' } : a));
    expect(() => buildViabilityInput({ ...base, buyer: ibera, state: 'pellet', alternatives: odd })).toThrow(/unidad/);
  });
  it('respeta overrides', () => {
    const input = buildViabilityInput({ ...base, buyer: ibera, state: 'suelto', overrides: { routeFactor: 1 } });
    expect(input.freight.routeFactor).toBe(1);
  });
  it('falla claro si el estado no existe', () => {
    expect(() =>
      buildViabilityInput({ ...base, material: costaneros, buyer: ibera, state: 'pellet' }),
    ).toThrow(/pellet/);
  });
  it('falla claro si falta la alternativa del comprador', () => {
    expect(() => buildViabilityInput({ ...base, buyer: ibera, state: 'suelto', alternatives: [] })).toThrow(/glp/);
  });
});

describe('rankBuyers', () => {
  it('solo incluye compradores que aceptan el material y ordena por margen desc', () => {
    const ranked = rankBuyers({ generator, state: 'suelto', buyers, materials, alternatives, assumptions });
    expect(ranked.length).toBeGreaterThan(0);
    for (const { buyer } of ranked) expect(buyer.accepts).toContain('cascarilla');
    const margins = ranked.map((r) => r.result.marginPerMonth);
    expect(margins).toEqual([...margins].sort((a, b) => b - a));
    expect(ranked.length).toBe(buyers.filter((b) => b.accepts.includes('cascarilla')).length);
  });
  it('falla si el material del generador no existe', () => {
    expect(() =>
      rankBuyers({ generator, state: 'suelto', buyers, materials: [], alternatives, assumptions }),
    ).toThrow(/cascarilla/);
  });
});

describe('rankBuyers con overrides extremos', () => {
  const rank = (overrides: Record<string, number>) =>
    rankBuyers({ generator, state: 'pellet', buyers, materials, alternatives, assumptions, overrides });
  it('costo por km mínimo y máximo no producen NaN ni rompen el orden', () => {
    for (const costPerKm of [100, 100_000]) {
      const ranked = rank({ costPerKm });
      expect(ranked.length).toBeGreaterThan(0);
      for (const { result } of ranked) {
        expect(Number.isFinite(result.marginPerMonth)).toBe(true);
        expect(Number.isNaN(result.marginPct)).toBe(false);
      }
      const m = ranked.map((r) => r.result.marginPerMonth);
      expect(m).toEqual([...m].sort((a, b) => b - a));
    }
  });
  it('camión mínimo (1 t, 5 m³) y máximo (60 t, 200 m³) dan resultados finitos', () => {
    for (const o of [{ truckMaxTons: 1, truckVolumeM3: 5 }, { truckMaxTons: 60, truckVolumeM3: 200 }]) {
      for (const { result } of rank(o)) {
        expect(Number.isFinite(result.freightPerMonth)).toBe(true);
        expect(result.truckLoadTons).toBeGreaterThan(0);
      }
    }
  });
  it('factor de ruta 1 y 3: más ruta, más flete', () => {
    const a = rank({ routeFactor: 1 }).find((r) => r.buyer.id === 'duhalde-curuzu')!;
    const b = rank({ routeFactor: 3 }).find((r) => r.buyer.id === 'duhalde-curuzu')!;
    expect(b.result.freightPerMonth).toBeGreaterThan(a.result.freightPerMonth);
  });
  it('umbral verde 0 y 0,9 mantienen coherencia de semáforo', () => {
    for (const greenThreshold of [0, 0.9]) {
      for (const { result } of rank({ greenThreshold })) {
        if (result.buyerBenefits) expect(result.light).toBe(result.sellerLight);
        else expect(result.light).toBe('rojo');
      }
    }
  });
});

describe('viableRadiusMapKm', () => {
  it('queda acotado a [0, 1500] km y nunca es NaN', () => {
    const extreme = viableRadiusMapKm(cascarilla, 'pellet', assumptions, { costPerKm: 100, truckMaxTons: 60, truckVolumeM3: 200, routeFactor: 1 });
    expect(extreme).toBe(1500);
    const r = viableRadiusMapKm(cascarilla, 'suelto', assumptions);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(1500);
    expect(Number.isNaN(r)).toBe(false);
  });
  it('es el radio por ruta dividido el factor de ruta', () => {
    const input = buildViabilityInput({ ...base, buyer: ibera, state: 'pellet' });
    const result = evaluateMatch({ ...base, buyer: ibera, state: 'pellet' });
    expect(viableRadiusMapKm(cascarilla, 'pellet', assumptions)).toBeCloseTo(
      result.maxViableDistanceKm / input.freight.routeFactor,
      9,
    );
  });
  it('falla si el estado no existe', () => {
    expect(() => viableRadiusMapKm(costaneros, 'pellet' as MaterialState, assumptions)).toThrow();
  });
});

// Chequeos de coherencia con los datos reales: colores exactos del guion (octubre 2026).
describe('coherencia con datos reales (cascarilla de molinos-ala-mercedes)', () => {
  const light = (buyer: typeof ibera, state: MaterialState) => evaluateMatch({ ...base, buyer, state }).light;
  it('Iberá Mercantil es verde en los tres estados', () => {
    for (const st of ['suelto', 'compactado', 'pellet'] as const) expect(light(ibera, st)).toBe('verde');
  });
  it('Duhalde: suelto rojo, compactado y pellet verdes', () => {
    expect(light(duhalde, 'suelto')).toBe('rojo');
    expect(light(duhalde, 'compactado')).toBe('verde');
    expect(light(duhalde, 'pellet')).toBe('verde');
  });
  it('Playadito: rojo en los tres estados (lejos y no le conviene el pellet)', () => {
    const playadito = buyers.find((b) => b.id === 'playadito-liebig')!;
    for (const st of ['suelto', 'compactado', 'pellet'] as const) expect(light(playadito, st)).toBe('rojo');
    expect(evaluateMatch({ ...base, buyer: playadito, state: 'pellet' }).buyerBenefits).toBe(false);
  });
  it('aserrín suelto a una central de biomasa: le conviene al comprador y es verde', () => {
    const g = generators.find((x) => x.id === 'todo-pallets-santa-rosa')!;
    const central = buyers.find((x) => x.id === 'genergiabio-santa-rosa')!;
    const r = evaluateMatch({ generator: g, buyer: central, material: aserrin, state: 'suelto', alternatives, assumptions });
    expect(r.buyerBenefits).toBe(true);
    expect(r.light).toBe('verde');
  });
  it('el radio de pellet es más de 5 veces el de suelto', () => {
    const suelto = viableRadiusMapKm(cascarilla, 'suelto', assumptions);
    const pellet = viableRadiusMapKm(cascarilla, 'pellet', assumptions);
    expect(pellet).toBeGreaterThan(5 * suelto);
  });
});
