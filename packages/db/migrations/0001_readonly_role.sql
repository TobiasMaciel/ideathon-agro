-- Rol de solo lectura para la API. Es un rol estándar de Postgres (sin LOGIN): cada despliegue crea su
-- propio usuario con contraseña que lo hereda (ver packages/db/README.md):
--   CREATE ROLE mapa_api LOGIN PASSWORD '...' IN ROLE mapa_readonly;
-- Idempotente: se puede volver a aplicar sin error.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mapa_readonly') THEN
    CREATE ROLE mapa_readonly NOLOGIN;
  END IF;
END
$$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO mapa_readonly;
--> statement-breakpoint
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mapa_readonly;
--> statement-breakpoint
-- Tablas que cree después quien aplica las migraciones también quedan legibles.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mapa_readonly;
