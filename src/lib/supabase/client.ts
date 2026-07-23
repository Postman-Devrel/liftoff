import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

// The PKCE code verifier is stored in a cookie by default. Privacy/ad-blocking
// extensions can clear cookies during the cross-origin redirect through Discord,
// causing AuthPKCECodeVerifierMissingError on return. The session tokens MUST
// stay in cookies (so the proxy/server can read them), but the ephemeral code
// verifier only needs to survive one round-trip — so we shadow it to localStorage
// where extensions typically don't touch it, and restore on read if the cookie
// was cleared.
//
// detectSessionInUrl is off: its automatic exchange fails silently when the
// verifier is missing (no error, no event, no log). /auth calls
// exchangeCodeForSession explicitly so failures are visible.

function isCodeVerifier(name: string) {
  return name.includes("-code-verifier");
}

function parseCookies(): { name: string; value: string }[] {
  if (!document.cookie) return [];
  return document.cookie.split("; ").map((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return { name: pair, value: "" };
    return { name: pair.slice(0, idx), value: pair.slice(idx + 1) };
  });
}

function setCookie(
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
  if (options?.httpOnly) cookie += "; httponly";
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
          const cookies = parseCookies();

          if (!cookies.some((c) => isCodeVerifier(c.name))) {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)!;
              if (isCodeVerifier(key)) {
                const val = localStorage.getItem(key);
                if (val) cookies.push({ name: key, value: val });
              }
            }
          }

          return cookies;
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            setCookie(name, value, options as Record<string, unknown>);

            if (isCodeVerifier(name)) {
              if (value && (!options || (options as Record<string, unknown>).maxAge !== 0)) {
                localStorage.setItem(name, value);
              } else {
                localStorage.removeItem(name);
              }
            }
          }
        },
      },
    }
  );
}
