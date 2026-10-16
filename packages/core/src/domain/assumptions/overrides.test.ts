import { describe, expect, it } from 'vitest';
import { isEditableKey, OVERRIDE_RULES, parseAssumptionInput, validateOverride } from './overrides';

describe('OVERRIDE_RULES / isEditableKey', () => {
  it('usdArs no es editable', () => {
    expect(isEditableKey('usdArs')).toBe(false);
    expect(isEditableKey('costPerKm')).toBe(true);
    expect(isEditableKey('foo')).toBe(false);
  });
  it('define rango y rótulo para cada clave', () => {
    expect(OVERRIDE_RULES.costPerKm).toMatchObject({ min: 100, max: 100000 });
    expect(OVERRIDE_RULES.greenThreshold).toMatchObject({ min: 0, max: 0.9 });
    for (const r of Object.values(OVERRIDE_RULES)) expect(r.label.length).toBeGreaterThan(0);
  });
});

describe('validateOverride', () => {
  it('acepta valores dentro del rango, incluidos los bordes', () => {
    expect(validateOverride('costPerKm', 100)).toBe(100);
    expect(validateOverride('costPerKm', 100000)).toBe(100000);
    expect(validateOverride('greenThreshold', 0)).toBe(0);
    expect(validateOverride('greenThreshold', 0.9)).toBe(0.9);
  });
  it('rechaza fuera de rango y no finitos', () => {
    expect(validateOverride('costPerKm', 99)).toBeNull();
    expect(validateOverride('truckMaxTons', 61)).toBeNull();
    expect(validateOverride('truckVolumeM3', 4)).toBeNull();
    expect(validateOverride('routeFactor', 0.9)).toBeNull();
    expect(validateOverride('routeFactor', 3.1)).toBeNull();
    expect(validateOverride('greenThreshold', 0.95)).toBeNull();
    expect(validateOverride('costPerKm', NaN)).toBeNull();
    expect(validateOverride('costPerKm', Infinity)).toBeNull();
  });
  it('clave no editable da null', () => {
    expect(validateOverride('usdArs', 1500)).toBeNull();
  });
});

describe('parseAssumptionInput', () => {
  it('acepta coma decimal y convierte % a fracción', () => {
    expect(parseAssumptionInput('routeFactor', '1,5')).toBe(1.5);
    expect(parseAssumptionInput('greenThreshold', '20')).toBeCloseTo(0.2);
  });
  it('trim y punto decimal', () => {
    expect(parseAssumptionInput('routeFactor', '  1.5 ')).toBe(1.5);
  });
  it('rechaza vacío, espacios, basura e Infinity', () => {
    for (const raw of ['', '   ', 'abc', 'Infinity', '-Infinity', 'NaN', '1,2,3', '12abc', '0x10']) {
      expect(parseAssumptionInput('costPerKm', raw)).toBeNull();
    }
  });
  it('rechaza cero, negativos y fuera de rango', () => {
    expect(parseAssumptionInput('costPerKm', '0')).toBeNull();
    expect(parseAssumptionInput('costPerKm', '-3')).toBeNull();
    expect(parseAssumptionInput('costPerKm', '99999999')).toBeNull();
    expect(parseAssumptionInput('routeFactor', '0,9')).toBeNull();
  });
  it('umbral verde: 0 y 90 valen; 91 o más no', () => {
    expect(parseAssumptionInput('greenThreshold', '0')).toBe(0);
    expect(parseAssumptionInput('greenThreshold', '90')).toBeCloseTo(0.9);
    expect(parseAssumptionInput('greenThreshold', '91')).toBeNull();
    expect(parseAssumptionInput('greenThreshold', '100')).toBeNull();
  });
  it("formato de miles es-AR: '1.234,5' → 1234.5 y '1.000' → 1000", () => {
    expect(parseAssumptionInput('costPerKm', '1.234,5')).toBe(1234.5);
    expect(parseAssumptionInput('costPerKm', '1.000')).toBe(1000);
    expect(parseAssumptionInput('costPerKm', '12.345.678')).toBeNull(); // fuera de rango
  });
  it("'1.5' y '1.50' son decimales, no miles", () => {
    expect(parseAssumptionInput('routeFactor', '1.5')).toBe(1.5);
    expect(parseAssumptionInput('routeFactor', '1.50')).toBe(1.5);
  });
  it('clave no editable da null', () => {
    expect(parseAssumptionInput('usdArs', '1500')).toBeNull();
  });
});
