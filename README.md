# LiftOff

Interactive learning platform with real-time Postman API validation. Learners complete hands-on steps in Postman, then validate their work through the app — earning points and ranks as they progress.

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # add your Supabase + Gemini keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Discord.

## How It Works

1. **Sign in with Discord** to create your profile and persist progress
2. **Connect your Postman API key** at the module level to validate exercises
3. **Each step** has instructions and a **Validate** button
4. Clicking Validate calls the Postman API (server-side) to verify the learner completed the step
5. Successful validation awards **10 points** per step
6. Points unlock **ranks and badges** on the dashboard
7. **Switch Postman orgs** anytime — validation context resets but points and completed steps are preserved

### Two-Tier Auth

LiftOff uses two independent authentication layers:

- **Discord OAuth** (via Supabase Auth) — persistent identity. Sign in once, your progress is saved across sessions and devices.
- **Postman API Key** (sessionStorage) — ephemeral, per-session. Required to validate exercises. Never stored server-side.


| State        | Postman Key | Discord | Progress Storage                        |
| ------------ | ----------- | ------- | --------------------------------------- |
| Anonymous    | No          | No      | None                                    |
| Browsing     | No          | Yes     | Can view saved progress, can't validate |
| Postman-only | Yes         | No      | localStorage (local only)               |
| Registered   | Yes         | Yes     | Supabase (persistent)                   |


### Architecture

```
Browser → POST /api/postman/validate → Server-side validator → Postman API
                                     → Supabase (persist results for registered users)
```

All Postman API calls happen server-side to avoid CORS issues. The learner's API key is passed per-request and never stored on the server. For registered users, validation results are also persisted to Supabase.

---

## Creating Modules

Adding new learning content is simple — write a markdown file and let the tooling do the rest. Module content is just structured markdown: `# headings` become lessons, `### steps` become validated tasks. No code required to author content.

```
/liftoff-module create [--badge]   → new module from markdown
/liftoff-module update [--badge]   → add lessons to an existing module
/liftoff-module badge              → generate a badge for an existing module
/liftoff-module sync               → regenerate missing validators
```

The skill parses your markdown, generates the module definition, creates server-side validators that check the learner's Postman workspace, and wires everything into the app automatically.

Each module can include a **completion badge** — a 512x512 PNG displayed when the learner finishes all steps. Pass `--badge` to auto-generate one via the Google Gemini API, or place a `badge.png` manually in the module directory. Requires a `GEMINI_API_KEY` in `.env.local`.

### Private Modules

Set `"private": true` in a module's `module.json` to hide it from all listings (home page, learning paths, earned badges). The module is still accessible directly at `/modules/<module-id>` — useful for beta content, work-in-progress, or invite-only modules.

```json
{
  "id": "my-module",
  "private": true,
  ...
}
```

**[Full module authoring guide →](docs/creating-a-module.md)**

---

## API

LiftOff exposes a REST API for programmatic access to content and admin data.

| Namespace | Auth | Description |
|-----------|------|-------------|
| `GET /api/content/learning-paths` | None | List learning paths (filter by `?q=` or `?moduleId=`) |
| `GET /api/content/learning-paths/:id` | None | Single learning path with modules |
| `GET /api/content/modules` | None | List modules (filter by `?q=` or `?pathId=`) |
| `GET /api/content/modules/:id` | None | Single module with lessons and steps |
| `GET /api/admin/dashboard` | Bearer token | Platform stats, activity, leaderboard |
| `GET /api/admin/users/:id` | Bearer token | Per-user profile, progress, and activity |

**[Full API reference →](docs/api.md)**

---

## Learning Paths

Learning paths group modules into curated tracks (e.g. Build with AI, Introduction to Postman). The home page lists learning paths by default, with a dropdown filter to switch between paths or browse all modules directly.

- A module can belong to multiple learning paths
- Completing all modules in a path earns a **path completion badge**
- Learning paths can be **private** (hidden from listings, but accessible via direct URL)

```
/liftoff-learningpath create   → scaffold a new learning path
/liftoff-learningpath edit     → add/remove modules from a path
/liftoff-learningpath delete   → remove a learning path
/liftoff-learningpath list     → list all learning paths (including private)
```

