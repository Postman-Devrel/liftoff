import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// detectSessionInUrl is off: its automatic PKCE exchange fails silently
// when the verifier is missing (no error, no event, no log). /auth calls
// exchangeCodeForSession explicitly so failures are visible.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { detectSessionInUrl: false },
    }
  );
}
