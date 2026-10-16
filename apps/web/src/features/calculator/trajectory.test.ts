import { describe, expect, it } from 'vitest';
import { nextTrack, type MarginTrack } from './trajectory';

const start: MarginTrack = { key: 'molinos|ibera', state: 'suelto', value: 0.93, from: null };

describe('nextTrack (trayecto del margen en la card de resultado)', () => {
  it('al cambiar de estado con la misma planta y el mismo comprador, recuerda el margen anterior', () => {
    expect(nextTrack(start, 'molinos|ibera', 'pellet', 0.98)).toEqual({ key: 'molinos|ibera', state: 'pellet', value: 0.98, from: 0.93 });
  });
  it('al cambiar de planta se resetea (sin flecha), aunque el comprador sea el mismo', () => {
    expect(nextTrack(start, 'otra-planta|ibera', 'suelto', 0.5).from).toBeNull();
  });
  it('al cambiar de comprador se resetea', () => {
    expect(nextTrack(start, 'molinos|duhalde', 'suelto', -2.8).from).toBeNull();
  });
  it('al cambiar planta y estado a la vez también se resetea', () => {
    expect(nextTrack(start, 'otra-planta|ibera', 'pellet', 0.5).from).toBeNull();
  });
  it('si cambia el margen sin cambiar de estado (p. ej. un supuesto), se resetea', () => {
    const afterState = nextTrack(start, 'molinos|ibera', 'pellet', 0.98);
    expect(nextTrack(afterState, 'molinos|ibera', 'pellet', 0.9).from).toBeNull();
  });
  it('sin cambios devuelve el mismo objeto (no re-renderiza)', () => {
    expect(nextTrack(start, 'molinos|ibera', 'suelto', 0.93)).toBe(start);
  });
});
