# Creating a LiftOff Learning Module

LiftOff modules are created using Claude Code skills that turn markdown content into a fully wired learning module — complete with lesson structure, server-side validators, and optional badge art. You don't need to write any code manually.

## How It Works

```
Content Source          Claude Code Skill          Output
─────────────          ─────────────────          ──────
URL or markdown   →   /liftoff-module create   →   module.json
                                                    validators/
                                                    content.md
                                                    badge.png (optional)
```

You provide learning content as a **markdown file** or a **URL** (blog post, tutorial, doc page). Claude reads it, structures it into lessons and steps, generates the `module.json`, writes all the server-side Postman API validators, registers everything, and verifies the build passes.

## Starting from a URL

If your content already exists online — a quickstart, tutorial, a Postman Learning Center page,etc — just paste the URL when Claude asks for your source. It is designed to work best when the page has a learning structure: steps, instructions, and how to validate results.

```
/liftoff-module create your-url.com
```

Claude will fetch the page, extract the learning content, and structure it into the standard lesson/step format. It works best when the source has clear sections and actionable steps.

## Starting from a Markdown File

If you prefer to write content from scratch (or want more control), create a markdown file in `docs/` using this format:

```markdown
# Module Title

A short description of what the learner will accomplish.

## Part 1: Lesson Title

Brief intro to this lesson.

### Step 1: Step Title

Detailed instructions for what the learner needs to do.

- Bullet points for specific actions
- Include exact values they should enter
- Reference URLs or resources they need

**Validation:** Describe what should be checked to verify completion.
For example: "A workspace named 'My Project - [name]' should exist in Postman."

### Step 2: Next Step Title

More instructions...

**Validation:** What to check for this step.

## Part 2: Next Lesson Title

...and so on.
```

Then run `/liftoff-module create your-markdown.md` and point Claude to your file.

### Content Guidelines

- Each **Part** (`## Part N`) becomes a **Lesson** (a groupable section)
- Each **Step** (`### Step N`) within a Part is an individually validated task worth 10 points
- Always include a `**Validation:**` block describing what the Postman API should check
- Be specific about expected names, values, and states
- Include URLs, code snippets, and exact values the learner will need

### Rich Content — CRITICAL

Step descriptions are the ONLY thing the learner sees. They must be **self-contained and actionable** — the learner should never need to leave the page to figure out what to do. Every step should include:

| Element | When to include | Example |
|---------|----------------|---------|
| Numbered instructions | Always | 1. Open the request 2. Set the body 3. Click Send |
| JSON payloads | Any step with a request body | Full JSON in a fenced code block |
| AI/Agent Mode prompts | Any step using Postman Agent Mode | Exact prompt in a blockquote |
| Expected outcomes | Always | "Expect `201 Created`", "Dashboard appears in Visualize tab" |
| Troubleshooting tips | When common errors exist | "If you get a 401, check that apiKey is set" |
| Reference tables | When choosing from allowed values | Table of valid phases, categories, etc. |
| Reference links | When external docs help | Link to API guides, story context, etc. |
| Cautions/warnings | When gotchas exist | "Anomaly logs cannot be deleted" |

**Bad:** "Create 3 logs using POST /logs with different categories."

**Good:** Full numbered instructions with each JSON payload, expected status codes, a table of allowed values, and a note about anomaly logs being permanent.

### Validation Types

## What `/liftoff-module create` Does

When you run the skill, Claude handles the entire pipeline:

1. **Reads your source** — fetches a URL or reads a local markdown file
2. **Parses the structure** — H1 becomes the module title, H2s become lessons, H3s become steps
3. **Generates `module.json`** — the structured definition with lesson/step metadata and validator IDs
4. **Saves to `src/content/modules/<module-id>/`** — creates the module directory with `module.json` and `content.md`
5. **Registers the module** in `src/lib/content-loader.ts`
6. **Generates all validators** — one TypeScript file per step in `src/lib/validators/<module-id>/`
7. **Wires the validator registry** — imports and entries in `src/lib/validators/index.ts`
8. **Verifies the build** — runs `npx next build` to catch any errors
9. **(Optional) Generates a badge** — if you pass `--badge`, creates a 512x512 badge via the Gemini API

## Module Structure

After creation, your module directory looks like this:

```
src/content/modules/<module-id>/
├── module.json          # Module metadata, lessons, and steps
├── content.md           # The learning content in markdown
└── badge.png            # Module completion badge (512x512 PNG, optional)
```

## Updating an Existing Module

Edit the module's `content.md` (the source of truth), then run:

```
/liftoff-module update
```

Claude diffs the markdown against the current `module.json` and applies all changes — adding new lessons/steps, removing deleted ones, and regenerating validators as needed. Step numbering is automatically adjusted.

## Other Skills

| Command | What it does |
|---------|-------------|
| `/liftoff-module create` | Create a new module from a URL or markdown file |
| `/liftoff-module create --badge` | Create a new module and auto-generate a completion badge |
| `/liftoff-module update` | Sync `module.json` to match the current `content.md` |
| `/liftoff-module update --badge` | Update and generate a badge if one doesn't exist |
| `/liftoff-module badge` | Generate or regenerate a badge for an existing module |
| `/liftoff-module sync` | Regenerate missing validators and verify the build |

## Validation Types

Your `**Validation:**` blocks should describe one of these check types:

