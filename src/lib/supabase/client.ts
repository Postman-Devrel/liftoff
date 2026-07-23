import { createBrowserClient } from "@supabase/ssr";
import { parse } from "cookie";
import type { Database } from "@/types/supabase";

// Custom cookie handlers that:
// 1. Read via parse() from the `cookie` package (same as @supabase/ssr default)
// 2. Write via direct document.cookie assignment (bypassing serialize() which
//    was producing cookies the browser silently rejected on postman.com)
// 3. Shadow code-verifier entries to localStorage so they survive browser
//    extensions that clear cookies during the Discord OAuth redirect
//
// detectSessionInUrl is off because its automatic PKCE exchange swallows
// errors silently. /auth calls exchangeCodeForSession explicitly.

function isVerifier(name: string) {
  return name.includes("-code-verifier");
}

function writeCookie(
  name: string,
  value: string,
  options?: Record<string, unknown>
) {
  let cookie = `${name}=${value}`;
  if (options?.path) cookie += `; path=${options.path}`;
  if (options?.maxAge != null) cookie += `; max-age=${options.maxAge}`;
  if (options?.domain) cookie += `; domain=${options.domain}`;
  if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
  if (options?.secure) cookie += "; secure";
  document.cookie = cookie;
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
            writeCookie(name, value, options as Record<string, unknown>);

            if (isVerifier(name)) {
              if (value && (!options || (options as Record<string, unknown>).maxAge !== 0)) {
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
