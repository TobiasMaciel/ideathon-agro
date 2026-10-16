import { describe, expect, it } from 'vitest';
import { publishedAgo } from './published-ago';

describe('publishedAgo', () => {
  const now = new Date('2026-10-16T12:00:00Z');
  it('recién, minutos, horas y días', () => {
    expect(publishedAgo('2026-10-16T11:59:40Z', now)).toBe('Publicado recién');
    expect(publishedAgo('2026-10-16T11:55:00Z', now)).toBe('Publicado hace 5 min');
    expect(publishedAgo('2026-10-16T09:00:00Z', now)).toBe('Publicado hace 3 h');
    expect(publishedAgo('2026-10-15T09:00:00Z', now)).toBe('Publicado hace 1 día');
    expect(publishedAgo('2026-10-10T09:00:00Z', now)).toBe('Publicado hace 6 días');
  });
  it('fecha inválida o futura: sin texto raro', () => {
    expect(publishedAgo('no-es-fecha', now)).toBeNull();
    expect(publishedAgo('2026-10-17T12:00:00Z', now)).toBe('Publicado recién');
  });
});
