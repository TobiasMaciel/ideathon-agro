import type { PlatformContact } from '@mapa/core/contact';

/** Bindings del Worker (wrangler.jsonc `vars`, `.dev.vars` y secrets). */
export interface Env {
  /** Orígenes web permitidos por CORS, separados por comas. */
  ALLOWED_ORIGINS?: string;
  /** Cadena de conexión a Postgres. Vacía o ausente: la API usa los datos locales de @mapa/core. */
  DATABASE_URL?: string;
  /** Sal para hashear la IP de quien publica (secret). Sin ella se usa una sal fija de desarrollo. */
  IP_SALT?: string;
  /** `development` solo en `wrangler dev`; habilita RATE_LIMIT_DISABLED. */
  ENVIRONMENT?: string;
  /** `1` apaga el límite por IP, pero SOLO si además ENVIRONMENT=development (e2e locales). Nunca en producción. */
  RATE_LIMIT_DISABLED?: string;
  /** Contacto de la plataforma (intermediaria) para establecimientos curados sin contacto propio. */
  PLATFORM_CONTACT_PHONE?: string;
  PLATFORM_CONTACT_EMAIL?: string;
  /** Nombre mostrado; por defecto "Circular NEA". */
  PLATFORM_CONTACT_NAME?: string;
}

/** Configuración ya interpretada: el resto de la API no lee `Env` directamente. */
export interface Config {
  allowedOrigins: string[];
  /** undefined si no hay base configurada (modo local). */
  databaseUrl?: string;
  ipSalt?: string;
  rateLimitDisabled: boolean;
  platformContact: PlatformContact;
}

const clean = (v: string | undefined): string | undefined => v?.trim() || undefined;

export function parseConfig(env: Env): Config {
  return {
    allowedOrigins: (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    databaseUrl: clean(env.DATABASE_URL),
    ipSalt: env.IP_SALT || undefined,
    // El límite se apaga solo con ENVIRONMENT=development y RATE_LIMIT_DISABLED=1 (wrangler dev para e2e).
    rateLimitDisabled: env.ENVIRONMENT === 'development' && env.RATE_LIMIT_DISABLED === '1',
    platformContact: {
      name: clean(env.PLATFORM_CONTACT_NAME) ?? 'Circular NEA',
      phone: clean(env.PLATFORM_CONTACT_PHONE),
      email: clean(env.PLATFORM_CONTACT_EMAIL),
    },
  };
}
