import { describe, expect, it } from 'vitest';
import { BUYER_SECTORS, isOneOf, MATERIAL_IDS, MATERIAL_STATES } from './enums';

describe('enums del dominio', () => {
  it('los estados van de menor a mayor procesamiento', () => {
    expect(MATERIAL_STATES).toEqual(['suelto', 'compactado', 'pellet']);
  });

  it('isOneOf acepta solo strings de la lista', () => {
    expect(isOneOf(MATERIAL_IDS, 'cascarilla')).toBe(true);
    expect(isOneOf(MATERIAL_IDS, 'oro')).toBe(false);
    expect(isOneOf(BUYER_SECTORS, 1)).toBe(false);
    expect(isOneOf(BUYER_SECTORS, undefined)).toBe(false);
  });
});
