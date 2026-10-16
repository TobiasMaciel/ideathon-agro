import { describe, expect, it } from 'vitest';
import { assumptions } from './data/assumptions';
import { generators } from './data/generators';
import { buyers } from './data/buyers';
import { alternatives, materials } from './data/materials';
import { evaluateMatch } from './match';
import { listingToBuyer, listingToGenerator, validateListing, whatsappUrl, type ListingInput } from './listings';

const oferta = {
  kind: 'oferta',
  name: 'Aserradero Don Pepe',
  locality: 'Ituzaingó',
  lat: -27.58,
  lng: -56.69,
  materialId: 'aserrin',
  tonsPerMonth: 120,
  moisture: 0.4,
  seasonality: 'Todo el año',
  contact: { name: 'Pepe', phone: '+54 379 412-3456' },
};
const demanda = {
  kind: 'demanda',
  name: 'Secadero La Esperanza',
  lat: -28.05,
  lng: -56.0,
  materialId: 'aserrin',
  tonsPerMonth: 80,
  currentAlternative: 'lena',
  sector: 'secadero_granos',
  contact: { email: 'compras@esperanza.com.ar' },
};
const errorsOf = (raw: unknown) => {
  const r = validateListing(raw);
  return r.ok ? [] : r.errors;
};

describe('validateListing', () => {
  it('acepta una oferta y una demanda válidas', () => {
    expect(validateListing(oferta)).toEqual({ ok: true, value: oferta });
    expect(validateListing(demanda).ok).toBe(true);
  });
  it('rechaza lo que no es un objeto', () => {
    for (const raw of [null, 'x', 3, [], undefined]) expect(validateListing(raw).ok).toBe(false);
  });
  it('rechaza claves desconocidas', () => {
    expect(errorsOf({ ...oferta, admin: true }).join()).toContain('admin');
  });
  it('kind inválido', () => {
    expect(errorsOf({ ...oferta, kind: 'regalo' }).join()).toContain('kind');
  });
  it('nombre de 2 a 80 caracteres sin control', () => {
    expect(errorsOf({ ...oferta, name: 'a' }).join()).toContain('nombre');
    expect(errorsOf({ ...oferta, name: 'a'.repeat(81) }).join()).toContain('nombre');
    expect(errorsOf({ ...oferta, name: 'Hola\u0000mundo' }).join()).toContain('nombre');
    expect(errorsOf({ ...oferta, name: 5 }).join()).toContain('nombre');
  });
  it('localidad de hasta 60 caracteres', () => {
    expect(errorsOf({ ...oferta, locality: 'a'.repeat(61) }).join()).toContain('localidad');
  });
  it('coordenadas dentro del NEA', () => {
    expect(errorsOf({ ...oferta, lat: -20 }).join()).toContain('latitud');
    expect(errorsOf({ ...oferta, lat: '1' }).join()).toContain('latitud');
    expect(errorsOf({ ...oferta, lng: -70 }).join()).toContain('longitud');
  });
  it('toneladas entre 1 y 100000', () => {
    expect(errorsOf({ ...oferta, tonsPerMonth: 0 }).join()).toContain('toneladas');
    expect(errorsOf({ ...oferta, tonsPerMonth: 100001 }).join()).toContain('toneladas');
    expect(errorsOf({ ...oferta, tonsPerMonth: Number.NaN }).join()).toContain('toneladas');
  });
  it('material inválido', () => {
    expect(errorsOf({ ...oferta, materialId: 'oro' }).join()).toContain('material');
  });
  it('humedad entre 0 y 0.7', () => {
    expect(errorsOf({ ...oferta, moisture: 0.9 }).join()).toContain('humedad');
    expect(errorsOf({ ...oferta, moisture: -0.1 }).join()).toContain('humedad');
  });
  it('estacionalidad de hasta 60 caracteres', () => {
    expect(errorsOf({ ...oferta, seasonality: 'a'.repeat(61) }).join()).toContain('estacionalidad');
  });
  it('la demanda requiere combustible actual y sector válidos', () => {
    const sin = { ...demanda, currentAlternative: undefined, sector: undefined };
    expect(errorsOf(sin).join()).toContain('combustible');
    expect(errorsOf(sin).join()).toContain('sector');
    expect(errorsOf({ ...demanda, sector: 'banco' }).join()).toContain('sector');
    expect(errorsOf({ ...demanda, currentAlternative: 'nuclear' }).join()).toContain('combustible');
  });
  it('descarta sin error los campos que no corresponden al tipo de publicación', () => {
    expect(validateListing({ ...demanda, moisture: 0.2, seasonality: 'x' })).toEqual({ ok: true, value: demanda });
    expect(validateListing({ ...oferta, sector: 'banco', currentAlternative: 'nuclear' })).toEqual({
      ok: true,
      value: oferta,
    });
  });
  it('el contacto es obligatorio y requiere teléfono o email', () => {
    const sin = { ...oferta, contact: undefined };
    expect(errorsOf(sin).join()).toContain('contacto');
    expect(errorsOf({ ...oferta, contact: {} }).join()).toContain('al menos');
    expect(errorsOf({ ...oferta, contact: { name: 'Ana' } }).join()).toContain('al menos');
    expect(validateListing({ ...oferta, contact: { email: 'a@b.com' } }).ok).toBe(true);
  });
  it('valida formato de teléfono, email y nombre de contacto', () => {
    expect(errorsOf({ ...oferta, contact: { phone: 'abc12345' } }).join()).toContain('teléfono');
    expect(errorsOf({ ...oferta, contact: { phone: '123' } }).join()).toContain('teléfono');
    expect(errorsOf({ ...oferta, contact: { email: 'sin-arroba' } }).join()).toContain('email');
    expect(errorsOf({ ...oferta, contact: { email: `${'a'.repeat(120)}@b.com` } }).join()).toContain('email');
    expect(errorsOf({ ...oferta, contact: { phone: '3794123456', name: 'a'.repeat(61) } }).join()).toContain('contacto');
    expect(errorsOf({ ...oferta, contact: { phone: '3794123456', x: 1 } }).join()).toContain('"x"');
  });
  it('acumula varios errores', () => {
    expect(errorsOf({ kind: 'oferta' }).length).toBeGreaterThan(3);
  });
});

