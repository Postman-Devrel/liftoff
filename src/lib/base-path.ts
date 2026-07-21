// Single source of truth for the app's basePath, mirrored in next.config.ts.
// Next.js only auto-prefixes next/link, next/router, and next/image — not fetch() —
// so any client-side fetch to an internal /api route must prepend this.
export const BASE_PATH = "/liftoff";

export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}

// Origin + basePath, for building absolute URLs (badge links, webhook payloads)
// from a request's origin, which does not include basePath on its own.
export function absoluteBase(origin: string): string {
  return `${origin}${BASE_PATH}`;
}
