import { timingSafeEqual } from "crypto";

// Admin auth + brute-force rate limiting for the ADMIN_PASSWORD-guarded routes.
//
// The admin API is protected by a single shared secret. To harden it against
// online brute-force / credential guessing we cap requests per client IP with a
// fixed-window limiter that runs BEFORE the password check, so failed attempts
// are throttled regardless of the outcome.
//
// The limiter is in-memory and therefore per-instance: serverless cold starts
// and multiple concurrent lambdas each keep their own counters, so this is a
// pragmatic, dependency-free mitigation rather than a distributed guarantee.
// A shared store (e.g. Redis) would be required for a hard global limit.

const RATE_LIMIT = 100; // max requests ...
const WINDOW_MS = 60_000; // ... per 60-second window, per client IP

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

function clientIp(request: Request): string {
  // On Vercel the true client IP is the leftmost x-forwarded-for entry, so a
  // client that appends extra values to the header cannot shift its own key.
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

// Returns seconds to wait if the caller is over the limit, or 0 if allowed.
function checkRateLimit(request: Request): number {
  const now = Date.now();
  const ip = clientIp(request);

  // Opportunistically drop expired buckets to bound memory.
  for (const [key, b] of buckets) {
    if (now - b.windowStart >= WINDOW_MS) buckets.delete(key);
  }

  const bucket = buckets.get(ip);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    return 0;
  }

  bucket.count++;
  if (bucket.count > RATE_LIMIT) {
    return Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000);
  }
  return 0;
}

function verifyAdmin(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(adminPassword));
  } catch {
    return false;
  }
}

// Guard an admin route: enforces the per-IP rate limit first, then the shared
// secret. Returns a Response to short-circuit (429 or 401), or null when the
// request may proceed.
export function guardAdmin(request: Request): Response | null {
  const retryAfter = checkRateLimit(request);
  if (retryAfter > 0) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  if (!verifyAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
