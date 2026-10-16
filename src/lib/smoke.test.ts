import { describe, expect, it } from "vitest";
import { getSupabase } from "@/lib/db/supabase";

describe("getSupabase", () => {
  it("devuelve null si faltan las variables de entorno", () => {
    expect(getSupabase({})).toBeNull();
  });

  it("devuelve un cliente si están SUPABASE_URL y SUPABASE_ANON_KEY", () => {
    const client = getSupabase({
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_ANON_KEY: "anon-test-key",
    });
    expect(client).not.toBeNull();
  });
});
