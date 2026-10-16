import { describe, expect, it } from 'vitest';
import { parseConfig } from './config';

describe('parseConfig', () => {
  it('sin variables: modo local, sin orígenes, límite activo y plataforma sin datos', () => {
    expect(parseConfig({})).toEqual({
      allowedOrigins: [],
      databaseUrl: undefined,
      ipSalt: undefined,
      rateLimitDisabled: false,
      platformContact: { name: 'Circular NEA', phone: undefined, email: undefined },
    });
  });

  it('separa ALLOWED_ORIGINS por comas y descarta vacíos', () => {
    expect(parseConfig({ ALLOWED_ORIGINS: ' http://a.test , ,http://b.test' }).allowedOrigins).toEqual([
      'http://a.test',
      'http://b.test',
    ]);
  });

  it('DATABASE_URL vacío o con espacios equivale a no tener base', () => {
    expect(parseConfig({ DATABASE_URL: '  ' }).databaseUrl).toBeUndefined();
    expect(parseConfig({ DATABASE_URL: 'postgres://x' }).databaseUrl).toBe('postgres://x');
  });

  it('RATE_LIMIT_DISABLED=1 solo apaga el límite con ENVIRONMENT=development', () => {
    expect(parseConfig({ RATE_LIMIT_DISABLED: '1', ENVIRONMENT: 'development' }).rateLimitDisabled).toBe(true);
    expect(parseConfig({ RATE_LIMIT_DISABLED: '1', ENVIRONMENT: 'production' }).rateLimitDisabled).toBe(false);
    expect(parseConfig({ RATE_LIMIT_DISABLED: '1' }).rateLimitDisabled).toBe(false);
  });

  it('el contacto de plataforma recorta espacios y usa "Circular NEA" como nombre por defecto', () => {
    const { platformContact } = parseConfig({ PLATFORM_CONTACT_PHONE: ' +54 379 400-0000 ', PLATFORM_CONTACT_NAME: ' ' });
    expect(platformContact).toEqual({ name: 'Circular NEA', phone: '+54 379 400-0000', email: undefined });
  });
});
