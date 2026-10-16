/** Bindings del Worker (wrangler.jsonc `vars`, `.dev.vars` y secrets). */
export interface Env {
  /** Orígenes web permitidos por CORS, separados por comas. */
  ALLOWED_ORIGINS?: string;
  /** Cadena de conexión a Postgres. Vacía o ausente: la API usa los datos locales de @mapa/core. */
  DATABASE_URL?: string;
  /** Sal para hashear la IP de quien publica (secret). Sin ella se usa una sal fija de desarrollo. */
  IP_SALT?: string;
}
