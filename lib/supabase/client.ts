import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client.
 * Prefer NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new); falls back to legacy ANON_KEY.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publicKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return createClient(url, publicKey);
}
