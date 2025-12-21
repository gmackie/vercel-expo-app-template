import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createSupabaseClient() {
  return createClient<Database>(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function createSupabaseServiceClient() {
  return createClient<Database>(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
