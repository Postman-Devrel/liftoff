# LiftOff Learning Path Manager

Manage LiftOff learning paths. Accepts one subcommand: `create`, `edit`, `delete`, or `list`.

**Usage:** `/liftoff-learningpath <create|edit|delete|list> [args]`

---

## Subcommand: `create`

Scaffold a new learning path.

1. Ask the user (or accept from args):
   - `id` — kebab-case slug (e.g. `intro-to-postman`). Must be unique. Derive from title if not provided.
   - `title` — display name (e.g. "Introduction to Postman")
   - `description` — one to two sentences shown on the path card
   - `icon` — a single emoji that represents the path
   - `color` — hex color for the card accent (e.g. `#8B5CF6`). Suggest one based on the topic.
   - `moduleIds` — ordered list of module IDs to include. Validate each ID exists in `src/content/modules/`.
   - `private` — boolean, default `false`
   - `--badge` flag — if present, generate a badge via Gemini (see Badge section)

2. Create the directory: `src/content/learning-paths/<id>/`

3. Write `learning-path.json`:
```json
{
  "id": "<id>",
  "title": "<title>",
  "description": "<description>",
  "icon": "<icon>",
  "color": "<color>",
  "moduleIds": ["<module-id>", ...],
  "private": false
}
```

4. Register the new path in `src/lib/content-loader.ts`:
   - Add import: `import <camelCaseId>Path from "@/content/learning-paths/<id>/learning-path.json";`
   - Add to `allLearningPaths` array: `<camelCaseId>Path as LearningPath`

5. If `--badge` flag is present, generate a badge (see Badge section below).

6. Verify the build: `npx next build` — fix any TypeScript errors before reporting success.

7. Report: path ID, URL (`/learning-paths/<id>`), module count, private status.

---

## Subcommand: `edit`

Add or remove modules from a learning path, rename it, change its description/color/icon, or toggle private.

1. If no path ID is provided in args, list all learning paths and ask which to edit.
2. Read the current `learning-path.json`.
3. Present a numbered menu of fields that can be edited:
   1. **Title** — current value shown
   2. **Description** — current value shown
   3. **Color** — current value shown
   4. **Modules** — current list shown (add, remove, or reorder)
   5. **Badge** — regenerate the badge image via Gemini
   6. **Private** — current value shown (toggle)

   Ask: "What would you like to change? (enter a number)"
   Accept the user's selection and prompt for the new value. After applying the change, ask if they'd like to change anything else — if yes, show the menu again with updated values.
4. Write updated `learning-path.json`.
5. If `--badge` flag is present, regenerate the badge.
6. Verify the build passes.
7. Report what changed.

---

## Subcommand: `delete`

Remove a learning path.

1. If no path ID is provided, list all paths and ask which to delete.
2. Confirm with the user: "This will delete `src/content/learning-paths/<id>/` and remove it from content-loader.ts. Continue?"
3. Remove the import and array entry from `src/lib/content-loader.ts`.
4. Delete the directory: `src/content/learning-paths/<id>/`
5. Verify the build passes.
6. Report success.

---

## Subcommand: `list`

List all learning paths including private ones.

1. Read all `learning-path.json` files from `src/content/learning-paths/*/`.
2. For each path, show:
   - ID and title
   - Module count and module IDs
   - Private status
   - Whether a badge.png exists
3. Also show available module IDs (from `src/content/modules/`) that are not yet in any path.

---

## Badge Generation

When `--badge` is passed (or during `create`, always generate a badge), use the shared badge generation script:

```bash
npx tsx scripts/generate-badge.ts <path-id> "<prompt>" --learning-path
```

The `--learning-path` flag writes to `src/content/learning-paths/<id>/badge.png` instead of the modules directory.

Check for `GEMINI_API_KEY` in `.env.local` first. If absent, tell the user to add it and skip generation.

---

## Validation

- Module IDs in `moduleIds` must exist as directories under `src/content/modules/`
- Path `id` must be unique across all learning paths
- `color` must be a valid hex color (`#RRGGBB`)
- After any create/edit/delete, always run `npx next build` to verify no TypeScript or import errors

---

## File Locations

| File | Purpose |
|------|---------|
| `src/content/learning-paths/<id>/learning-path.json` | Path definition |
| `src/content/learning-paths/<id>/badge.png` | Optional completion badge |
| `src/lib/content-loader.ts` | Import registry (update on create/delete) |
| `src/types/learning-path.ts` | TypeScript type definition |
| `src/app/api/learning-paths/[pathId]/badge/route.ts` | Badge serving API route |
| `src/app/learning-paths/[pathId]/page.tsx` | Path detail page |
