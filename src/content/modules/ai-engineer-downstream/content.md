**PRIVATE**
# Managing Downstream Dependencies with the AI Engineer

Most coding agents can rename a field in seconds — but they routinely break things because they don't understand how that code connects to everything else. In this module, you'll use the **Postman AI Engineer** to do what senior engineers do *before* they touch the code: walk the dependency graph, find every downstream consumer, and ship a safe change.

You'll rename a field in the **Create Employee** response schema, ask the AI Engineer to surface every downstream consumer of that field, and merge the PR it opens — without paging the iOS team at 2 a.m.

## Part 1: Set Up Your Workspace

### Step 1: Fork and Clone the ERP Repo

Everything in this module happens inside your own copy of the ERP project, so you can safely rename fields and merge PRs without touching the shared original. Forking gets you a repo of your own; cloning it locally is what lets Postman link a workspace to it.

1. Fork the Enterprise Resource Planning repo: [https://github.com/buildwithtalia/enterprise-resource-planning](https://github.com/buildwithtalia/enterprise-resource-planning).
2. Clone your fork to your machine:
   ```
   git clone https://github.com/<your-username>/enterprise-resource-planning.git
   ```
3. Change into the cloned directory:
   ```
   cd enterprise-resource-planning
   ```

**Validation:** [MANUAL] Mark this step complete after you have forked the repo on GitHub and cloned it locally.

### Step 2: Create a Workspace and Push to the Cloud

With a local clone in hand, link a Postman workspace to it so the AI Engineer can read the repo's context — then push it up so your collections and specs are synced to Postman's servers.

1. In Postman, click **Workspaces** in the header, then click **Create Workspace**.
2. Name it exactly: **Enterprise Resource Planning - [your name]** (for example, *Enterprise Resource Planning - Alex*).
3. Set the workspace type to **Internal** — linking a Git repository is only supported for Internal workspaces.
4. Choose **From a Git repository** instead of **Blank workspace**, then point it at the local ERP repo you just cloned.
5. Set who can access the workspace, then click **Create Workspace**. Postman imports the ERP API spec and the **Enterprise Resource Planning API** collection, including the **Create Employee** request.
6. Once the workspace is created, push it to the cloud so your collections and specs sync to Postman.

For more detail on any of these steps, see [Create workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/create-workspaces).

**Validation:**

- **[Workspace]** A workspace whose name starts with "Enterprise Resource Planning -" exists and was created by the current user.
- **[Collection]** The **Enterprise Resource Planning API** collection exists in that workspace and contains a **Create Employee** request.

## Part 2: Update the Create Employee Response Schema

You're about to rename `id` to `employee-id` on the **Create Employee** response. In a normal repo, this is a one-line change. In Postman, the spec is the source of truth — updating it here is what the AI Engineer will diff against to find consumers.

### Step 1: Ask Agent Mode to Rename the Field

This is the change that kicks off the whole exercise — a seemingly small rename that the AI Engineer will later need to trace through every downstream consumer.

1. Open **Agent Mode** in Postman.
2. Enter the prompt exactly:
  > Update Create Employee response schema to include "employee-id" instead of "id"
3. Let the agent apply the change to the ERP spec, and review the diff it shows you — confirm the **Create Employee** response schema now defines `employee-id` instead of `id`.

**Validation:** [MANUAL] Mark this step complete after you've confirmed the diff renames `id` to `employee-id` on the Create Employee response schema.

### Step 2: Merge Changes to Main

The AI Engineer diffs against what's on `main`, so the schema change needs to actually land there before it can find anything to fix downstream.

1. Review the diff Agent Mode produced against the ERP spec.
2. Merge the schema change to `main` in your fork.

**Validation:** [MANUAL] Mark this step complete after you have merged the schema change to `main`.

### Step 3: Git Pull

Your local working copy is still on the old schema until you pull — do this now so the next step reflects the merged change.

1. Pull the latest `main` locally so your working copy reflects the merged schema change.

**Validation:** [MANUAL] Mark this step complete after your local `main` is up to date with the merged schema change.

## Part 3: Update Downstream Dependencies

This is the moment that separates confident-locality from organizational context. Instead of grepping your repos, you'll ask the AI Engineer to walk the dependency graph and update every downstream consumer of the field you just renamed.

### Step 1: Ask Agent Tasks to Update Downstream Dependencies

This is the step that would normally mean grepping every repo in your org by hand — instead, you'll ask the AI Engineer to do that walk for you and hand back a ready-to-review PR.

1. Open **Agent Tasks** in Postman.
2. Ask the agent to update all downstream dependencies from the response schema update you just merged.
3. The AI Engineer walks the Context Graph, identifies every consumer of the old `id` field, and opens a pull request with the updates wired in.

**Validation:** **[Api Response — GitHub]** A `GET` to `https://api.github.com/repos/<your-fork>/pulls?state=open` returns status `200` and the response body contains at least one PR opened by the AI Engineer that touches the downstream consumers of `employee-id`.

## Part 4: Merge the PR

The AI Engineer doesn't just identify consumers — it opens a PR with the consumer-test updates ready to go. Your last job is to review and merge it, then pull the changes locally.

### Step 1: Merge the PR

The AI Engineer's PR is a proposal, not an automatic change — you're still the one who reviews and approves what ships to consumers.

1. Open the PR the AI Engineer created against your ERP fork.
2. Review the diff to confirm the downstream updates look correct.
3. Merge the PR into `main`.

**Validation:** **[Api Response — GitHub]** A `GET` to `https://api.github.com/repos/<your-fork>/pulls?state=closed` returns status `200`, and the response body contains at least one PR with `"merged": true` whose diff renames `id` to `employee-id` in the downstream consumers.

### Step 2: Git Pull in the Postman Terminal

One last sync so your local collection matches what's now on `main`, including the downstream fixes the AI Engineer just merged.

1. Open the terminal in Postman.
2. Run `git pull` to bring the merged downstream updates into your local working copy.

**Validation:** **[Collection Request]** After the pull, the downstream consumer requests in the **Enterprise Resource Planning API** collection reference `employee-id` (not `id`) in their URLs, request bodies, or test scripts.