| Check Type | Description | Example |
|------------|-------------|---------|
| Api Response | Call an API and check the response | "GET /health returns 200 OK" |
| Collection Exists | Check a collection exists in a workspace | "Collection containing 'Mission Control' in name" |
| Collection Requests | Verify a collection contains expected requests by name | "Collection has fromAccount, toAccount, and Create new transaction requests" |
| Collection Run | Check that a collection run passed | "All tests in the collection pass" |
| Env Var Secret | Verify an environment variable is marked as sensitive/secret | "apiKey variable type is 'secret'" |
| Environment Exists | Check an environment with specific name exists | "Environment 'Banking.local' exists in workspace" |
| Environment Values | Check specific variable values or presence | "baseUrl = 'https://example.com', apiKey is non-empty" |
| Manual | Self-verified step that cannot be validated via API | "Learner confirmed MCP server is configured" |
| Post Response Script | Check a request has a post-response script setting a variable | "fromAccount request has script saving accountId to env var" |
| Request Urls | Verify request URLs use a variable instead of hardcoded values | "All requests use {{baseUrl}} in their URL" |
| Test Scripts | Verify requests have test scripts (pm.test) | "All requests have status code and response time tests" |
| Workspace Exists | Check a workspace with a specific name pattern | "Workspace named 'Artemis II - [name]' exists" |
| Workspace Visibility | Verify workspace visibility/type settings | "Workspace visibility is Internal (team)" |

## Module Badge

Each module can have a completion badge displayed when the learner finishes all steps.

- **File:** `badge.png` in the module directory (alongside `module.json`)
- **Dimensions:** 512 x 512 pixels
- **Format:** PNG with transparency supported
- **Style:** Achievement emblem / shield / badge — dark background to match the app theme

### Auto-generate with Gemini

Pass `--badge` when creating or updating, or use the standalone command:

```
/liftoff-module create --badge
/liftoff-module badge
```

Requires a `GEMINI_API_KEY` in `.env.local` — get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

You can also run the script directly:

```bash
npx tsx scripts/generate-badge.ts <module-id> "your prompt here"
```

### Manual badge

Place any 512x512 PNG at `src/content/modules/<module-id>/badge.png`. If no badge is present, the module's emoji icon is displayed instead.

## Full Example

Below is a complete, ready-to-use module markdown. Save it to `docs/` and run `/liftoff-module create` to generate the module.

```markdown
# Getting Started with Postman

Learn the basics of Postman by creating a workspace, building a collection, and writing your first test — all using a free public API that returns coffee data.

## Part 1: Set Up Your Workspace

Every project in Postman starts with a workspace. In this lesson you'll create one to keep your work organized.

### Step 1: Create a Workspace

1. Open Postman and click **Workspaces** in the top nav, then **Create Workspace**.
2. Choose **Blank workspace**.
3. Name it: **Coffee API - [your name]** (for example, *Coffee API - Alex*).
4. Set visibility to **Personal** and click **Create**.

You now have a dedicated space for all the collections, environments, and requests you'll build in this module.

**Validation:** A workspace whose name starts with "Coffee API -" exists and was created by the current user.

## Part 2: Build Your First Collection

Collections group related API requests together. You'll create one and add a request that fetches coffee data from a public sample API.

### Step 1: Create a Collection

1. Inside your **Coffee API** workspace, click **New** → **Collection**.
2. Name the collection: **Coffee Service**.
3. Optionally add a description like "Requests for the Sample APIs coffee endpoint."

**Validation:** A collection named "Coffee Service" exists inside the Coffee API workspace.

### Step 2: Add a GET Request

1. Click **Add a request** inside the **Coffee Service** collection.
2. Name the request: **List All Coffees**.
3. Set the method to **GET** and enter the URL:
   `https://api.sampleapis.com/coffee/hot`
4. Click **Send** and verify you get a `200 OK` response containing an array of coffee objects.

Each object in the response has `title`, `description`, `ingredients`, and `image` fields.

**Validation:** A GET request named "List All Coffees" exists in the Coffee Service collection with the URL `https://api.sampleapis.com/coffee/hot`.

## Part 3: Write Your First Test

Postman lets you write test scripts that run automatically after every request. You'll add a simple test to make sure the coffee API is returning the data you expect.

### Step 1: Add a Test to Your Request

1. Open the **List All Coffees** request in the **Coffee Service** collection.
2. Click the **Scripts** tab, then select **Post-response**.
3. Add the following test script:

       pm.test("Status code is 200", function () {
           pm.response.to.have.status(200);
       });

       pm.test("Response is a non-empty array", function () {
           const json = pm.response.json();
           pm.expect(json).to.be.an("array").that.is.not.empty;
       });

       pm.test("Each coffee has a title", function () {
           const json = pm.response.json();
           json.forEach(function (coffee) {
               pm.expect(coffee).to.have.property("title");
           });
       });

4. Click **Send** again and check the **Test Results** tab at the bottom — all three tests should pass with a green check.

**Validation:** The "List All Coffees" request has a post-response script containing at least one `pm.test` call, and sending the request returns a 200 status.
```

## Tips

- Keep steps small and focused — one action per step
- Include screenshots or links to Postman docs where helpful
- Test the validation logic yourself before publishing
- Each step awards 10 points — design your module so completing it feels rewarding
