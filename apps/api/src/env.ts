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
