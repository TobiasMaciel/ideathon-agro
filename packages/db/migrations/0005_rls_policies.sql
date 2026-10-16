-- Row Level Security (RLS) para proveedores que activan RLS por defecto en public (ej. Supabase)
-- y defensa en profundidad en cualquier Postgres: solo mapa_readonly puede leer y solo mapa_api
-- puede insertar en listings (además del dueño de las tablas para migraciones/seed).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'sources',
    'materials',
    'material_states',
    'alternatives',
    'assumptions',
    'generators',
    'buyers',
    'listings',
    'contacts'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS mapa_readonly_select ON public.%I', t);
    EXECUTE format('CREATE POLICY mapa_readonly_select ON public.%I FOR SELECT TO mapa_readonly USING (true)', t);
  END LOOP;
END
$$;
--> statement-breakpoint
DROP POLICY IF EXISTS mapa_api_insert ON public.listings;
--> statement-breakpoint
CREATE POLICY mapa_api_insert ON public.listings FOR INSERT TO mapa_api WITH CHECK (true);