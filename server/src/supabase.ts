import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getAuthContext } from "./auth.js";
import { env } from "./env.js";

/**
 * Create an authenticated Supabase client using the user's access token.
 * This client respects RLS policies based on the authenticated user.
 */
export function getAuthenticatedSupabaseClient(): SupabaseClient {
  const { accessToken } = getAuthContext();

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * @deprecated Use getAuthenticatedSupabaseClient() instead for RLS-aware queries.
 * This client is only for unauthenticated operations or testing.
 */
function getSupabaseClient(): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

// Lazy initialization to avoid errors during test imports
let _supabase: SupabaseClient | null = null;

/**
 * @deprecated Use getAuthenticatedSupabaseClient() instead for RLS-aware queries.
 * This proxy client is kept for backward compatibility during migration.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      _supabase = getSupabaseClient();
    }
    return Reflect.get(_supabase, prop);
  },
});
