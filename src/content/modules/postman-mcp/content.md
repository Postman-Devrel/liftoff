**PRIVATE**
# Connect to Postman with MCP

Connect your coding assistant to Postman using the **Postman MCP Server**, then read and run requests from the workspace and collection you built in *Getting Started with Agent Mode* — directly from your editor. These instructions use a code-editor MCP config as the example, but the same server works with almost any MCP-compatible IDE or agent (Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI, and more).

## Part 1: Connect the Postman MCP Server

### Step 1: Get a Postman API Key

Your coding assistant needs its own credential to talk to Postman on your behalf — this API key is what the MCP server uses to authenticate as you.

1. Go to [go.postman.co/settings/me/api-keys](https://go.postman.co/settings/me/api-keys).
2. Generate a new API key and copy it somewhere safe — you won't be able to see it again.

**Validation:** [MANUAL] Mark this step done once you've generated your Postman API key.

### Step 2: Add the Postman MCP Server to Your Editor

The [Postman MCP Server](https://github.com/postmanlabs/postman-mcp-server) implements the Model Context Protocol so any compatible agent or IDE can read and act on your Postman workspaces, collections, specs, and environments.

**Remote server (recommended)** — add this to your editor's MCP configuration, using your API key from Step 1:

```json
{
  "mcpServers": {
    "postman": {
      "url": "https://mcp.postman.com/minimal",
      "headers": {
        "Authorization": "Bearer YOUR_POSTMAN_API_KEY"
      }
    }
  }
}
```

**Local server** — an alternative if you'd rather run it locally, or if you ever need MCP to reach an API running on your own machine:

```bash
export POSTMAN_API_KEY=YOUR_POSTMAN_API_KEY
npx @postman/postman-mcp-server
```

Change `/minimal` to `/code` or `/mcp` (or add `--code` / `--full` locally) for more tools. `minimal` is enough for this module.

Every major agent and IDE has its own config file location — see the [IDE-specific setup docs](https://learning.postman.com/docs/reference/postman-api/postman-mcp-server/overview) for Claude Code, Cursor, VS Code, Windsurf, Gemini CLI, and others.

**Validation:** [MANUAL] Mark this step done once your editor shows the Postman MCP tools as connected.

### Step 3: Connect to Your Module 1 Workspace

With the MCP server connected, your assistant can now see your Postman account directly. Confirm it actually works by pointing it at the workspace you built in the previous module.

1. In your editor, ask your assistant something like:

   > Using the Postman MCP tools, find my "[Your Name] - AI Basics" workspace and tell me what collections are in it.

2. Confirm it finds the workspace and collection you created in *Getting Started with Agent Mode*.

**Validation:** [MANUAL] Mark this step done once your assistant successfully found your "[Your Name] - AI Basics" workspace via MCP.

## Part 2: Read and Run Requests via MCP

### Step 1: Read the Movies API Collection

Before asking your assistant to act on anything, confirm it can actually see your collection's contents through MCP — this read-only check is what everyday API context-awareness looks like in practice.

1. Ask your assistant:

   > Using the Postman MCP tools, list every request in my Movies API collection along with their methods and URLs.

2. Confirm the response matches the requests you built in Module 1: list, get one, create, update, and delete for animated movies.

**Validation:** [MANUAL] Mark this step done once your assistant listed the requests in your Movies API collection via MCP.

### Step 2: Execute a Movies Endpoint via MCP

The [Movies API](https://sampleapis.com/api-list/movies) is publicly hosted, so either the remote or local MCP server can reach it — no need to run anything locally.

1. Ask your assistant:

   > Using the Postman MCP tools, run the GET request for the animated movies list in my Movies API collection and show me the response.

2. Confirm you get back a `200` response with a list of movies.

**Validation:** [MANUAL] Mark this step done once you've executed the animated movies GET request through MCP and seen a successful response.
