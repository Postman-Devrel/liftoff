import { createBrowserClient } from "@supabase/ssr";
import { parse } from "cookie";
import type { Database } from "@/types/supabase";

// A browser extension on postman.com clears all sb-* cookies (confirmed:
// canWriteCookies is true but supabaseCookies is [] after exchange, in both
// default and custom handler modes). Everything Supabase writes to cookies
// is also shadowed to localStorage and restored on read if cookies are missing.
//
// detectSessionInUrl is off because its automatic PKCE exchange swallows
// errors silently. /auth calls exchangeCodeForSession explicitly.

const LS_PREFIX = "__sb_";

function isSupabaseCookie(name: string) {
  return name.startsWith("sb-");
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

          if (!result.some((c) => isSupabaseCookie(c.name))) {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)!;
              if (key.startsWith(LS_PREFIX)) {
                const val = localStorage.getItem(key);
                if (val) {
                  result.push({ name: key.slice(LS_PREFIX.length), value: val });
                }
              }
            }
          }

          return result;
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            writeCookie(name, value, options as Record<string, unknown>);

            if (isSupabaseCookie(name)) {
              if (
                value &&
                (!options ||
                  (options as Record<string, unknown>).maxAge !== 0)
              ) {
                localStorage.setItem(`${LS_PREFIX}${name}`, value);
              } else {
                localStorage.removeItem(`${LS_PREFIX}${name}`);
              }
            }
          }
        },
      },
    }
  );
}
