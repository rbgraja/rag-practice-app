import { createClient } from "@supabase/supabase-js";

// Browser-safe client. Only the URL and anon key are used here — both are
// intended to be public and are protected by Row Level Security policies
// (this app currently defines no client-facing policies, so this client is
// not used for direct table/storage access; it's kept for parity/future use).
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey);
}
