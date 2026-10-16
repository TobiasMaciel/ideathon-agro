import { describe, expect, it } from 'vitest';
import { initialState, reducer, toggleInList } from './state';

describe('reducer', () => {
  const base = initialState('molinos-ala-mercedes');

  it('arranca en suelto, sin overrides ni comprador fijo', () => {
    expect(base.state).toBe('suelto');
    expect(base.selectedBuyerId).toBeNull();
    expect(base.overrides).toEqual({});
  });

  it('al cambiar de generador vuelve a suelto si el estado no está disponible', () => {
    const s = reducer(
      { ...base, state: 'pellet', selectedBuyerId: 'x' },
      { type: 'selectGenerator', id: 'otro', availableStates: ['suelto', 'compactado'] },
    );
    expect(s.state).toBe('suelto');
    expect(s.selectedGeneratorId).toBe('otro');
    expect(s.selectedBuyerId).toBeNull();
  });

  it('al cambiar de generador mantiene el estado si está disponible', () => {
    const s = reducer(
      { ...base, state: 'pellet' },
      { type: 'selectGenerator', id: 'otro', availableStates: ['suelto', 'pellet'] },
    );
    expect(s.state).toBe('pellet');
  });

  it('selectBuyer fija el comprador sin tocar el resto', () => {
    const s = reducer(base, { type: 'selectBuyer', id: 'duhalde-curuzu' });
    expect(s.selectedBuyerId).toBe('duhalde-curuzu');
    expect(s.selectedGeneratorId).toBe(base.selectedGeneratorId);
    expect(s.state).toBe('suelto');
  });

  it('setState cambia el estado y no muta el anterior', () => {
    const s = reducer(base, { type: 'setState', state: 'pellet' });
    expect(s.state).toBe('pellet');
    expect(base.state).toBe('suelto');
  });

  it('toggleMaterial agrega y quita sin mutar', () => {
    const a = reducer(base, { type: 'toggleMaterial', id: 'cascarilla' });
    expect(a.materials).toEqual(['cascarilla']);
    expect(base.materials).toEqual([]);
    const b = reducer(a, { type: 'toggleMaterial', id: 'cascarilla' });
    expect(b.materials).toEqual([]);
    expect(a.materials).toEqual(['cascarilla']);
  });

  it('toggleSector agrega y quita sin mutar', () => {
    const a = reducer(base, { type: 'toggleSector', id: 'yerbatera' });
    expect(a.sectors).toEqual(['yerbatera']);
    expect(base.sectors).toEqual([]);
    const b = reducer(a, { type: 'toggleSector', id: 'yerbatera' });
    expect(b.sectors).toEqual([]);
    expect(a.sectors).toEqual(['yerbatera']);
  });

  it('selectGenerator con estado no disponible cae a suelto', () => {
    const s = reducer({ ...base, state: 'compactado' }, { type: 'selectGenerator', id: 'x', availableStates: ['suelto'] });
    expect(s.state).toBe('suelto');
  });

  it('setOverride no pisa otras claves', () => {
    const a = reducer(base, { type: 'setOverride', key: 'costPerKm', value: 6000 });
    const b = reducer(a, { type: 'setOverride', key: 'routeFactor', value: 1.1 });
    expect(b.overrides).toEqual({ costPerKm: 6000, routeFactor: 1.1 });
    expect(a.overrides).toEqual({ costPerKm: 6000 });
  });

  it('clearFilters vacía materiales y sectores sin tocar el resto', () => {
    const withFilters = { ...base, state: 'pellet' as const, materials: ['cascarilla' as const], sectors: ['yerbatera' as const] };
    const s = reducer(withFilters, { type: 'clearFilters' });
    expect(s.materials).toEqual([]);
    expect(s.sectors).toEqual([]);
    expect(s.state).toBe('pellet');
    expect(withFilters.sectors).toEqual(['yerbatera']);
  });

  it('setOverride guarda valores y resetOverrides los borra', () => {
    const a = reducer(base, { type: 'setOverride', key: 'costPerKm', value: 6000 });
    expect(a.overrides.costPerKm).toBe(6000);
    expect(reducer(a, { type: 'resetOverrides' }).overrides).toEqual({});
  });
});

describe('toggleInList', () => {
  it('agrega y quita', () => {
    expect(toggleInList(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleInList(['a', 'b'], 'a')).toEqual(['b']);
  });
});
