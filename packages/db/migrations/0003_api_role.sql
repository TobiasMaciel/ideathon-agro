-- Rol de la API: hereda la lectura de mapa_readonly y puede INSERTAR solo en listings (publicaciones
-- abiertas). Sin LOGIN: cada despliegue crea su usuario que lo hereda (ver packages/db/README.md):
--   CREATE ROLE mapa_api_login LOGIN PASSWORD '...' IN ROLE mapa_api;
-- Idempotente: se puede volver a aplicar sin error.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mapa_api') THEN
    CREATE ROLE mapa_api NOLOGIN;
  END IF;
END
$$;
--> statement-breakpoint
GRANT mapa_readonly TO mapa_api;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO mapa_api;
--> statement-breakpoint
GRANT SELECT ON listings TO mapa_readonly;
--> statement-breakpoint
GRANT INSERT ON listings TO mapa_api;
