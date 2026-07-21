**PRIVATE**
# Claude Code Plugin for Postman

Install the official [Postman plugin for Claude Code](https://github.com/Postman-Devrel/postman-claude-code-plugin), then use its natural-language commands to search your workspace, query the Movies API, and run your collection's tests — no manual MCP configuration required.

## Part 1: Install the Plugin

### Step 1: Install and Configure the Plugin

The plugin bundles its own MCP configuration, so it sets up the [Postman MCP Server](https://github.com/postmanlabs/postman-mcp-server) for you automatically.

1. Clone the plugin repo:

   ```bash
   git clone https://github.com/Postman-Devrel/postman-claude-code-plugin.git
   ```

2. Start Claude Code with the plugin loaded, from your API project directory:

   ```bash
   cd your-api-project/
   claude --plugin-dir /path/to/postman-claude-code-plugin
   ```

Requires Claude Code v1.0.33+. No Python, Node, or other runtime dependencies needed for the plugin itself.

**Validation:** [MANUAL] Mark this step done once Claude Code is running with the plugin loaded.

### Step 2: Run Setup

Setup is what authenticates the plugin with your Postman account and confirms the connection is live before you start issuing natural-language commands.

1. In Claude Code, run:

   ```
   /postman:setup
   ```

2. Authenticate when prompted:
   - **OAuth (recommended)** — opens a browser sign-in, no key copying required.
   - **API key** — set `export POSTMAN_API_KEY=PMAK-your-key-here` (add it to `~/.zshrc` or `~/.bashrc` to persist it). Get one at [go.postman.co/settings/me/api-keys](https://go.postman.co/settings/me/api-keys).

3. The plugin verifies your connection and lists your workspaces — confirm your **[Your Name] - AI Basics** workspace from *Getting Started with Agent Mode* appears in the list.

**Validation:** [MANUAL] Mark this step done once `/postman:setup` completed and listed your workspaces.

## Part 2: Talk to Your API Through Claude Code

### Step 1: Search Your Workspace for Movie APIs

The plugin routes natural language to the right command automatically — you don't need to remember command names.

1. Ask Claude Code:

   > Is there any API in my workspace that gives me information on movies

2. This runs [`/postman:search`](https://github.com/Postman-Devrel/postman-claude-code-plugin) under the hood, searching across your workspaces and drilling into endpoint details. Confirm it surfaces your **Movies API** collection from Module 1.

**Validation:** [MANUAL] Mark this step done once Claude Code found your Movies API collection through a search prompt.

### Step 2: Query the Movies API in Natural Language

Beyond searching for APIs, the plugin can actually call them on your behalf — ask a question in plain English and it translates that into the right request.

1. Ask Claude Code:

   > Give me a list of animated movies available

2. Confirm Claude Code calls the `GET /movies/animation` endpoint on the [Movies API](https://sampleapis.com/api-list/movies) and returns the movie list.

**Validation:** [MANUAL] Mark this step done once Claude Code returned a list of movies from the live API.

### Step 3: Run Your Collection Tests

This is the payoff of the tests you wrote back in *Getting Started with Agent Mode* — instead of opening Postman to run them, you can trigger the whole suite from your terminal.

1. Ask Claude Code:

   > Run the tests for my collection [Movies API from Module 1]

2. This runs [`/postman:test`](https://github.com/Postman-Devrel/postman-claude-code-plugin), executing your **Movies API** collection, parsing the results, and diagnosing any failures.
3. Review the pass/fail summary — if any of the status-code tests you wrote in *Getting Started with Agent Mode* fail, ask Claude Code to suggest a fix.

**Validation:** [MANUAL] Mark this step done once you've run your collection's tests through Claude Code and reviewed the results.
