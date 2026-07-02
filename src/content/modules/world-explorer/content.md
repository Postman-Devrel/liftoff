** PRIVATE **
# World Explorer

Set up Postman, send your first API request, and look up real country data — all inside the Postman app. You'll work with the LiftOff Countries API:

```
https://liftoff-101.mock.postman.postman.dev/countries
```

Each country comes back with its capital, currency, population, dialing code, and even flag artwork. The API takes a `name` query parameter so you can filter down to a single destination.

### Open LiftOff in Postman

**Already using Postman?** Open the desktop app — you should already be signed in. **New here?** [Download Postman](https://www.postman.com/downloads/) and sign in first.

1. In the **Postman desktop app**, open the Browser Tool: **Tools → Browser** in the footer, or press `Cmd+Shift+B` (Mac) / `Ctrl+Shift+B` (Windows/Linux).
2. Navigate to [liftoff.postman.com/modules/world-explorer](https://liftoff.postman.com/modules/world-explorer).
3. Sign in with Discord and connect your Postman API key when you're ready to validate.

[Learn more about the Browser Tool →](https://learning.postman.com/docs/use/capturing-request-data/browser-tool/inspect-traffic)

---

## Part 1: Plot Your Route

> **New to Postman?** You'll create three building blocks in this part: a **workspace** (your project folder), a **collection** (a group of related requests), and a **request** (a single API call). Each step below walks you through where to click.

Learn more: [Workspaces](https://learning.postman.com/docs/collaborating-in-postman/using-workspaces/overview/), [Send an API request](https://learning.postman.com/docs/getting-started/quick-start/#send-an-api-request)

### Step 1: Create a Workspace

> A **workspace** is your home base in Postman — collections, requests, and variables all belong to one.

1. Open the **Postman desktop app**. If you don't have it yet, [download Postman](https://www.postman.com/downloads/) and sign in — if you're already signed in, you're good to go.
2. Click **Workspaces** in the top navigation → **Create**.
3. In **Workspace name**, enter **[Your name] - World Explorer** (e.g. *Alex - World Explorer*).
4. Under **Select workspace type**, choose **Internal**.
5. Under **Who can access**, choose **Only you and invited people**.
6. Select **Blank workspace**.
7. Click **Create Workspace**.

**Validation:** An internal workspace named "[Your name] - World Explorer" exists and was created by the current user.

### Step 2: Create a Collection

> A **collection** groups related requests together — like a folder for your country lookups.

1. Confirm you're in your new workspace (check the name in the top-left).
2. In the left sidebar, click **Collections** → **+** (or **Create Collection**).
3. Name it **Country Dossier** and save.

**Validation:** Collection named "Country Dossier" exists in the workspace and was created by the current user.

### Step 3: Add Your First Lookup

> A **request** is a single call to an API. **GET** means you're asking the server for data; the URL tells it *what* to return. This is your first API call — don't worry about the JSON yet, just look for a green **200 OK**.

1. In the left sidebar under **Country Dossier**, click **Add request**.
2. Name the request **Get Country**.
3. Leave the method as **GET** and paste this URL into the address bar:

```
https://liftoff-101.mock.postman.postman.dev/countries
```

4. Click **Save** (Ctrl/Cmd+S) — choose **Country Dossier** as the destination if prompted.
5. Click **Send**. You should get **200 OK** — that means it worked. The JSON below is the response; you'll use it in later steps.

**Validation:** Collection "Country Dossier" contains a GET request named "Get Country" whose URL includes `/countries`.

### Step 4: Pick a Destination

> **Query params** filter what the API returns — like adding `?name=Bangladesh` to narrow the list down to one country.

1. Open **Get Country** from your collection.
2. Click the **Params** tab (directly below the URL bar).
3. In the **Query Params** table, add a row:

| Key    | Value                       |
| ------ | --------------------------- |
| `name` | *your home country*, e.g. `Bangladesh` |

4. Make sure the checkbox next to `name` is checked — that enables the parameter.
5. Your URL should now end with `?name=Bangladesh` (or wherever you're headed). Click **Send** again — the response should show only your country, not the full list.

**Validation:** The "Get Country" request has a query parameter with the key `name` and a non-empty value.

---

## Part 2: Travel Smarter

You've sent a request. Now you'll make it reusable with variables, let Agent Mode add tests for you, and see your data come to life. Each step builds on the last — finish one before moving on.

Learn more: [Variables](https://learning.postman.com/docs/sending-requests/variables/variables/), [Agent Mode](https://learning.postman.com/docs/use/agent-mode/overview), [Postman Visualizer](https://learning.postman.com/docs/use/send-requests/response-data/visualizer)

### Step 5: Store Your Destination in a Variable

> Right now your country is hard-coded in the request. A **variable** lets you change the destination without editing the request each time. This lesson uses **collection variables** (scoped to the collection) rather than an environment — a different approach than in *API Basics*.

1. In the left sidebar, click **Country Dossier** (the collection name itself, not a request inside it) — it opens in a tab.
2. In that tab, select **Variables**.
3. Add a variable named `country`. If you don't see a **Shared Value** column, click the **⋯** menu at the far right of the variables table header, then under **Show as column**, check **Shared Value**.
4. In the **Shared Value** column, enter your country (e.g. `Bangladesh`).
5. Back in **Get Country**, open the **Params** tab. In the **Query Params** table, leave **Key** as `name` and change **Value** from your country (e.g. `Bangladesh`) to `{{country}}`.
6. Save the request (Ctrl/Cmd+S).

**LiftOff tip:** Enter your country in **Shared Value**, not the local **Value** column — LiftOff validates via the Postman API, which only sees shared values.

**Validation:** Collection "Country Dossier" has a variable `country` with a non-empty shared value, and the "Get Country" request URL uses `{{country}}` in the `name` parameter.

### Step 6: Let Agent Mode Be Your Guide

> **Tests** automatically check the response when you hit Send. **Agent Mode** can write them for you — you review and accept.

1. Open **Agent Mode** from the command palette: click the **universal search bar** at the top, type `>` to switch to commands, then type **Open Agent Mode** and select it.
2. Give it a prompt like:

   > *In my "Get Country" request, add a post-response test that checks the status is 200 and that the first result's `name` matches my `country` collection variable.*

3. Review what Agent Mode proposes. You should end up with a post-response script similar to:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Found my country", function () {
    const data = pm.response.json();
    pm.expect(data[0].name).to.eql(pm.collectionVariables.get("country"));
});
```

4. Accept the change and **save** the request.

> No Agent Mode available? Open **Get Country**, go to the **Scripts** tab → **Post-response**, and paste the script above yourself.

**Validation:** The "Get Country" request has a post-response script containing `pm.test`.

### Step 7: Stamp Your Passport

> **Post-response scripts** run automatically after you hit Send. This one reads the response and saves the capital and currency for later. You don't need to understand every line — paste it at the bottom of your existing script.

Open **Get Country → Scripts → Post-response** and add this to the **bottom** of your existing script:

```javascript
const country = pm.response.json()[0];

pm.collectionVariables.set("capital", country.capital);
pm.collectionVariables.set("currency", country.currency);

console.log(`Welcome to ${country.capital}! Don't forget some ${country.currency}.`);
```

Save the request.

**Validation:** The "Get Country" request has a post-response script that calls `pm.collectionVariables.set`.

### Step 8: Turn Your Stamp Into a Visualization

> Postman can render a custom view of your response in the **Visualization** tab. **Agent Mode** will build a simple card — you don't need to write or understand the script yourself. See [Postman Visualizer](https://learning.postman.com/docs/use/send-requests/response-data/visualizer) if you want to dig deeper.

1. Open **Agent Mode** again (same as Step 6).
2. Give it a prompt like:

   > *In my "Get Country" request, add a post-response visualization using `pm.visualizer.set`. Render a passport-stamp style card for the first result showing the flag image (`media.flag`), the country name, capital, currency, and population.*

3. Review the proposed script. It should call `pm.visualizer.set` with an HTML template, similar to:

```javascript
const country = pm.response.json()[0];

const template = `
  <div style="font-family: sans-serif; border: 3px dashed #444; border-radius: 12px; padding: 16px; max-width: 320px;">
    <img src="{{flag}}" alt="flag" style="width: 100%; border-radius: 6px;" />
    <h2 style="margin: 12px 0 4px;">{{name}}</h2>
    <p style="margin: 2px 0;">Capital: <b>{{capital}}</b></p>
    <p style="margin: 2px 0;">Currency: <b>{{currency}}</b></p>
    <p style="margin: 2px 0;">Population: <b>{{population}}</b></p>
  </div>
`;

pm.visualizer.set(template, {
    name: country.name,
    capital: country.capital,
    currency: country.currency,
    population: country.population,
    flag: country.media.flag
});
```

4. Accept the change and **save** the request.

> No Agent Mode available? Paste the script above at the bottom of your **Post-response** script yourself.

**Validation:** The "Get Country" request has a post-response script that calls `pm.visualizer.set`.

### Step 9: Verify the Journey

> Quick end-to-end check — one **Send** should pass tests, show your card, and fill in your variables.

1. Click **Send**.
2. Check **Test Results** — both tests should pass.
3. Open the response's **Visualize** tab to see your passport-stamp card, flag and all.
4. Open the **Postman Console** (bottom-left, or View → Show Postman Console) and find your `Welcome to ...` message.
5. Pop back to the **Country Dossier** tab, open **Variables**, and confirm `capital` and `currency` now hold values from the response.

**Validation:** `GET https://liftoff-101.mock.postman.postman.dev/countries` returns 200 (server-side sanity check), and the "Get Country" request has a post-response test using `pm.test`.

---

## Bonus: Surprise Destination

Feeling adventurous? Add a **pre-request** script that picks a random country every time you hit Send.

1. Open **Get Country** and select the **Scripts** tab.
2. Click **Pre-request** and add:

```javascript
const destinations = ["Bangladesh", "Japan", "Brazil", "Kenya", "Norway", "Peru"];
const pick = destinations[Math.floor(Math.random() * destinations.length)];

pm.collectionVariables.set("country", pick);
console.log(`Today's destination: ${pick}`);
```

3. Save, then **Send** a few times and watch the response — and your visualization — change. Since your `name` parameter already uses `{{country}}`, no other edits are needed.

**Validation:** The "Get Country" request has a pre-request script that calls `pm.collectionVariables.set("country", ...)`.