describe('whatsappUrl', () => {
  it('deja solo dígitos y agrega 54 si falta', () => {
    expect(whatsappUrl('379 412-3456', 'aserrin')).toBe(
      'https://wa.me/543794123456?text=' + encodeURIComponent('Hola, vi tu publicación de aserrín en Circular NEA'),
    );
  });
  it('respeta el 54 existente', () => {
    expect(whatsappUrl('+54 (379) 412-3456', 'chips')).toContain('wa.me/543794123456?');
  });
});

describe('listingToGenerator / listingToBuyer', () => {
  const o = validateListing(oferta) as { ok: true; value: ListingInput };
  const d = validateListing(demanda) as { ok: true; value: ListingInput };
  const at = '2026-10-16T12:00:00.000Z';

  it('mapea la oferta a un generador sin verificar', () => {
    const g = listingToGenerator(o.value, 'abc', at);
    expect(g).toMatchObject({
      id: 'pub-abc',
      kind: 'aserradero',
      locality: 'Ituzaingó',
      location: { lat: -27.58, lng: -56.69 },
      locationNote: 'ubicación marcada por quien publicó',
      materialId: 'aserrin',
      seasonality: 'Todo el año',
      sourceIds: [],
      origin: 'publicacion',
      verified: false,
      createdAt: at,
    });
    expect(JSON.stringify(g)).not.toContain('412-3456');
    expect(g.tonsPerMonth).toEqual({
      value: 120,
      tag: 'estimado',
      sourceIds: [],
      note: 'declarado por quien publicó, sin verificar',
    });
  });
  it('cascarilla es de molino arrocero; sin estacionalidad dice "Sin dato"', () => {
    const g = listingToGenerator({ ...o.value, materialId: 'cascarilla', seasonality: undefined }, 'x', at);
    expect(g.kind).toBe('molino_arrocero');
    expect(g.seasonality).toBe('Sin dato');
  });
  it('mapea la demanda a un comprador sin verificar', () => {
    const b = listingToBuyer(d.value, 'xyz', at);
    expect(b).toMatchObject({
      id: 'pub-xyz',
      sector: 'secadero_granos',
      currentAlternative: 'lena',
      accepts: ['aserrin'],
      origin: 'publicacion',
      verified: false,
      createdAt: at,
    });
    expect(b.demandTonsPerMonth).toMatchObject({ value: 80, tag: 'estimado', sourceIds: [] });
    expect(b.currentAlternativeTag.value).toBe('lena');
  });
  it('un comprador publicado se evalúa contra un generador curado sin romper', () => {
    const buyer = listingToBuyer({ ...d.value, materialId: 'cascarilla' }, 'xyz', at);
    const generator = generators.find((g) => g.materialId === 'cascarilla')!;
    const material = materials.find((m) => m.id === 'cascarilla')!;
    const result = evaluateMatch({ generator, buyer, material, state: 'suelto', alternatives, assumptions });
    expect(Number.isFinite(result.marginPerMonth)).toBe(true);
  });
  it('un generador publicado se evalúa contra un comprador curado', () => {
    const generator = listingToGenerator(o.value, 'abc', at);
    const material = materials.find((m) => m.id === 'aserrin')!;
    const buyer = buyers.find((b) => b.accepts.includes('aserrin'))!;
    const result = evaluateMatch({ generator, buyer, material, state: 'suelto', alternatives, assumptions });
    expect(result).toBeDefined();
  });
});
