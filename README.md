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

| State | Postman Key | Discord | Progress Storage |
|-------|------------|---------|-----------------|
| Anonymous | No | No | None |
| Browsing | No | Yes | Can view saved progress, can't validate |
| Postman-only | Yes | No | localStorage (local only) |
| Registered | Yes | Yes | Supabase (persistent) |

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

**[Full module authoring guide →](docs/creating-a-module.md)**

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages + API routes
│   ├── api/
│   │   ├── auth/                 # Discord OAuth callback + sign-out
│   │   └── postman/              # Postman API proxy + validation
│   ├── auth/                     # Discord sign-in page
│   ├── modules/                  # Module and lesson pages
│   └── results/                  # Score and rank display
├── components/
│   ├── auth/                     # DiscordSignInButton, PostmanConnectionBar,
│   │                             # AuthGuard, ImportProgressModal,
│   │                             # DiscordCommunityModal
│   ├── lesson/                   # StepCard, ValidateButton, ProgressBar
│   └── scoring/                  # PointsDisplay, RankBadge, CelebrationOverlay
├── content/modules/              # Module definitions (one dir per module)
├── context/
│   ├── AuthContext.tsx            # Dual auth: Discord (Supabase) + Postman (session)
│   └── ProgressContext.tsx        # Dual backend: Supabase + localStorage fallback
├── lib/
│   ├── supabase/                 # Supabase clients (browser, server, proxy)
│   ├── postman-api.ts            # Server-side Postman API client
│   ├── validators/               # Validator functions (one subdir per module)
│   ├── scoring.ts                # Rank definitions and calculation
│   └── content-loader.ts         # Module/lesson data loader
├── proxy.ts                      # Next.js 16 proxy (session refresh)
└── types/                        # TypeScript type definitions
supabase/
└── migrations/
    └── 001_initial_schema.sql    # Database schema, RLS policies, functions
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (safe to expose — RLS protects data) |
| `GEMINI_API_KEY` | No | Google Gemini API key for badge generation |

---

## Deployment

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the [SQL Editor](https://supabase.com/dashboard/project/_/sql/new)
3. Enable **Discord** under Authentication → Providers:
   - Create a Discord application at [discord.com/developers](https://discord.com/developers/applications)
   - Copy Client ID and Client Secret into Supabase
   - Add redirect URL: `https://<your-domain>/api/auth/callback`
4. Copy the project URL and anon key into your environment variables

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new) — point to repo root `/`
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`
4. Deploy
5. Add your Vercel production URL to:
   - Discord Developer Portal → OAuth2 → Redirects: `https://<app>.vercel.app/api/auth/callback`
   - Supabase → Authentication → URL Configuration → Redirect URLs: same URL

### Any Node.js Host

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables. The app runs on port 3000 by default (override with `PORT`).

---

## Scoring

| Rank | Points | Badge |
|------|--------|-------|
| Space Cadet | 0 | ![Space Cadet](public/ranks/cadet.png) |
| Mission Specialist | 50 | ![Mission Specialist](public/ranks/specialist.png) |
| Commander | 100 | ![Commander](public/ranks/commander.png) |
| Flight Director | 500 | ![Flight Director](public/ranks/flight-director.png) |
| Galaxy Brain | 1,000 | ![Galaxy Brain](public/ranks/galaxy-brain.png) |
| Supernova | 5,000 | ![Supernova](public/ranks/supernova.png) |
| Mass Relay | 10,000 | ![Mass Relay](public/ranks/mass-relay.png) |

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **React 19** with Context + useReducer for state management
- **Supabase** (PostgreSQL + Auth with Discord OAuth + RLS)
- **Tailwind CSS v4** with dark glassmorphism theme
- **Postman API** for workspace/collection/environment validation
- **Vercel** for deployment
