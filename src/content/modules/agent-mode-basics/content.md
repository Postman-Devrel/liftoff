# Getting Started with Agent Mode

Learn how to use Postman's AI-powered **Agent Mode** to set up a workspace, build a collection, and write tests — all through natural-language prompts. You'll practice against the [Movies API](https://sampleapis.com/api-list/movies), a public CRUD API for browsing and managing movie data.

## Part 1: Meet Agent Mode

### Step 1: Open Agent Mode

**Agent Mode** is an AI assistant built into Postman that completes API development tasks from natural-language prompts — creating workspaces and collections, writing tests, debugging errors, and more. It asks clarifying questions before taking action, and shows you what it's about to do before running it.

1. Open Postman (desktop app or web).
2. You can open Agent Mode two ways:
   - **From the homepage:** type a request into the query box and click **Let's go** — this opens your most recent workspace with Agent Mode loaded.
   - **From any workspace:** open the panel in the bottom-right corner and switch to the **AI** tab.
3. Try typing `@` in the Agent Mode input — this lets you point Agent Mode at a specific collection, folder, request, environment, or API spec as context for your prompt. You'll use this in later steps.

Learn more: [Agent Mode overview](https://learning.postman.com/docs/use/agent-mode/get-started)

**Validation:** [MANUAL] Mark this step done once you've opened Agent Mode and tried the `@` context picker.

### Step 2: Create Your Workspace with a Prompt

Instead of clicking through the **Create Workspace** dialog yourself, describe what you want and let Agent Mode do it.

1. In Agent Mode, write a prompt like:

   > Create a new Internal workspace called "[Your Name] - AI Basics" that only I can access.

2. Replace `[Your Name]` with your actual name (e.g. *Alex - AI Basics*).
3. Review what Agent Mode proposes, then approve it.

**Validation:** Check that a workspace exists whose name matches the pattern `<something> - AI Basics` (case-insensitive) and whose `createdBy` matches the current LiftOff user's Postman user ID.

### Step 3: Build a Collection from the Movies API

Now that you have a workspace, let Agent Mode do the tedious part — describing an entire API in plain English and letting it scaffold every request for you, instead of building each one by hand.

The [Movies API](https://sampleapis.com/api-list/movies) is a free, publicly hosted REST API with no authentication:

| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/movies/animation` | List all animated movies |
| GET | `/movies/animation/:id` | Get one movie |
| POST | `/movies/animation` | Create a movie |
| PUT | `/movies/animation/:id` | Update a movie |
| DELETE | `/movies/animation/:id` | Delete a movie |

A movie has an `id` (number, required), `title` (string, required), `posterURL` (string, required), and `imdbId` (string, required).

1. Make sure you're in your **[Your Name] - AI Basics** workspace from Step 2.
2. In Agent Mode, write a prompt like:

   > Create a collection called "Movies API" in this workspace. Add a request for each of these endpoints: GET /movies/animation, GET /movies/animation/:id, POST /movies/animation, PUT /movies/animation/:id, DELETE /movies/animation/:id. Use https://api.sampleapis.com as the base URL. For POST and PUT, include an example JSON body with id, title, posterURL, and imdbId.

3. Review the requests Agent Mode creates, then approve it.

**Validation:** In the workspace from Step 2, check that a collection exists whose name contains "movie" (case-insensitive) and that it contains at least one request.

## Part 2: Test and Explore with Agent Mode

### Step 1: Add Status-Code Tests with a Prompt

Hand-writing the same assertion for every request is exactly the kind of repetitive work Agent Mode is built to take off your plate — describe the check once and let it apply the pattern across your whole collection.

1. Open your **Movies API** collection from Part 1.
2. In Agent Mode, write a prompt like:

   > Add a post-response test to every request in my Movies API collection that checks the response status code is 200.

3. Review the test scripts Agent Mode proposes, then approve it.

**Validation:** In the "Movies API" collection, check that at least one request has a non-empty post-response ("test") script attached.

### Step 2: Run the "Auto-Generate Documentation for Endpoints" Template

Postman's [Agent Mode template gallery](https://www.postman.com/templates/agent-mode/) has ready-made prompts curated by role — including ones for API Product Owners who need clean documentation without writing it by hand.

1. Make sure you're in your **[Your Name] - AI Basics** workspace, with your **Movies API** collection open.
2. Open the [Agent Mode template gallery](https://www.postman.com/templates/agent-mode/).
3. Click **View all API Product Owner prompts**.
4. Under **Documentation**, find the template titled **"Auto-generate documentation for endpoints"** — its prompt reads:

   > Generate documentation for each endpoint, including purpose, parameters, and example responses.

5. Click **Run in Agent Mode**, and when prompted, point it at your **Movies API** collection.
6. Review the documentation Agent Mode generates — it writes the description directly onto each request, in the **Docs** tab.

**Validation:** Check that at least one request in the "Movies API" collection has a non-empty description written to it.
