# Completion Webhooks

LiftOff can notify an external endpoint (e.g. a Discord bot) whenever a registered user completes a module, completes a learning path, or ranks up. This lets you post a congratulations message, grant a Discord role, or otherwise react to progress outside of LiftOff.

## Setup

Set these environment variables (see `.env.example`):

| Variable | Required | Description |
|---|---|---|
| `LIFTOFF_WEBHOOK_URL` | Yes | The endpoint LiftOff POSTs events to. If unset, no webhook requests are made. |
| `LIFTOFF_WEBHOOK_SECRET` | No | If set, every request is signed with HMAC-SHA256 over the raw JSON body, sent in the `X-Liftoff-Signature` header (hex-encoded). Verify it before trusting the payload. |

## When It Fires

A webhook request fires the moment a step completion (validated via `/api/postman/validate`) causes one of the following to newly become true for that user:

- **`module_completed`** — every step in every lesson of a module is now complete.
- **`learning_path_completed`** — every module in a learning path is now complete.
- **`rank_up`** — the user's cumulative points crossed a rank threshold (see `src/lib/scoring.ts`). If a single step completion crosses multiple rank thresholds at once, one event fires per rank crossed, in ascending order.

Re-validating an already-completed step is a no-op and never re-fires an event.

**Registered (Discord-signed-in) users only.** Webhooks never fire for anonymous visitors, even if they complete a module or rank up in the UI. The detection logic (`src/lib/completion-events.ts`) diffs before/after state from the `progress` table, which only exists for signed-in users — anonymous progress lives entirely in the browser's `localStorage` and the server never sees it. This is intentional, not a gap to fix: anonymous completions have no `discord_id` to report, and a client-only signal would be trivially spoofable (anyone could claim any module/rank was completed without a server-verified identity behind it).

**No retroactive firing on sign-in, either.** When an anonymous user later signs in with Discord, `importLocalProgress` (`src/context/ProgressContext.tsx`) bulk-upserts their local steps straight into the `progress` table via a direct Supabase call — it doesn't go through `/api/postman/validate`, so no completion/rank-up diffing happens and no webhook fires for that import, even if the imported steps completed a module or crossed a rank. The user would need to complete a *new* step after signing in for the webhook to trigger again.

## Payload

Each event is a single JSON object, one event per HTTP POST. A step that completes a module, its parent learning path, and a rank simultaneously fires three separate requests.

```json
// module_completed
{
  "type": "module_completed",
  "discordId": "123456789012345678",
  "moduleId": "api-basics",
  "moduleTitle": "API Basics",
  "badgeUrl": "https://liftoff.postman.com/liftoff/api/modules/api-basics/badge",
  "occurredAt": "2026-07-14T18:32:00.000Z"
}
```

```json
// learning_path_completed
{
  "type": "learning_path_completed",
  "discordId": "123456789012345678",
  "learningPathId": "intro-to-postman",
  "learningPathTitle": "Introduction to Postman",
  "badgeUrl": "https://liftoff.postman.com/liftoff/api/learning-paths/intro-to-postman/badge",
  "occurredAt": "2026-07-14T18:32:00.000Z"
}
```

```json
// rank_up
{
  "type": "rank_up",
  "discordId": "123456789012345678",
  "rankId": "commander",
  "rankTitle": "Commander",
  "badgeUrl": "https://liftoff.postman.com/liftoff/ranks/commander-full.png?v=6",
  "occurredAt": "2026-07-14T18:32:00.000Z"
}
```

`discordId` is the user's Discord snowflake, taken from `profiles.discord_id`. It is `null` if the user signed in before this field existed and hasn't re-authenticated since (see migration `003_discord_id.sql` for the one-time backfill from `auth.identities`).

## Delivery

- Requests are POSTed with `Content-Type: application/json`.
- Delivery is best-effort: failures are logged server-side (`[webhook] delivery failed` / `[webhook] delivery error`) and never affect the validation response the learner sees. There is no retry queue — a dropped webhook is dropped.
