# LiftOff Module Manager

Manage learning modules for the LiftOff platform. This skill supports three subcommands:

**Usage:** `/liftoff-module <create|update|sync|badge> [--badge]`

Parse the user's argument to determine which subcommand to run. If no argument is provided, ask which action they'd like to take.

- The `--badge` flag on `create` or `update` generates a badge as part of that flow.
- The `badge` subcommand generates (or regenerates) a badge for an existing module standalone.

---

## Subcommand: `create`

Create a brand new module from a content markdown file.

### Steps:

1. Ask the user which markdown file contains their module content. Look in `docs/` or ask for a path.

2. Read the markdown file and parse its structure:
   - The H1 (`#`) becomes the module **title**
   - The paragraph after H1 becomes the **description**
   - Each H2 (`## Part N: ...`) becomes a **lesson**
   - Each H3 (`### Step N: ...`) within a Part becomes a **step**
   - The `**Validation:**` block in each step describes what the validator should check
   - If `**PRIVATE**` appears anywhere in the first 5 lines of the file (before or after the H1), the module is private — skip the prompt below and remove that line before parsing the rest of the content
   - **If no `**PRIVATE**` marker is found**, ask the user: "Should this module be public or private? (public = visible on the home page and learning paths; private = accessible only via direct URL)" — default to public

3. Set `"private": true` in `module.json` if the `**PRIVATE**` marker was found OR if the user chose private in the prompt above. Omit the field entirely for public modules.

4. Generate a `module.json` with this schema:

```json
{
  "id": "<kebab-case-module-id>",
  "title": "<Module Title>",
  "description": "<Module description>",
  "color": "<hex color — pick from: #FF6C37, #8B5CF6, #06B6D4, #F59E0B, #10B981, #EC4899>",
  "icon": "<single emoji representing the module>",
  "private": true,  // ONLY include if module is private — omit this field for public modules
  "lessons": [
    {
      "id": "lesson-<N>-<kebab-slug>",
      "slug": "<kebab-slug>",
      "title": "<Lesson Title>",
      "partNumber": <N>,
      "steps": [
        {
          "id": "step-<N>-<kebab-slug>",
          "stepNumber": <N>,
          "title": "<Step Title>",
          "description": "<Full step instructions from the markdown, preserving all formatting including markdown links>",
          "points": 10,
          "validatorId": "validate-<module-id>-<step-kebab-slug>",
          "manual": true  // ONLY if the Validation block contains [MANUAL] — omit this field otherwise
        }
      ]
    }
  ]
}
```

5. Save to `src/content/modules/<module-id>/module.json`
6. Copy the original markdown to `src/content/modules/<module-id>/content.md`
7. Add the new module import to `src/lib/content-loader.ts` in the `modules` array
8. If the `--badge` flag was passed, run **Badge Generation** (see section below)
9. **Automatically run the `sync` subcommand** (below) to generate validators and verify the build — do not ask the user to run it separately

### Rules:
- Module IDs must be kebab-case and unique across existing modules
- Validator IDs follow pattern: `validate-<module-id>-<step-slug>`
- Check existing modules in `src/content/modules/` to pick a unique color
- Every step gets 10 points
- Steps with `[MANUAL]` in their `**Validation:**` block must include `"manual": true` in module.json — the UI shows "Done" instead of "Validate" for these steps
- **URLs in descriptions must use markdown link syntax** `[text](url)` — bare URLs will not render as clickable links. When copying descriptions from content.md, preserve all markdown link formatting.

