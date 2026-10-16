import { describe, expect, it } from 'vitest';
import { interpretContact, interpretCreate } from './interpret';

describe('interpretCreate', () => {
  it('201 devuelve la publicación creada', () => {
    const body = { origin: 'local', kind: 'oferta', listing: { id: 'pub-1' } };
    expect(interpretCreate(201, body)).toEqual({ ok: true, created: body });
  });
  it('400 devuelve los detalles de validación', () => {
    expect(interpretCreate(400, { error: 'La publicación no es válida.', details: ['El email no tiene un formato válido.'] })).toEqual({
      ok: false,
      kind: 'validation',
      message: 'La publicación no es válida.',
      details: ['El email no tiene un formato válido.'],
    });
  });
  it('429 usa el mensaje del servidor', () => {
    expect(interpretCreate(429, { error: 'Demasiadas publicaciones desde esta conexión. Probá más tarde.' })).toEqual({
      ok: false,
      kind: 'rate',
      message: 'Demasiadas publicaciones desde esta conexión. Probá más tarde.',
    });
  });
  it('otro error o cuerpo raro: mensaje genérico', () => {
    expect(interpretCreate(500, null)).toMatchObject({ ok: false, kind: 'server' });
    expect(interpretCreate(413, { error: 'El cuerpo es demasiado grande.' })).toEqual({ ok: false, kind: 'server', message: 'El cuerpo es demasiado grande.' });
  });
});

describe('interpretContact', () => {
  it('200 devuelve el contacto', () => {
    const body = { phone: '3794 412345', whatsappUrl: 'https://wa.me/543794412345' };
    expect(interpretContact(200, body)).toEqual({ ok: true, contact: body });
  });
  it('429 y 404 con el mensaje del servidor', () => {
    expect(interpretContact(429, { error: 'Demasiadas consultas.' })).toEqual({ ok: false, kind: 'rate', message: 'Demasiadas consultas.' });
    expect(interpretContact(404, { error: 'No existe la publicación.' })).toEqual({ ok: false, kind: 'notfound', message: 'No existe la publicación.' });
  });
  it('acepta campos opcionales de contacto corporativo: website, sourceUrl y sourceIds', () => {
    const r = interpretContact(200, {
      email: 'info@empresa.com.ar',
      website: 'https://empresa.com.ar',
      sourceUrl: 'https://fuente.example.org/nota',
      sourceIds: ['src-1', 2],
    });
    expect(r).toEqual({
      ok: true,
      contact: { email: 'info@empresa.com.ar', website: 'https://empresa.com.ar', sourceUrl: 'https://fuente.example.org/nota', sourceIds: ['src-1'] },
    });
  });
  it('via: acepta empresa, publicacion y plataforma; descarta otro valor', () => {
    expect(interpretContact(200, { email: 'a@b.com', via: 'plataforma' })).toEqual({ ok: true, contact: { email: 'a@b.com', via: 'plataforma' } });
    expect(interpretContact(200, { email: 'a@b.com', via: 'empresa' })).toEqual({ ok: true, contact: { email: 'a@b.com', via: 'empresa' } });
    expect(interpretContact(200, { email: 'a@b.com', via: 'otra' })).toEqual({ ok: true, contact: { email: 'a@b.com' } });
  });
  it('links que no son http(s) se descartan', () => {
    const r = interpretContact(200, { phone: '1', website: 'javascript:alert(1)', sourceUrl: 'data:text/html,x' });
    expect(r).toEqual({ ok: true, contact: { phone: '1' } });
  });
  it('un whatsappUrl que no es de wa.me se descarta', () => {
    const r = interpretContact(200, { phone: '1', whatsappUrl: 'javascript:alert(1)' });
    expect(r).toEqual({ ok: true, contact: { phone: '1' } });
  });
});
