# Creating a LiftOff Learning Path

Learning paths group modules into curated tracks — AI, APIs, Testing, Introduction to Postman, and so on. The home page lists learning paths by default, and completing all modules in a path earns a completion badge.

## How It Works

```
Modules           Claude Code Skill                Output
───────          ──────────────────               ──────
module IDs  →   /liftoff-learningpath create  →   learning-path.json
                                                   badge.png (optional)
```

A learning path is a lightweight JSON definition — no code to write. Modules can belong to multiple paths.

---

## Using the Skill

```
/liftoff-learningpath create   → scaffold a new learning path (with optional badge)
/liftoff-learningpath edit     → add/remove modules, rename, toggle private
/liftoff-learningpath delete   → remove a learning path
/liftoff-learningpath list     → list all paths (including private ones)
```

---

## Creating a Learning Path

Run `/liftoff-learningpath create` and you'll be prompted for:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Kebab-case slug (unique, matches directory name) | `intro-to-postman` |
| `title` | Display name shown on the home page | `Introduction to Postman` |
| `description` | One to two sentences shown on the path card | `Start your API journey here.` |
| `color` | Hex accent color for the card and progress bar | `#8B5CF6` |
| `moduleIds` | Ordered list of module IDs to include | `["api-basics"]` |
| `private` | Whether to hide from public listings (default: false) | `true` / `false` |

A badge is always generated during `create` via the Gemini API (requires `GEMINI_API_KEY` in `.env.local`). You can regenerate it anytime with `/liftoff-learningpath edit` → Badge.

---

## File Structure

Each learning path lives in its own directory:

```
src/content/learning-paths/<path-id>/
├── learning-path.json    # Path metadata and module list
└── badge.png             # Optional path completion badge (512x512 PNG)
```

**`learning-path.json` example:**

```json
{
  "id": "build-with-ai",
  "title": "Build with AI",
  "description": "Build AI-powered API workflows with MCP, agents, and LLM integration.",
  "color": "#06B6D4",
  "moduleIds": ["banking-ai-mcp-bootcamp"],
  "private": false
}
```

---

## Adding Modules to a Path

Run `/liftoff-learningpath edit` to add or remove modules from an existing path. You can also:

- Reorder modules (order in `moduleIds` is the display order)
- Change the title, description, or color
- Regenerate the badge
- Toggle private/public

Modules must exist in `src/content/modules/` before they can be added to a path.

---

## Private Learning Paths

Set `private: true` (via the prompt or by editing `learning-path.json`) to hide a path from the home page. Private paths:

- Do **not** appear in the home page path list or filter tabs
- Do **not** earn completion badges (since users can't discover them)
- **Are** accessible at `/learning-paths/<path-id>` for users with the direct link

Use private paths for work-in-progress tracks, beta programs, or event-specific content.

---

## Path Completion Badges

A path badge is awarded when the learner completes **all modules** in the path. It appears in their profile alongside module badges.

To add a badge:
1. Place a `badge.png` (512x512 PNG) in `src/content/learning-paths/<path-id>/`
2. Or pass `--badge` when creating/editing the path to generate one via the Gemini API

If no `badge.png` is present, a 🛸 placeholder is shown as a fallback.

---

## Registering a Path

After creating a path directory and JSON file, the skill automatically registers it in `src/lib/content-loader.ts`:

```typescript
import myPathData from "@/content/learning-paths/my-path/learning-path.json";

const allLearningPaths: LearningPath[] = [
  // ...existing paths
  myPathData as LearningPath,
];
```

The skill handles this for you — but if you're creating a path manually, add the import and entry there.

---

## Related

- [Creating a Module →](creating-a-module.md)
- Module type definitions: `src/types/module.ts`
- Learning path type: `src/types/learning-path.ts`
- Content loader: `src/lib/content-loader.ts`
- Learning path detail page: `src/app/learning-paths/[pathId]/page.tsx`
