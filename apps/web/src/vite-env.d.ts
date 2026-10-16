/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API. Vacío en dev (proxy de Vite a /api). */
  readonly VITE_API_URL?: string;
}
