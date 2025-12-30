import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl === "your-project-url-here") {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Please set it in your .env.local file. " +
      "Get your URL from: https://supabase.com/dashboard/project/_/settings/api"
    );
  }

  if (!supabaseAnonKey || supabaseAnonKey === "your-anon-key-here") {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Please set it in your .env.local file. " +
      "Get your key from: https://supabase.com/dashboard/project/_/settings/api"
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Creates a Supabase client for use in Client Components
 * Uses environment variables from .env.local
 * Supabase Configuration
 * Get these values from: https://supabase.com/dashboard/project/_/settings/api
 */
export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a Supabase client for use in Server Components
 * Note: This is a simple client without cookie-based auth.
 * For authenticated server operations, use createServerClientWithCookies from lib/supabase-server.ts
 */
export function createServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}



