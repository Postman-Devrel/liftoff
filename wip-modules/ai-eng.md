# Managing Downstream Dependencies with the AI Engineer

Most coding agents can rename a field in seconds — but they routinely break things because they don't understand how that code connects to everything else. In this module, you'll use the **Postman AI Engineer** to do what senior engineers do *before* they touch the code: walk the dependency graph, find every downstream consumer, and ship a safe change.

You'll rename a field in a response schema, ask the AI Engineer to surface every Postman Collection that consumes it, and merge the PR it opens — without paging the iOS team at 2 a.m.

1. Setup/Prerequisites
  1. /postman sign in
  2. github app setup in slack
  3. need slack
2. Fork + Create workspace with ERP repo
  1. Validate this repo exists with this name + collections
3. Update x response schema to be xyz
4. Merge changes to main
  1. validate response schema
5. Go to slack and ask @Postman to update downstream dependencies - manual validation
6. AI Eng Opens PR
7. Merge PR
  1. validate - checks the response schema

## Part 1: Set Up Your Workspace

### Step 1: Set up Slack

1. Open Slack and enter the command `/postman sign in`
2. This will prompt you to sign in to Postman.
3. Add the Github integration to your slack channel. Click Tools > Apps. Search for Github.

**Validation:** 

### Step 2: Create a Workspace

1. Open Postman and click **Workspaces** in the top nav, then **Create Workspace**.
2. Choose **Blank workspace**.
3. Name it exactly: **Downstream Demo - [your name]** (for example, *Downstream Demo - Alex*).
4. Set visibility to **Personal** and click **Create**.

This workspace will hold the Users API spec you're about to change and the consumer collections the AI Engineer will discover.

**Validation:** A workspace whose name starts with "Downstream Demo -" exists and was created by the current user.

### Step 2: Configure Your Environment

The AI Engineer needs a base URL to call the Users API and a GitHub token to open and merge the PR.

1. Inside your **Downstream Demo** workspace, click **Environments** in the left sidebar, then **+** to create a new environment.
2. Name it: **Downstream Demo Env**.
3. Add the following variables:

  | Variable      | Initial Value                   | Type       |
  | ------------- | ------------------------------- | ---------- |
  | `baseUrl`     | `https://demo.postman-echo.com` | default    |
  | `githubRepo`  | `postman-demo/users-api`        | default    |
  | `githubToken` | *your GitHub PAT*               | **secret** |

4. Click **Save**, then activate the environment by selecting it from the environment dropdown in the top right.

> If you get a 401 from GitHub later, double-check that `githubToken` is marked as **secret** and has `repo` scope.

**Validation:** An environment named "Downstream Demo Env" exists in the workspace with `baseUrl = https://demo.postman-echo.com`, `githubRepo = postman-demo/users-api`, and a non-empty `githubToken` value.

## Part 2: Update the Response Schema

You're about to rename `user_id` to `userId` on the `/users/:id` endpoint. In a normal repo, this is a one-line change. In Postman, the spec is the source of truth — updating it here is what the AI Engineer will diff against to find consumers.

### Step 1: Rename the Field in the Users API Spec

1. In your workspace, click **APIs** in the left sidebar, then **+** to add a new API.
2. Name it: **Users API**.
3. Paste the following OpenAPI 3.0 spec into the editor:
  ```yaml
   openapi: 3.0.3
   info:
     title: Users API
     version: 1.1.0
   paths:
     /users/{id}:
       get:
         summary: Get a user by ID
         parameters:
           - in: path
             name: id
             required: true
             schema: { type: string }
         responses:
           '200':
             description: A user
             content:
               application/json:
                 schema:
                   type: object
                   properties:
                     userId: { type: string }
                     name:   { type: string }
                     email:  { type: string }
  ```
4. Click **Save**. Notice that `userId` replaces what used to be `user_id` — this is the breaking change.
5. Publish the spec by clicking **Deploy** → **Deploy to a server**, and verify the response from `GET {{baseUrl}}/users/u_42` returns a body containing the `userId` field (and not `user_id`).

Expect a `200 OK` with a JSON body where `userId` is present at the top level.

**Validation:** [Api Response] A `GET` request to `{{baseUrl}}/users/u_42` returns status `200` and the response body contains a top-level `userId` field. The legacy `user_id` field must be absent.

## Part 3: Discover Downstream Dependencies with the AI Engineer

This is the moment that separates confident-locality from organizational context. Instead of grepping your repo, you'll ask the AI Engineer to walk the Context Graph and surface every Postman Collection in your workspace that consumes the field you just renamed.

### Step 1: Ask the AI Engineer for the Blast Radius

1. From Slack, enter the prompt:
  > @Postman --repo [repo-name] Update the downstream dependencies from the last PR I merged
2. In the thread that the agent creates, open the PR.
3. Confirm you see the downstream consumers of your API update.
4. Merge the PR

**Validation:** [Collection Requests] A collection named "Downstream Consumers" exists in the workspace and contains requests named `Mobile App Tests`, `Web Dashboard QA`, and `Partner Integration Suite`.

## Part 4: Merge the PR the AI Engineer Created

The AI Engineer doesn't just identify consumers — it opens a PR against the Users API repo with the schema change and the consumer-test updates wired in. Your last job is to review and merge it.

### Step 1: Merge the AI Engineer's PR

1. Back in **Agent Mode**, send this follow-up prompt:
  > Open a pull request against `{{githubRepo}}` titled `rename user_id to userId` that applies the schema change from the Users API spec. Use `{{githubToken}}` for auth. After the PR passes CI, merge it with a squash commit and report back the PR number.
2. The AI Engineer will respond with a PR number — note it (for example, `#128`).
3. In the AI Engineer panel, click **View PR** to inspect the diff in GitHub. Confirm the schema rename and the updated consumer fixtures look correct.
4. Once CI is green, send one more prompt:
  > Merge PR # on `{{githubRepo}}` using squash. Confirm `merged: true` from the GitHub API.
5. Expect a confirmation message in Agent Mode like `PR #128 merged ✓`.

> If the merge fails with `405 Method Not Allowed`, CI hasn't finished yet — wait 60 seconds and re-run the merge prompt.

**Validation:** [Api Response] A `GET` request to `https://api.github.com/repos/{{githubRepo}}/pulls?state=closed&head=ai-engineer:rename-user-id` returns status `200`, and the response body contains at least one PR with `"merged": true` and a title matching `rename user_id to userId`.