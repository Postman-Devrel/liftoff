import { createBrowserClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";
import type { Database } from "@/types/supabase";

// Uses the same parse/serialize from the `cookie` package that @supabase/ssr
// uses internally, so encoding round-trips are identical to the default
// document.cookie handler. The only addition: code-verifier entries are
// shadowed to localStorage on write and restored on read, so they survive
// browser extensions that clear cookies during the Discord OAuth redirect.
//
// detectSessionInUrl is off because its automatic PKCE exchange swallows
// errors silently. /auth calls exchangeCodeForSession explicitly.

function isVerifier(name: string) {
  return name.includes("-code-verifier");
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { detectSessionInUrl: false },
      cookies: {
        getAll() {
          const cookies = parse(document.cookie);
          const result = Object.entries(cookies).map(([name, value]) => ({
            name,
            value: value ?? "",
          }));

          if (!result.some((c) => isVerifier(c.name))) {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)!;
              if (key.startsWith("__pkce_") && isVerifier(key)) {
                const val = localStorage.getItem(key);
                if (val) {
                  result.push({ name: key.slice(7), value: val });
                }
              }
            }
          }

          return result;
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            document.cookie = serialize(name, value, options);

            if (isVerifier(name)) {
              if (value && (!options || options.maxAge !== 0)) {
                localStorage.setItem(`__pkce_${name}`, value);
              } else {
                localStorage.removeItem(`__pkce_${name}`);
              }
            }
          }
        },
      },
    }
  );
}
