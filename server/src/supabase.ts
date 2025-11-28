import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";

function getSupabaseClient(): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

// Lazy initialization to avoid errors during test imports
let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = getSupabaseClient();
    }
    return Reflect.get(_supabase, prop);
  },
});
