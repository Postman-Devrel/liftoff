# Making Multi-Repo changes with the AI engineer

Most coding agents can add a feature in a single repo — but they routinely break things because they don't understand how that code connects to everything else across an organization. The **Postman AI Engineer** is different because it's grounded in the **Context Graph**: a live, cross-repo model of your APIs, services, collections, and the calls that link them. Instead of guessing from files inside a single working directory, it reads the actual relationships between services — who produces what schema, who consumes it, which endpoints back which flows — so a change in one repo surfaces every service it ripples into. In this module, you'll use the AI Engineer to do what senior engineers do *before* they touch the code: walk the Context Graph across an entire fleet of services, find every downstream consumer, and ship a coordinated change.

You'll add localisation support to an ERP platform composed of 10 microservices, and let the AI Engineer open coordinated PRs across every affected repo — all with a single prompt.

## Part 1: Set Up Your Workspace

Before the AI Engineer can walk the dependency graph, it needs a workspace to work from and access to your GitHub account. In this part you'll create a fresh workspace and wire up the GitHub MCP so Agent Mode can fork repos on your behalf.

### Step 1: Create a New Postman Workspace

1. In Postman, click **Workspaces** in the left sidebar.
2. Click **Create Workspace** and choose the **Blank workspace** template.
3. Name it something memorable (for example, **ERP Fleet - [your name]**), set the visibility, and click **Create**.

**Validation:** [MANUAL] Mark this step complete once your new workspace is open in Postman.

### Step 2: Connect the GitHub MCP

1. Inside your new workspace, open the **MCP** panel (or **Integrations**).
2. Add the **GitHub MCP** server and authenticate with your GitHub account.
3. Confirm the connection shows as active.

**Validation:** [MANUAL] Mark this step complete once the GitHub MCP is connected and authenticated in your workspace.

## Part 2: Fork the ERP Fleet

The ERP platform is split across 10 repos — a top-level service, a gateway, and 8 domain services. Instead of clicking **Fork** 10 times, you'll ask Agent Mode to do it for you through the GitHub MCP.

### Step 1: Ask Agent Mode to Fork All ERP Repos

1. Open **Agent Mode** in Postman.
2. Enter the prompt exactly:
  > Fork and clone the following repos to my Github account:
  >
  > - [https://github.com/buildwithtalia/enterprise-resource-planning](https://github.com/buildwithtalia/enterprise-resource-planning)
  > - [https://github.com/buildwithtalia/erp-gateway](https://github.com/buildwithtalia/erp-gateway)
  > - [https://github.com/buildwithtalia/erp-billing](https://github.com/buildwithtalia/erp-billing)
  > - [https://github.com/buildwithtalia/erp-finance](https://github.com/buildwithtalia/erp-finance)
  > - [https://github.com/buildwithtalia/erp-payroll](https://github.com/buildwithtalia/erp-payroll)
  > - [https://github.com/buildwithtalia/erp-procurement](https://github.com/buildwithtalia/erp-procurement)
  > - [https://github.com/buildwithtalia/erp-accounting](https://github.com/buildwithtalia/erp-accounting)
  > - [https://github.com/buildwithtalia/erp-hr](https://github.com/buildwithtalia/erp-hr)
  > - [https://github.com/buildwithtalia/erp-inventory](https://github.com/buildwithtalia/erp-inventory)
  > - [https://github.com/buildwithtalia/erp-supply-chain](https://github.com/buildwithtalia/erp-supply-chain)
3. Let Agent Mode fork and clone each repo to your account.

**Validation:** **[Api Response — GitHub]** A `GET` to `https://api.github.com/user/repos?type=owner&per_page=100` returns status `200` and the response body contains forks of all 10 ERP repos: `enterprise-resource-planning`, `erp-gateway`, `erp-billing`, `erp-finance`, `erp-payroll`, `erp-procurement`, `erp-accounting`, `erp-hr`, `erp-inventory`, and `erp-supply-chain`.

## Part 3: Add Localisation Support Across the Fleet

This is the moment that separates confident-locality from organizational context. Instead of manually adding localisation code service by service, you'll ask the AI Engineer to walk the Context Graph and open coordinated PRs across every affected repo — with one prompt.

### Step 1: Ask the AI Engineer to Add Localisation Support

1. Open **Agent Tasks** in Postman.
2. In the Agent Tasks text field, enter the prompt exactly:
  > Add localisation support for the ERP app including currencies and languages based on location. Make this fix and then find and update all the downstream dependencies
3. The AI Engineer writes the code, queries the Context Graph across the ERP fleet, identifies every service that needs localisation-aware logic, updates all downstream dependencies, and opens a pull request against each affected repo.

**Validation:** **[Api Response — GitHub]** A `GET` to `https://api.github.com/search/issues?q=is:pr+is:open+user:<your-account>+localisation` returns status `200` and the response body contains at least one open PR opened by the AI Engineer across the forked ERP repos.
