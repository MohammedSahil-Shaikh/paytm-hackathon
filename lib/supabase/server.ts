import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Prefer SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY (never expose to browser).
 * Falls back to publishable/anon for read-only server use when no secret is set.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase server credentials");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
