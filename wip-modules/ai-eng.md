# Managing Downstream Dependencies with the AI Engineer

Most coding agents can rename a field in seconds — but they routinely break things because they don't understand how that code connects to everything else. In this module, you'll use the **Postman AI Engineer** to do what senior engineers do *before* they touch the code: walk the dependency graph, find every downstream consumer, and ship a safe change.

You'll rename a field in the **Create Employee** response schema, ask the AI Engineer to surface every downstream consumer of that field, and merge the PR it opens — without paging the iOS team at 2 a.m.

## Part 1: Set Up Your Workspace

### Step 1: Fork the ERP Repo and Create a Workspace

1. Fork the Enterprise Resource Planning repo: [https://github.com/buildwithtalia/enterprise-resource-planning](https://github.com/buildwithtalia/enterprise-resource-planning).
2. Open Postman and create a new workspace from the forked repo. Name it exactly: **Enterprise Resource Planning - [your name]** (for example, *Enterprise Resource Planning - Alex*). The workspace will import the ERP API spec and the **Enterprise Resource Planning** collection, including the **Create Employee** request.

**Validation:**

- **[Workspace]** A workspace whose name starts with "Enterprise Resource Planning -" exists and was created by the current user.
- **[Collection]** The **Enterprise Resource Planning** collection exists in that workspace and contains a **Create Employee** request.

## Part 2: Update the Create Employee Response Schema

You're about to rename `id` to `employee-id` on the **Create Employee** response. In a normal repo, this is a one-line change. In Postman, the spec is the source of truth — updating it here is what the AI Engineer will diff against to find consumers.

### Step 1: Ask Agent Mode to Rename the Field

1. Open **Agent Mode** in Postman.
2. Enter the prompt exactly:
  > Update Create Employee response schema to include "employee-id" instead of "id"
3. Let the agent apply the change to the ERP spec.

**Validation:** **[Collection Request]** The **Create Employee** request in the **Enterprise Resource Planning** collection has a saved response (or response example) whose body contains a top-level `employee-id` field. The legacy `id` field must be absent.

### Step 2: Merge Changes to Main

1. Review the diff Agent Mode produced against the ERP spec.
2. Merge the schema change to `main` in your fork.

### Step 3: Git Pull

1. Pull the latest `main` locally so your working copy reflects the merged schema change.

### Step 4: Run the Create Employee Request

1. Back in Postman, open the **Create Employee** request in the **Enterprise Resource Planning** collection.
2. Send the request.

**Validation:** **[Api Response]** A `POST` to the Create Employee endpoint returns status `200` (or `201`) and the response body contains a top-level `employee-id` field. The legacy `id` field must be absent.

## Part 3: Update Downstream Dependencies

This is the moment that separates confident-locality from organizational context. Instead of grepping your repos, you'll ask the AI Engineer to walk the dependency graph and update every downstream consumer of the field you just renamed.

### Step 1: Ask Agent Tasks to Update Downstream Dependencies

1. Open **Agent Tasks** in Postman.
2. Ask the agent to update all downstream dependencies from the response schema update you just merged.
3. The AI Engineer walks the Context Graph, identifies every consumer of the old `id` field, and opens a pull request with the updates wired in.

**Validation:** **[Api Response — GitHub]** A `GET` to `https://api.github.com/repos/<your-fork>/pulls?state=open` returns status `200` and the response body contains at least one PR opened by the AI Engineer that touches the downstream consumers of `employee-id`.

## Part 4: Merge the PR

The AI Engineer doesn't just identify consumers — it opens a PR with the consumer-test updates ready to go. Your last job is to review and merge it, then pull the changes locally.

### Step 1: Merge the PR

1. Open the PR the AI Engineer created against your ERP fork.
2. Review the diff to confirm the downstream updates look correct.
3. Merge the PR into `main`.

**Validation:** **[Api Response — GitHub]** A `GET` to `https://api.github.com/repos/<your-fork>/pulls?state=closed` returns status `200`, and the response body contains at least one PR with `"merged": true` whose diff renames `id` to `employee-id` in the downstream consumers.

### Step 2: Git Pull in the Postman Terminal

1. Open the terminal in Postman.
2. Run `git pull` to bring the merged downstream updates into your local working copy.

**Validation:** **[Collection Request]** After the pull, the downstream consumer requests in the **Enterprise Resource Planning** collection reference `employee-id` (not `id`) in their URLs, request bodies, or test scripts.