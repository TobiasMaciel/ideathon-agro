import { describe, expect, it } from 'vitest';
import { formatArs, formatKm, formatPct, formatTons, formatNumber } from './format';

const norm = (s: string) => s.replace(/ /g, ' ');

describe('format es-AR', () => {
  it('formatea ARS sin decimales con separador de miles', () => {
    expect(norm(formatArs(1234567.4))).toBe('$ 1.234.567');
  });
  it('agrupa también los miles de 4 cifras', () => {
    expect(norm(formatArs(2900))).toBe('$ 2.900');
  });
  it('formatea ARS negativos con signo adelante', () => {
    expect(norm(formatArs(-5000))).toBe('-$ 5.000');
  });
  it('formatea toneladas con hasta un decimal', () => {
    expect(norm(formatTons(12.34))).toBe('12,3 t');
    expect(norm(formatTons(1500))).toBe('1.500 t');
  });
  it('formatea km redondeados', () => {
    expect(norm(formatKm(87.6))).toBe('88 km');
  });
  it('formatea porcentajes desde fracción', () => {
    expect(norm(formatPct(0.153))).toBe('15,3 %');
    expect(norm(formatPct(-0.5))).toBe('-50 %');
  });
  it('formatea números genéricos', () => {
    expect(norm(formatNumber(1.3, 2))).toBe('1,3');
  });
});