Learning path definitions live in `src/content/learning-paths/<path-id>/learning-path.json`. Each path can optionally include a `badge.png` (512x512 PNG) placed alongside the JSON file — served at `/api/learning-paths/<path-id>/badge`.

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages + API routes
│   ├── api/
│   │   ├── auth/                 # Discord OAuth callback + sign-out
│   │   ├── learning-paths/       # Learning path badge serving
│   │   └── postman/              # Postman API proxy + validation
│   ├── auth/                     # Discord sign-in page
│   ├── learning-paths/           # Learning path detail pages
│   ├── modules/                  # Module and lesson pages
│   └── results/                  # Score and rank display
├── components/
│   ├── auth/                     # DiscordSignInButton, PostmanConnectionBar,
│   │                             # AuthGuard, ImportProgressModal,
│   │                             # DiscordCommunityModal
│   ├── lesson/                   # StepCard, ValidateButton, ProgressBar
│   └── scoring/                  # PointsDisplay, RankBadge, CelebrationOverlay
├── content/
│   ├── modules/                  # Module definitions (one dir per module)
│   └── learning-paths/           # Learning path definitions (one dir per path)
├── context/
│   ├── AuthContext.tsx            # Dual auth: Discord (Supabase) + Postman (session)
│   └── ProgressContext.tsx        # Dual backend: Supabase + localStorage fallback
├── lib/
│   ├── supabase/                 # Supabase clients (browser, server, proxy)
│   ├── postman-api.ts            # Server-side Postman API client
│   ├── validators/               # Validator functions (one subdir per module)
│   ├── scoring.ts                # Rank definitions and calculation
│   └── content-loader.ts         # Module/lesson/learning-path data loader
├── proxy.ts                      # Next.js 16 proxy (session refresh)
└── types/                        # TypeScript type definitions
supabase/
└── migrations/
    └── 001_initial_schema.sql    # Database schema, RLS policies, functions
```

---

## Environment Variables


| Variable                        | Required | Description                                                 |
| ------------------------------- | -------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key (safe to expose — RLS protects data) |
| `NEXT_PUBLIC_SITE_URL`          | Yes*     | Public origin (no basePath), e.g. `https://www.postman.com`. Required whenever a CDN/proxy in front of the deployment rewrites the Host header — otherwise the OAuth callback redirect breaks |
| `GEMINI_API_KEY`                | No       | Google Gemini API key for badge generation                  |


---

## Deployment

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the [SQL Editor](https://supabase.com/dashboard/project/_/sql/new)
3. Enable **Discord** under Authentication → Providers:
  - Create a Discord application at [discord.com/developers](https://discord.com/developers/applications)
  - Copy Client ID and Client Secret into Supabase
  - Copy the Redirect URL Supabase shows on that page (`https://<project>.supabase.co/auth/v1/callback`) into the Discord app's OAuth2 → Redirects — Discord redirects to Supabase, not to this app directly
4. Under Authentication → URL Configuration, add `https://<your-domain>/api/auth/callback/` (trailing slash required — see note below) to Redirect URLs, and set Site URL to `https://<your-domain>`
5. Copy the project URL and anon key into your environment variables

> If this app runs behind a CDN/proxy, that layer may normalize paths by adding a trailing slash and dropping query strings in the process — which silently strips the OAuth `code` param. Registering the callback URL with a trailing slash from the start (as `AuthContext.tsx` does) avoids the redirect entirely.

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new) — point to repo root `/`
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, and `NEXT_PUBLIC_SITE_URL` if serving behind a CDN/custom domain that rewrites the Host header
4. Deploy
5. Add `https://<app>.vercel.app/api/auth/callback/` (trailing slash) to Supabase → Authentication → URL Configuration → Redirect URLs, and set Site URL to `https://<app>.vercel.app`

### Any Node.js Host

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables. The app runs on port 3000 by default (override with `PORT`).

---

## Scoring


| Rank               | Points | Badge              |
| ------------------ | ------ | ------------------ |
| Space Cadet        | 0      | Space Cadet        |
| Mission Specialist | 50     | Mission Specialist |
| Commander          | 100    | Commander          |
| Flight Director    | 500    | Flight Director    |
| Galaxy Brain       | 1,000  | Galaxy Brain       |
| Supernova          | 5,000  | Supernova          |
| Mass Relay         | 10,000 | Mass Relay         |


## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **React 19** with Context + useReducer for state management
- **Supabase** (PostgreSQL + Auth with Discord OAuth + RLS)
- **Tailwind CSS v4** with dark glassmorphism theme
- **Postman API** for workspace/collection/environment validation
- **Vercel** for deployment

