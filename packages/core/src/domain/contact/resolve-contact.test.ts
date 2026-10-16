import { describe, expect, it } from 'vitest';
import { curatedContacts } from '../../data/contacts';
import { sources } from '../../data/sources';
import type { StoredListing } from '../listings/types';
import { curatedContactCard, platformContactCard, publicationContactCard, resolveContact } from './resolve-contact';

describe('curatedContactCard', () => {
  const byId = (id: string) => curatedContacts.find((c) => c.entityId === id)!;

  it('arma name, website, phone, email, whatsappUrl y sourceUrl (primera fuente)', () => {
    const r = curatedContactCard(byId('molinos-ala-mercedes'), sources);
    expect(r.via).toBe('empresa');
    expect(r.name).toBe('Adecoagro Argentina (oficina comercial)');
    expect(r.website).toBe('https://www.molinosala.com.ar');
    expect(r.phone).toBe('+54 11 4836 8600');
    expect(r.email).toBe('info_ar@adecoagro.com');
    expect(r.sourceUrl).toBe('https://adecoagro.com/sugerencias-y-consultas/');
    expect(r.whatsappUrl).toBe(
      `https://wa.me/541148368600?text=${encodeURIComponent('Hola, los contacto desde Circular NEA por sus subproductos')}`,
    );
  });

  it('sin teléfono no hay whatsappUrl y se omiten los campos ausentes', () => {
    const r = curatedContactCard(byId('las-marias-yerba'), sources);
    expect(r.whatsappUrl).toBeUndefined();
    expect(r.phone).toBeUndefined();
    expect('phone' in r).toBe(false);
    expect(r.email).toBe('atclientes@lasmarias.com.ar');
  });

  it('usa el nombre del material en el mensaje si se pasa', () => {
    const r = curatedContactCard(byId('as-de-bastos'), sources, 'aserrín');
    expect(decodeURIComponent(r.whatsappUrl!.split('text=')[1])).toBe('Hola, los contacto desde Circular NEA por aserrín');
  });
});

describe('platformContactCard', () => {
  it('arma via plataforma con WhatsApp que nombra al establecimiento y al material', () => {
    const r = platformContactCard({ name: 'Circular NEA', phone: '+54 379 400-0000', email: 'hola@circular.test' }, 'Duhalde', 'aserrín')!;
    expect(r.via).toBe('plataforma');
    expect(r.name).toBe('Circular NEA');
    expect(r.email).toBe('hola@circular.test');
    expect(r.mailtoSubject).toContain('Duhalde');
    const text = decodeURIComponent(r.whatsappUrl!.split('text=')[1]);
    expect(text).toBe('Hola, me interesa contactar a Duhalde por aserrín, vi su ficha en Circular NEA');
  });
  it('sin material usa "sus subproductos"; solo email no genera whatsappUrl', () => {
    const r = platformContactCard({ name: 'Circular NEA', email: 'hola@circular.test' }, 'Duhalde')!;
    expect(r.whatsappUrl).toBeUndefined();
    expect(r.phone).toBeUndefined();
  });
  it('sin teléfono ni email devuelve undefined', () => {
    expect(platformContactCard({ name: 'Circular NEA' }, 'Duhalde')).toBeUndefined();
  });
});

const listing: StoredListing = {
  id: 'u1',
  createdAt: '2026-10-16T12:00:00.000Z',
  input: {
    kind: 'oferta',
    name: 'Aserradero Don Pepe',
    lat: -27.58,
    lng: -56.69,
    materialId: 'aserrin',
    tonsPerMonth: 120,
    contact: { name: 'Pepe', phone: '379 412-3456', email: 'pepe@example.com' },
  },
};
const platform = { name: 'Circular NEA', phone: '+54 379 400-0000' };

describe('publicationContactCard', () => {
  it('devuelve el contacto de quien publicó con link de WhatsApp', () => {
    expect(publicationContactCard(listing)).toEqual({
      via: 'publicacion',
      name: 'Pepe',
      phone: '379 412-3456',
      email: 'pepe@example.com',
      whatsappUrl:
        'https://wa.me/543794123456?text=' + encodeURIComponent('Hola, vi tu publicación de aserrín en Circular NEA'),
    });
  });
  it('sin teléfono no hay whatsappUrl', () => {
    const onlyEmail = { ...listing, input: { ...listing.input, contact: { email: 'a@b.com' } } };
    expect(publicationContactCard(onlyEmail)).toEqual({ via: 'publicacion', email: 'a@b.com' });
  });
});

describe('resolveContact (publicación → empresa → plataforma → ninguno)', () => {
  const ala = curatedContacts.find((c) => c.entityId === 'molinos-ala-mercedes')!;

  it('una publicación usa el contacto de quien publicó aunque haya plataforma', () => {
    expect(resolveContact({ listing }, sources, platform)?.via).toBe('publicacion');
  });
  it('un curado con contacto corporativo usa la empresa', () => {
    expect(resolveContact({ establishmentName: 'Molinos Ala', curated: ala }, sources, platform)?.via).toBe('empresa');
  });
  it('un curado sin contacto propio usa la plataforma', () => {
    expect(resolveContact({ establishmentName: 'Duhalde' }, sources, platform)?.via).toBe('plataforma');
  });
  it('sin contacto propio ni plataforma configurada no hay contacto', () => {
    expect(resolveContact({ establishmentName: 'Duhalde' }, sources, { name: 'Circular NEA' })).toBeUndefined();
  });
});
