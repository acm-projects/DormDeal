import { createClient } from "@supabase/supabase-js";

const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getSupabaseProjectUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const isSupabaseProject = /^[a-z0-9]+\.supabase\.co$/i.test(url.hostname);
    return isSupabaseProject ? url.origin : null;
  } catch {
    return null;
  }
}

const supabaseUrl = getSupabaseProjectUrl(configuredSupabaseUrl);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigurationError = !configuredSupabaseUrl || !supabaseAnonKey
  ? "Email login is not configured yet. Add the Supabase environment variables."
  : !supabaseUrl
    ? "The Supabase URL is invalid. Use the project URL from Supabase Project Settings."
    : "";

// Keep Microsoft sign-in usable even before Supabase environment variables are added.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
