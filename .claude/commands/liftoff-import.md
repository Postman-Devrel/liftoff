# LiftOff Tutorial Importer

Import an existing online tutorial and convert it into a LiftOff `content.md` file, ready for module creation.

**Usage:** `/liftoff-import <url>`

The argument is the URL of an existing tutorial to import. If no URL is provided, ask the user for one.

---

## Overview

This skill fetches an external tutorial, converts it into LiftOff's `content.md` format, and reviews it for completeness. The skill's job ends at `content.md` — it does NOT create `module.json` or validators directly. If the content is sufficient, it hands off to `/liftoff-module create` for the actual module creation.

---

## Steps

### 1. Fetch the Tutorial

Use the `WebFetch` tool to retrieve the content at the provided URL.

- If the URL returns HTML, extract the main article/tutorial content — strip navigation, ads, footers, sidebars, and other chrome.
- If the URL returns markdown, use it directly.
- If the fetch fails, report the error and ask the user to provide the content another way (paste it, or provide a different URL).

### 2. Analyze the Tutorial Structure

Parse the fetched content and identify these elements:

| Element | Required | How to Find |
|---------|----------|-------------|
| **Title** | Yes | The main heading, `<h1>`, or page title |
| **Description** | Yes | Intro paragraph, meta description, or first paragraph |
| **Parts / Lessons** | Yes | Major sections (`<h2>`, numbered sections, or logical groupings) |
| **Steps** | Yes | Sub-sections within each part (`<h3>`, numbered lists, or sequential instructions) |
| **Validation criteria** | Ideal | Look for expected outcomes, success indicators, checkpoints, or "you should see" language |

Also assess:
- **Postman relevance:** Does this tutorial involve Postman, APIs, or tasks that can be validated via the Postman API?
- **Actionable steps:** Are the steps concrete actions the learner performs, or just reading material?
- **Step granularity:** Are steps small and focused (one action each), or do they bundle multiple actions?

### 3. Convert to content.md

Transform the parsed content into LiftOff's content.md format:

```markdown
# Module Title

Module description.

## Part 1: Lesson Title

Lesson intro text.

### Step 1: Step Title

Detailed instructions for the learner.
- Specific actions to take
- Exact values to enter

**Validation:** What the validator should check to verify completion.

### Step 2: Next Step Title

More instructions...

**Validation:** What to check for this step.

## Part 2: Next Lesson Title

...
```

#### Conversion rules:

- The tutorial's main title becomes the H1
- The intro/description becomes the paragraph after H1
- Major sections become `## Part N: Lesson Title`
- Sub-steps become `### Step N: Step Title` within each Part
- **Every step MUST have a `**Validation:**` block.** If the original tutorial doesn't state what to check, infer it from the instructions:
  - "Create a workspace named X" → `**Validation:** Workspace named "X" exists and was created by the current user.`
  - "Add a GET request to URL" → `**Validation:** A GET request to "URL" exists in the collection.`
  - "Create an environment variable X = Y" → `**Validation:** Environment variable "X" is set to "Y".`
  - For steps that can't be validated via the Postman API, note this in the validation block: `**Validation:** [MANUAL] Learner should verify that...`
- Keep steps small — if a tutorial section bundles multiple actions, split them into separate steps
- Preserve code snippets, URLs, and specific values from the original
- **URLs must use markdown link syntax** `[text](url)` — bare URLs will not render as clickable links in the UI. Convert any bare URL to `[url](url)` format.
- **Copyable content detection:** The UI automatically adds "Copy" buttons to fenced code blocks and blockquotes. Use these conventions:
  - **AI/Agent Mode prompts** → wrap in blockquotes (`> prompt text here`) so the learner gets a "Copy prompt" button
  - **JSON payloads, code snippets, URLs to paste** → wrap in fenced code blocks (triple backticks) so the learner gets a "Copy" button
  - Do NOT use inline code (single backticks) for content the learner needs to copy — inline code does not get a copy button
- Add the Postman environment share notice to any step that sets environment variables:
  > **Important:** After setting values, click the **Share** button (or **Persist All**) in the environment editor to sync your values to the cloud. LiftOff validates via the Postman API, which can only see shared/initial values — not local current values.

#### Rich content requirements — CRITICAL:

Step descriptions are the ONLY thing the learner sees. They must be self-contained and actionable. Do NOT summarize — include everything the learner needs:

