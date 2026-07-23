import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// createBrowserClient already caches itself per browser context, so this
// wrapper doesn't need its own singleton — kept simple as a thin re-export.
//
// detectSessionInUrl is off: its automatic PKCE code exchange fails silently
// (GoTrueClient._initialize() swallows the error with no event and no log),
// which is exactly what made past Discord sign-in loops impossible to
// diagnose. /auth calls exchangeCodeForSession itself so failures are visible.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        detectSessionInUrl: false,
      },
    }
  );
}
