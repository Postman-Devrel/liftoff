# AI-Powered API & MCP Bootcamp

Build and test an end-to-end Intergalactic Banking API using Postman Agent Mode and the Model Context Protocol (MCP). You'll master AI-accelerated API design, automated testing, and MCP-enabled services for LLM tooling.

## Part 1: Import the API Spec into Postman

Set up your workspace and fork the Banking API collection to get started.

### Step 1: Create a New Workspace

In Postman, create a **Blank Workspace** and name it in the following format: **Your Name – Intergalactic Banking**

- Set the visibility to **Internal**
- Set access to **Everyone in the Team**

**Validation:** A workspace matching the pattern "[Name] – Intergalactic Banking" exists and was created by the current user.

### Step 2: Fork the Banking API Collection

Fork the **[Do It Yourself] Intergalactic Bank API** collection from the public bootcamp workspace into your newly created workspace:
[https://www.postman.com/devrel/ai-powered-api-mcp-bootcamp/overview](https://www.postman.com/devrel/ai-powered-api-mcp-bootcamp/overview)

> **Note:** You may need to download the Postman Desktop Agent. Navigate to the bottom right corner of the screen, locate the Desktop Agent icon, and toggle on **Auto Select** and **Desktop Agent**. You may be prompted to download it automatically.

**Validation:** A forked collection named "[Do It Yourself] Intergalactic Bank API" exists in the user's workspace.

## Part 2: Working with Agent Mode

Configure Postman Agent Mode with Claude as your AI copilot, set up environment variables, and add post-request scripts.

### Step 1: Set Up Agent Mode and Create Environment File

Set up Agent Mode by selecting **Claude Sonnet 4.6** as your model and configuring Agent Mode to **Auto Run**.

You can set Agent Mode context in one of two ways:
- Click on the element you want to use as context, such as a collection name or request.
- Use the **@** command and select your desired context.

Use **Agent Mode** to create an Environment file called **Banking.local** — set the collection as context and send this prompt:

> **Agent Mode Prompt:** `Create an Environment Variable file called Banking.local`

Switch to your new environment using the **Environment Selector** dropdown in the top right corner.

**Important:** After setting values, click the **Share** button (or **Persist All**) in the environment editor to sync your values to the cloud. LiftOff validates via the Postman API, which can only see shared/initial values — not local current values.

**Validation:** An environment named "Banking.local" exists in the user's workspace.

### Step 2: Set the Base URL as a Collection Variable

Use **Agent Mode** to replace all hardcoded localhost URLs with a reusable collection variable. Ensure the **Collection** is set as the context before running.

Set the collection as context and send this prompt:

> **Agent Mode Prompt:** `For all the requests in this collection, add https://template.postman-echo.com as an environment variable called baseUrl and update all the URLs in the collection to use {{baseUrl}}.`

Verify that the `baseUrl` variable has been automatically populated in the **Variables** tab.

**Important:** After setting values, click the **Share** button (or **Persist All**) in the environment editor to sync your values to the cloud. LiftOff validates via the Postman API, which can only see shared/initial values — not local current values.

**Validation:** The environment "Banking.local" contains a variable named "baseUrl" with the value "https://template.postman-echo.com".

### Step 3: Generate and Set the API Key

Send the **Generate API Key** GET request, then verify that the environment variable has been set in the **Environment** tab next to the AI Panel on the top right corner.

> **Note:** Go to your Environments on the side panel and set the `apiKey` as **secured**.

**Important:** After setting values, click the **Share** button (or **Persist All**) in the environment editor to sync your values to the cloud. LiftOff validates via the Postman API, which can only see shared/initial values — not local current values. Secured variables are shared through an online vault. On the Postman Free plan, only the local vault is accessible — but that's not an issue for completing this module.

**Validation:** The environment "Banking.local" contains a variable named "apiKey" with a non-empty value.

### Step 4: Add Post-Request Script for fromAccount

Set the **fromAccount** request as context and send this prompt:

> **Agent Mode Prompt:** `Programmatically add a post-response script that parses the response body, reads the id field, and saves its value as an environment variable called fromAccount in the Banking.local environment.`

Send the **fromAccount** request and verify that the variable appears in the **Variables** tab.

**Validation:** The environment "Banking.local" contains a variable named "fromAccount" with a non-empty value.

### Step 5: Add Post-Request Script for toAccount

Set the **toAccount** request as context and send this prompt:

> **Agent Mode Prompt:** `Programmatically add a post-response script that parses the response body, reads the id field, and saves its value as an environment variable called toAccount in the Banking.local environment.`

Verify the variables are populated by sending both requests, then send the **GET List All Accounts** request to view the randomly generated accounts.

**Validation:** The environment "Banking.local" contains a variable named "toAccount" with a non-empty value.

### Step 6: Add Post-Request Script for New Transaction

Set the **Create new transaction** request as context and send this prompt:

> **Agent Mode Prompt:** `Programmatically add a post-response script that parses the response body, reads the id field, and saves its value as an environment variable called transactionId in the Banking.local environment.`

Send the request to see the ID populated. Now, if you send the **GET Transaction by ID** request, you should see a **200 OK** response.

**Validation:** The environment "Banking.local" contains a variable named "transactionId" with a non-empty value.

## Part 3: Testing and Automation

Use Agent Mode to generate automated tests and run them with the Collection Runner.

### Step 1: Generate Tests with Agent Mode

Once your full API request workflow is producing the expected happy-path responses, use **Agent Mode** to generate a test suite for the collection. Set the **Collection** as the context and send the following prompt:

> **Agent Mode Prompt:** `Write tests for all the requests in this collection. Include only status code tests and response time tests.`

**Validation:** At least one request in the collection contains a test script that checks for a status code.

### Step 2: Run the Collection Runner

Walk through the **Collection Runner** interface. Execute all requests in sequence and review the results in the **Test Results** panel.

Set the collection as context and send this prompt:

> **Agent Mode Prompt:** `Run all tests using the Collection Runner.`

**Validation:** [MANUAL] Learner should verify that the Collection Runner executed successfully and all tests passed.

## Part 4: Connect the Postman MCP Server

Generate a Postman API key and connect to the MCP server to query your collections via LLM tooling.

### Step 1: Generate Your Postman API Key

In Postman, click your **cog icon** in the top right, go to **Account Settings**, then navigate to **API keys**. Generate a new key and give it an appropriate name (e.g. **Workshop**). Copy the key and store it somewhere accessible — you will not be able to view it again.

**Validation:** [MANUAL] Learner should verify they have generated and saved a Postman API key.

### Step 2: Create an MCP Request

Return to your **Your Name – Intergalactic Banking** workspace and select **MCP Request**. Set the transport type to **HTTP** and use the following MCP Server URL:

```
https://mcp.postman.com/mcp
```

Set the authentication type to **Bearer Token** and enter the API key you generated. You can find additional guidance in the Learning Center.

**Validation:** [MANUAL] Learner should verify an MCP Request exists in the workspace with the correct URL and authentication configured.

### Step 3: Query Collections via MCP Server

Navigate to the **getCollections** tool and run the request using your **Workspace ID**.

You can find your **Workspace ID** in the **Overview** tab.

**Validation:** [MANUAL] Learner should verify they received a successful response from the MCP server containing their collection data.

## Part 5: Claude Code Integration (Bonus)

Register the Postman MCP Server with Claude Code and use it to interact with your Postman workspaces from the terminal.

### Step 1: Add the MCP Server to Claude Code

Explore the **Postman MCP Server** on GitHub: [https://github.com/postmanlabs/postman-mcp-server](https://github.com/postmanlabs/postman-mcp-server)

Run the following command in your terminal to register the **Postman MCP Server** with **Claude Code**:

```bash
claude mcp add --transport http postman https://mcp.postman.com/mcp --header "Authorization: Bearer <YOUR_API_KEY>"
```

Expected `mcp.json` configuration:

```json
{
  "mcpServers": {
    "postman_mcp_server": {
      "url": "https://mcp.postman.com/mcp",
      "headers": {
        "Authorization": "Bearer PMAK-YOUR-KEY-HERE"
      }
    }
  }
}
```

**Validation:** [MANUAL] Learner should verify the MCP server appears when running `claude mcp list`.

### Step 2: Verify the Connection

Use `claude mcp list` in your terminal or `/mcp` in **Claude** to list your registered MCP servers.

> **Claude Prompt:** `List all my Postman workspaces.`

You should receive a list of your Postman workspaces. If so, everything is configured correctly.

**Validation:** [MANUAL] Learner should verify they can see a list of their Postman workspaces via Claude.

### Step 3: Add Tests via the MCP Server

Use the MCP server to locate your workshop workspace ID and then add tests to the collection.

Get the workspace ID:

> **Claude Prompt:** `Get the workspace ID for "[WORKSHOP-WORKSPACE-NAME]".`

Add tests to the collection:

> **Claude Prompt:**
> ```
> Using the Postman MCP server, add tests to [workshop collection name].
> For each request:
>   1. Add a status code check (200 OK)
>   2. Validate the response has a 'success' property set to true
> ```

Run the tests:

> **Claude Prompt:** `Run the "[workshop collection name]" collection and show me the test results.`

**Validation:** [MANUAL] Learner should verify that tests were added and executed successfully via Claude and the MCP server.