- **Numbered instructions:** Every step should have numbered sub-steps (1, 2, 3...) so the learner knows the exact sequence of actions.
- **Exact JSON payloads:** If the tutorial includes request bodies, include the FULL JSON in a fenced code block. Never say "send a POST with your details" — show the exact payload.
- **Agent Mode / AI prompts:** If the step involves prompting an AI tool, include the exact prompt text in a blockquote (`>`). The learner should be able to copy-paste it.
- **Expected outcomes:** State what the learner should see after each action (e.g. "expect `201 Created`", "the Visualize tab shows your dashboard").
- **Troubleshooting tips:** If the tutorial mentions common errors (401, missing values, etc.), include them with fixes.
- **Reference tables:** If a step involves choosing from allowed values (categories, phases, crew members, etc.), include the table of valid options.
- **Reference links:** If the tutorial links to additional resources, guides, or documentation, include them as markdown links.
- **Cautions / warnings:** If there are gotchas (e.g. "anomaly logs can't be deleted"), include them prominently.

Bad example (too terse):
> Create 3 mission logs using POST /logs with different categories covering navigation, life-support, and communication.

Good example (actionable):
> Create 3 mission logs using **POST /logs**. Each log needs `title`, `description`, `phase`, `category`, and `crew_member`.
>
> **Log 1/3 — Navigation Check:**
> ```json
> {
>   "title": "Pre-flight navigation check complete",
>   "description": "All star trackers aligned and verified for lunar transit",
>   "phase": "pre-launch",
>   "category": "navigation",
>   "crew_member": "wiseman"
> }
> ```
> Expect `201 Created` — note the `log.id` in the response for later.

### 4. Save the content.md

Pick a `module-id` (kebab-case derived from the title) and save the file:

- Create the directory `src/content/modules/<module-id>/`
- Save the converted content as `src/content/modules/<module-id>/content.md`

### 5. Review and Report

Perform a quality review and classify the result into one of two categories:

#### Category A: Sufficient — hand off to /liftoff-module create

The content is sufficient if ALL of the following are true:
- Has a clear title and description
- Has at least 1 lesson with at least 1 step
- Every step has a validation block (even if some are `[MANUAL]`)
- Steps are actionable (the learner does something concrete)
- At least some validations can be automated via the Postman API

**If sufficient**, present the import summary, then **automatically invoke `/liftoff-module create`** and point it to the saved `content.md`. The `/liftoff-module create` skill handles generating `module.json`, validators, content-loader registration, and build verification.

```
## Import Summary: <Module Title>

**Source:** <url>
**Status:** ✓ Content ready — creating module...

| Metric | Value |
|--------|-------|
| Lessons | <N> |
| Steps | <N> |
| Total points | <N × 10> |
| Auto-validatable steps | <N> |
| Manual-only steps | <N> |

### Validation Notes
<List any steps with [MANUAL] validation or inferred validation that may need review>

Handing off to /liftoff-module create...
```

Then run `/liftoff-module create` — when it asks for the markdown file, use `src/content/modules/<module-id>/content.md`.

#### Category B: Gaps found — present review to user

The content has gaps if ANY of the following are true:
- No clear title or description could be extracted
- The content is purely explanatory with no actionable steps
- Steps are too vague to determine validation criteria
- No steps can be validated via the Postman API
- The tutorial structure doesn't map well to lessons/steps

**If gaps found:**
1. Still save the best-effort `content.md` to `src/content/modules/<module-id>/content.md`
2. Present a detailed review summary
3. Do NOT create `module.json` — wait for the user to address the gaps
4. Tell the user they can run `/liftoff-module create` once they've edited the content.md

```
## Import Review: <Best-guess Title>

**Source:** <url>
**Status:** ⚠ Gaps found — manual review needed

### What Was Extracted
- Title: <title or "❌ Could not determine">
- Description: <description or "❌ Missing">
- Lessons: <N found>
- Steps: <N found>

### Gaps & Recommendations

1. **<Gap title>** — <explanation and suggestion>
2. **<Gap title>** — <explanation and suggestion>
...

### Saved Draft
A best-effort `content.md` has been saved to:
`src/content/modules/<id>/content.md`

Edit this file to address the gaps above, then run:
`/liftoff-module create`
```

---

## Edge Cases

- **Non-Postman tutorials:** Import them anyway — many API/developer tutorials can be adapted. Flag steps that need Postman-specific instructions added.
- **Very long tutorials:** If the tutorial has more than ~30 steps, suggest splitting into multiple modules. Still create the first module and note the remainder.
- **Paywalled or login-required content:** If the fetch fails or returns minimal content, tell the user to paste the tutorial content directly.
- **Non-English content:** Import as-is, note the language, and let the user decide whether to translate.

---

## Reference Files

- Content format guide: `docs/creating-a-module.md`
- Module manager skill: `.claude/commands/liftoff-module.md`
- Existing modules for reference: `src/content/modules/`
