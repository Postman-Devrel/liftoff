import { NextRequest } from "next/server";

// Same-origin enforcement for state-changing requests (CSRF defense).
//
// The repo has no middleware.ts, so cookie-setting / state-changing API routes
// are otherwise reachable cross-site. Browsers always attach an Origin header to
// cross-site POST/DELETE (and to same-origin ones too), so a missing/mismatched
// Origin identifies a forged cross-site request. This matters for endpoints that
// plant trusted cookies: SameSite=Strict controls when a cookie is *sent*, not
// whether it is *stored* from a cross-site response, so it does not stop a
// cross-site request from fixating a cookie value.
export function isSameOrigin(request: NextRequest): boolean {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return false; // cannot establish the expected origin -> fail closed

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  // No Origin header. Fall back to the Fetch Metadata signal when present:
  // browsers omit Origin only for user-initiated navigations (Sec-Fetch-Site:
  // none); cross-site requests report "cross-site".
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin" || site === "none";

  // Neither signal available (non-browser client / stripped headers). These
  // endpoints are only ever called same-origin from the app, so fail closed.
  return false;
}