### Rich description requirements — CRITICAL:
Step descriptions are the ONLY thing the learner sees in the UI. Copy the FULL content from content.md — do NOT summarize, truncate, or paraphrase. Descriptions must include:
- **Numbered instructions** (1, 2, 3...) for the exact sequence of actions
- **Exact JSON payloads** in fenced code blocks — never summarize request bodies
- **AI/Agent Mode prompts** in blockquotes — the learner should copy-paste these
- **Expected outcomes** after each action (status codes, what appears in the UI)
- **Troubleshooting tips** for common errors
- **Reference tables** for allowed values (categories, phases, etc.)
- **Reference links** to external guides or documentation
- **Cautions/warnings** about gotchas (e.g. data that can't be deleted)

The description field supports full markdown including headings, code blocks, tables, blockquotes, and lists. Use them.

---

## Subcommand: `update`

Sync `module.json` to match the current `content.md`. The markdown file is the **source of truth** — this command handles additions, modifications, and removals.

### Steps:

1. List modules in `src/content/modules/` and ask which one to update (or accept a module ID).
2. The content source is the module's own `content.md` (at `src/content/modules/<module-id>/content.md`). Do NOT ask the user for a separate markdown file — always read from `content.md` directly.
3. Read the existing `module.json` to understand what already exists.
4. Read `content.md` and parse it the same way as `create`. Check for the `**PRIVATE**` marker in the first 5 lines and sync the `private` field in `module.json` accordingly — add `"private": true` if the marker is present, remove it if the marker is absent.
5. Diff the parsed content against `module.json` and apply **all** changes:
   - **New lessons/steps** in `content.md` → add to `module.json`, generate validators
   - **Removed lessons/steps** (in `module.json` but not `content.md`) → remove from `module.json`, delete the validator file, remove the import and registry entry from `src/lib/validators/index.ts`, and remove any now-unused helper functions from `src/lib/postman-api.ts`
   - **Modified steps** (same step number/slug but different title or description) → update the step in `module.json`, and regenerate the validator if the validation logic changed
   - Renumber steps sequentially within each lesson after removals
6. Save the updated `module.json`
7. If the `--badge` flag was passed and no `badge.png` exists yet in the module directory, run **Badge Generation** (see section below). If a badge already exists, skip — don't overwrite it.
8. **Automatically run the `sync` subcommand** (below) to generate any missing validators and verify the build — do not ask the user to run it separately

### Rules:
- `content.md` is the source of truth — `module.json` must match it after update
- Validator IDs for new steps follow the same pattern: `validate-<module-id>-<step-slug>`
- Keep step numbering sequential within each lesson
- When removing validators, also clean up unused imports/functions in `postman-api.ts`

---

## Subcommand: `badge`

Generate or regenerate a badge image for an existing module.

### Steps:

1. List modules in `src/content/modules/` and ask which one to generate a badge for (or accept a module ID).
2. Read the module's `module.json` to get the title, description, and color for the prompt.
3. If a `badge.png` already exists, ask the user if they want to overwrite it.
4. Run **Badge Generation** (see section below).

---

## Subcommand: `sync`

Read the current `module.json` and generate any missing validators, register them, and verify wiring.

### Steps:

1. List modules in `src/content/modules/` and ask which one to sync (or accept a module ID). If there's only one, use it automatically.

2. Read the module's `module.json`.

3. For each step in every lesson, check if a validator file already exists:
   - Look for the validator function in `src/lib/validators/` by searching for the `validatorId` in the registry at `src/lib/validators/index.ts`

4. For each **missing** validator, generate a validator file:

   Read the step's `description` and (if available) `content.md` to understand what needs to be validated.

   Create the file at `src/lib/validators/<module-id>/<validatorId>.ts`. Each module's validators live in their own subdirectory.

   Each validator must:
   - Import `ValidatorFn` from `@/types/validation`
   - Import helpers from `@/lib/postman-api`
   - Export a named `ValidatorFn` function
   - Use `context.userId` to scope checks to the current user
   - Use `context.workspaceId` / `context.environmentId` from prior steps when available
   - Return updated context with any IDs discovered
   - Give clear, helpful error messages on failure

   **Reference existing validators** in `src/lib/validators/` for patterns:

   **Workspace check pattern:**
   ```typescript
   import { listWorkspaces, getWorkspace } from "@/lib/postman-api";
   // List workspaces, find by name regex, verify createdBy === context.userId
   ```

   **Collection check pattern:**
   ```typescript
   import { getWorkspace } from "@/lib/postman-api";
   // Get workspace detail, check collections array
   ```

   **Environment check pattern:**
   ```typescript
   import { getWorkspace, getEnvironment } from "@/lib/postman-api";
   import { resolveEnvVar } from "@/lib/validators/env-helpers";
   // Get workspace environments, find by name, then use resolveEnvVar to read each variable.
   // resolveEnvVar automatically handles: variable missing → error, value empty/unshared → PERSIST_HINT.
   // IMPORTANT: The Postman API only returns shared/initial values — NOT local current values.
   ```

   **ALWAYS use `resolveEnvVar` from `@/lib/validators/env-helpers`** when reading environment variable values. Never manually check variable values with `.find()` or inline logic — `resolveEnvVar` returns either the value string or a `ValidationResult` with the correct error message, including the sharing/persist hint when the value is empty. Usage:
   ```typescript
   const val = resolveEnvVar(envValues, "varName", "Optional custom missing message");
   if (typeof val !== "string") return val; // propagate error with auto-hint
   // val is the verified non-empty string value
   ```

   **Environment step instructions rule:**
   Any step that creates or updates environment variables MUST include this notice in its description:
   > **Important:** After setting values, click the **Share** button (or **Persist All**) in the environment editor to sync your values to the cloud. LiftOff validates via the Postman API, which can only see shared/initial values — not local current values.

   **API response check pattern:**
   ```typescript
   // Call the target API directly and check status/body
   // This is for steps that ask the learner to verify an API is running
   ```

   **Collection content check pattern:**
   ```typescript
   import { getWorkspace } from "@/lib/postman-api";
   // Check that specific requests exist in a collection
   // Or that a collection has tests/scripts
   ```

   If a step requires a Postman API method that doesn't exist in `src/lib/postman-api.ts`, add it there first.

5. Update `src/lib/validators/index.ts`:
   - Import each new validator
   - Add entries to the `validatorRegistry` object

6. Verify the module is imported in `src/lib/content-loader.ts`. If not, add it.

7. Run `npx next build` to verify no TypeScript errors.

8. Report what was generated:
   - How many validators were created vs already existed
   - Any new methods added to postman-api.ts
   - Whether the build passed

---

## General Guidelines

- Always scope Postman API checks to the current user using `context.userId`
- Chain context between steps — early steps discover IDs that later steps depend on
- Validators must handle missing prerequisites gracefully ("Complete Step N first")
- Follow existing code patterns — don't introduce new abstractions
- Give clear error messages that tell the user exactly what's wrong and how to fix it
- When in doubt about what a step should validate, ask the user

## Badge Generation

When the `--badge` flag is passed, or the `badge` subcommand is used, generate a badge image for the module using the Gemini API directly (no CLI tools required).

### Requirements:
- **Dimensions:** 512x512 pixels (1:1 aspect ratio)
- **Format:** PNG
- **Output path:** `src/content/modules/<module-id>/badge.png`
- The badge is served at runtime via `/api/modules/<module-id>/badge`
- **API key:** `GEMINI_API_KEY` must be set in `.env.local`

### How to generate:

Use the generate-badge script built into the project:

```bash
npx tsx scripts/generate-badge.ts <module-id> "<prompt>"
```

The script reads `GEMINI_API_KEY` from `.env.local`, calls the Gemini API, and saves the result as `badge.png` in the module directory.

If the script fails or the key is missing, tell the user to set `GEMINI_API_KEY` in `.env.local` (get one free at https://aistudio.google.com/app/apikey).

### Prompt guidelines:

Craft a prompt that creates a flat vector style badge/achievement icon for the module. Always use flat vector style — no photorealism, no 3D rendering, no gradients mimicking depth. Include:
- The module's theme (e.g., "space mission control", "API testing")
- Badge/shield/emblem style
- The module's accent color
- Vibrant gradient background using the module's accent color palette (e.g., orange fading to deep amber, purple fading to indigo) — must stand out against a dark UI, not blend in. Do not use white backgrounds
- "Flat vector style" (mandatory)

Example prompt:
> "A digital achievement badge emblem for completing an API space mission workshop. Circular shield design with a rocket launching through an orange nebula. Vibrant orange-to-deep-amber gradient background. Flat vector style with clean edges and subtle glow effects. No text. No 3D. No photorealism."

### Fallback:

The user can also manually place a 512x512 PNG at `src/content/modules/<module-id>/badge.png`.

---

## Reference Files

- Module type definitions: `src/types/module.ts`
- Validation types: `src/types/validation.ts`
- Postman API client: `src/lib/postman-api.ts`
- Existing validators: `src/lib/validators/`
- Environment variable helper: `src/lib/validators/env-helpers.ts` (resolveEnvVar — MUST use for all env var checks)
- Validator registry: `src/lib/validators/index.ts`
- Content loader: `src/lib/content-loader.ts`
- Module authoring guide: `docs/creating-a-module.md`
