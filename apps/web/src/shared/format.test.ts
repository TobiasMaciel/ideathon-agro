import { describe, expect, it } from 'vitest';
import { ars, formatArs, formatKm, formatPct, formatTons, formatNumber, minusArs, pct } from './format';

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

describe('signo menos tipográfico (−) para la UI', () => {
  it('ars: negativos con U+2212, positivos igual que formatArs', () => {
    expect(norm(ars(-5000))).toBe('−$ 5.000');
    expect(norm(ars(5000))).toBe('$ 5.000');
  });
  it('minusArs: resta de un monto positivo', () => {
    expect(norm(minusArs(1200))).toBe('−$ 1.200');
  });
  it('pct: porcentaje con U+2212 si es negativo', () => {
    expect(norm(pct(-0.5))).toBe('−50 %');
    expect(norm(pct(0.231))).toBe('23,1 %');
  });
});
