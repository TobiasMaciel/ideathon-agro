import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseEnv = Record<string, string | undefined>;

/**
 * Cliente Supabase server-side (solo anon key, nunca service_role).
 * Devuelve null si faltan las variables de entorno.
 */
export function getSupabase(env: SupabaseEnv = process.env): SupabaseClient | null {
  const url = env.SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
