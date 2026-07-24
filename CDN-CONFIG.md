# CDN Configuration Required for LiftOff

The `postman.com` CDN in front of this app (deployed on Vercel) does **not forward POST/DELETE requests** to the Vercel origin for routes under `/liftoff/api/*`. All such requests return **404**.

GET requests work fine — badge images, admin dashboard, and content API routes all load correctly.

## What needs to change

The CDN must forward **all HTTP methods** (at minimum POST and DELETE) to the Vercel origin for paths matching:

```
/liftoff/api/*
```

This includes (but is not limited to):

| Route | Method | Purpose |
|-------|--------|---------|
| `/liftoff/api/postman/validate/` | POST | Core feature: validates learner exercise completion via the Postman API |
| `/liftoff/api/postman/validate-key/` | POST, DELETE | Validates/clears the user's Postman API key |
| `/liftoff/api/postman/debug-info/` | POST | Diagnostic workspace/collection info for learners |
| `/liftoff/api/utm/track/` | POST | UTM attribution tracking |
| `/liftoff/api/auth/signout/` | POST | Server-side session cleanup on sign-out |

## What is currently broken in production

1. **Exercise validation** — every "Validate" button in every module fails with "Failed to validate. Please try again." (the POST to `/api/postman/validate/` 404s)
2. **UTM tracking** — attribution tracking silently fails (fire-and-forget POST)
3. **Completion webhooks** — downstream notifications (Discord, etc.) never fire because the validate route never executes

## Current workarounds in place

These client-side workarounds were added because POST routes are unreachable:

- **API key validation** (`validate-key` route) — bypassed; the client now calls `api.getpostman.com/me` directly (CORS allows it) and stores the key in `sessionStorage`
- **Manual steps** — complete client-side without hitting the server
- **Discord OAuth** — uses client-side PKCE exchange against `supabase.co` directly, with all Supabase cookies shadowed to `localStorage` (because a browser extension also clears `sb-*` cookies on this domain)

## How to verify the fix

After the CDN change, this curl should return a 400 JSON response (not 404):

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"stepId":"test"}' \
  "https://www.postman.com/liftoff/api/postman/validate/"
```

Expected: `{"success":false,"message":"Missing stepId or Postman connection","pointsAwarded":0}`
Current: `404 Not Found`

## Trailing slash note

The app is configured with `trailingSlash: true` in `next.config.ts`. All client-side fetch URLs already include trailing slashes. The CDN should not strip or redirect trailing slashes on API routes.
