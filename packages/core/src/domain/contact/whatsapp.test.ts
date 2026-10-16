import { describe, expect, it } from 'vitest';
import { whatsappUrl } from './whatsapp';

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
