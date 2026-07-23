import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// Supabase's browser client auto-detects and exchanges the OAuth ?code= param
// from the URL on init. Multiple independent instances racing to exchange the
// same single-use PKCE code causes intermittent sign-in failures, so this
// must stay a singleton shared by every caller.
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
