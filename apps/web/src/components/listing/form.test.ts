import { describe, expect, it } from 'vitest';
import { draftToRaw, emptyDraft, inNea, mapServerDetails, parseDecimal, parseMoisturePct, publishedAgo, validateDraft, type ListingDraft } from './form';

const SANTA_ROSA = { lat: -28.26, lng: -58.12 };

function oferta(over: Partial<ListingDraft> = {}): ListingDraft {
  return {
    ...emptyDraft(),
    kind: 'oferta',
    name: 'Aserradero El Ceibo',
    locality: 'Santa Rosa',
    materialId: 'aserrin',
    tons: '120',
    location: SANTA_ROSA,
    phone: '3794 412345',
    ...over,
  };
}

describe('parseDecimal', () => {
  it('vacío es undefined', () => {
    expect(parseDecimal('  ')).toBeUndefined();
  });
  it('acepta coma decimal y punto de miles', () => {
    expect(parseDecimal('1,5')).toBe(1.5);
    expect(parseDecimal('1.200')).toBe(1200);
    expect(parseDecimal('1.200,5')).toBe(1200.5);
    expect(parseDecimal('2.5')).toBe(2.5);
    expect(parseDecimal(' 80 ')).toBe(80);
  });
  it('texto que no es número da NaN (lo rechaza la validación)', () => {
    expect(parseDecimal('mucho')).toBeNaN();
  });
});

describe('parseMoisturePct', () => {
  it('convierte porcentaje a fracción', () => {
    expect(parseMoisturePct('35')).toBeCloseTo(0.35);
    expect(parseMoisturePct('35 %')).toBeCloseTo(0.35);
    expect(parseMoisturePct('12,5%')).toBeCloseTo(0.125);
  });
  it('vacío es undefined', () => {
    expect(parseMoisturePct('')).toBeUndefined();
  });
});

describe('inNea', () => {
  it('Santa Rosa (Corrientes) está dentro; Buenos Aires no', () => {
    expect(inNea(SANTA_ROSA)).toBe(true);
    expect(inNea({ lat: -34.6, lng: -58.4 })).toBe(false);
  });
});

describe('draftToRaw', () => {
  it('oferta: humedad en fracción, sin campos de demanda ni textos vacíos', () => {
    const raw = draftToRaw(oferta({ moisture: '40', seasonality: ' Todo el año ', sector: 'yerbatera', email: '' }));
    expect(raw).toEqual({
      kind: 'oferta',
      name: 'Aserradero El Ceibo',
      locality: 'Santa Rosa',
      lat: SANTA_ROSA.lat,
      lng: SANTA_ROSA.lng,
      materialId: 'aserrin',
      tonsPerMonth: 120,
      moisture: 0.4,
      seasonality: 'Todo el año',
      contact: { phone: '3794 412345' },
    });
  });
  it('demanda: sector y combustible, sin humedad ni estacionalidad', () => {
    const raw = draftToRaw(
      oferta({ kind: 'demanda', moisture: '40', seasonality: 'x', sector: 'secadero_granos', currentAlternative: 'glp', tons: '8', locality: '' }),
    );
    expect(raw).toMatchObject({ kind: 'demanda', sector: 'secadero_granos', currentAlternative: 'glp', tonsPerMonth: 8 });
    expect(raw).not.toHaveProperty('moisture');
    expect(raw).not.toHaveProperty('seasonality');
    expect(raw).not.toHaveProperty('locality');
  });
});

describe('validateDraft', () => {
  it('una oferta completa es válida y da el ListingInput', () => {
    const v = validateDraft(oferta());
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.value).toMatchObject({ kind: 'oferta', tonsPerMonth: 120, contact: { phone: '3794 412345' } });
  });

  it('vacío: errores por campo (nombre, ubicación, material, toneladas, contacto)', () => {
    const v = validateDraft(emptyDraft());
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.fieldErrors.name).toMatch(/nombre/i);
    expect(v.fieldErrors.location).toBe('Marcá la ubicación en el mapa o usá tu ubicación.');
    expect(v.fieldErrors.materialId).toBe('Elegí el material.');
    expect(v.fieldErrors.tons).toMatch(/toneladas/);
    expect(v.fieldErrors.contact).toMatch(/teléfono|email/);
  });

  it('ubicación fuera del NEA da un solo mensaje claro', () => {
    const v = validateDraft(oferta({ location: { lat: -34.6, lng: -58.4 } }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.fieldErrors.location).toMatch(/fuera del NEA/);
  });

  it('humedad fuera de rango se explica en %', () => {
    const v = validateDraft(oferta({ moisture: '90' }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.fieldErrors.moisture).toBe('La humedad debe estar entre 0 y 70 %.');
  });

  it('demanda sin sector ni combustible pide elegirlos', () => {
    const v = validateDraft(oferta({ kind: 'demanda' }));
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.fieldErrors.sector).toBe('Elegí el sector.');
    expect(v.fieldErrors.currentAlternative).toBe('Elegí el combustible que usás hoy.');
  });

  it('teléfono y email mal escritos usan los mensajes del dominio', () => {
    const v = validateDraft(oferta({ phone: '12', email: 'no-es-mail' }));
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.fieldErrors.phone).toMatch(/^El teléfono debe tener/);
    expect(v.fieldErrors.email).toMatch(/^El email no tiene/);
  });

  it('el nombre de contacto no se confunde con el nombre del establecimiento', () => {
    const v = validateDraft(oferta({ contactName: 'x'.repeat(61) }));
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.fieldErrors.contactName).toMatch(/nombre de contacto/);
    expect(v.fieldErrors.name).toBeUndefined();
  });
});

describe('mapServerDetails', () => {
  it('reparte los detalles del 400 por campo y deja aparte los que no reconoce', () => {
    const r = mapServerDetails(['El email no tiene un formato válido (máximo 120 caracteres).', 'Campo desconocido: "x".']);
    expect(r.fieldErrors.email).toMatch(/email/);
    expect(r.unmapped).toEqual(['Campo desconocido: "x".']);
  });
});

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
