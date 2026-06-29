** PRIVATE **
# World Explorer

Travel the world without leaving Postman. In this lesson you'll spin up a workspace, look up real country data, work with variables, let **Agent Mode** do some of the heavy lifting (including building you a custom visualization), and write tests that prove your journey went to plan — all powered by the LiftOff Countries API:

```
https://liftoff-101.mock.postman.postman.dev/countries
```

Each country comes back with its capital, currency, population, dialing code, and even flag artwork. The API takes a `name` query parameter so you can filter down to a single destination.

> This lesson uses **collection variables** (scoped to the collection) rather than an environment, so you'll see a different way of storing reusable values than in *API Basics*.

---

## Part 1: Plot Your Route

Set up your workspace, create a collection, and make your first lookup.

### Step 1: Create a Workspace

> **New to Postman?** You'll create three building blocks in this part: a **workspace** (your project folder), a **collection** (a group of related requests), and a **request** (a single API call). Each step below walks you through where to click.

1. Open [postman.com](https://postman.com) and sign in (or create a free account).
2. Click **Workspaces** in the top navigation → **Create Workspace**.
3. Choose **Blank workspace**.
4. Name it: **[Your name] - World Explorer** (e.g. *Alex - World Explorer*).
5. Set visibility to **Internal**, leave access as *Only you and invited people*, then click **Create Workspace**.

> A **workspace** is where your Postman work lives — collections, requests, and variables all belong to one.

**Validation:** An internal workspace named "[Your name] - World Explorer" exists and was created by the current user.

### Step 2: Create a Collection

1. Confirm you're in your new workspace (check the name in the top-left).
2. In the left sidebar, click **Collections** → **+** (or **Create Collection**).
3. Name it **Country Dossier** and save.

> A **collection** groups related requests together — think of it as a dossier for all your country lookups. This lesson uses **collection variables** (scoped to the collection) rather than an environment, so you'll see a different way of storing reusable values than in *API Basics*.

**Validation:** Collection named "Country Dossier" exists in the workspace and was created by the current user.

### Step 3: Add Your First Lookup

1. In the left sidebar, expand **Country Dossier** and click **Add a request** (or open the collection's **⋯** menu → **Add request**).
2. Name the request **Get Country**.
3. Leave the method as **GET** and paste this URL into the address bar:

```
https://liftoff-101.mock.postman.postman.dev/countries
```

4. Click **Save** (Ctrl/Cmd+S) — choose **Country Dossier** as the destination if prompted.
5. Click **Send**. You should get **200 OK** and a JSON array of country objects. Have a quick scroll — each entry has `name`, `capital`, `currency`, `population`, and a `media` block with image links.

> A **request** is a single call to an API. **GET** means you're asking the server for data; the URL tells it *what* to return.

**Validation:** Collection "Country Dossier" contains a GET request named "Get Country" whose URL includes `/countries`.

### Step 4: Pick a Destination

Time to filter down to one country.

1. Open **Get Country** from your collection.
2. Click the **Params** tab (directly below the URL bar).
3. In the **Query Params** table, add a row:

| Key    | Value                       |
| ------ | --------------------------- |
| `name` | *your home country*, e.g. `Bangladesh` |

4. Make sure the checkbox next to `name` is checked — that enables the parameter.
5. Your URL should now end with `?name=Bangladesh` (or wherever you're headed). Click **Send** again and confirm the array now contains just your country.

**Validation:** The "Get Country" request has a query parameter with the key `name` and a non-empty value.

---

## Part 2: Travel Smarter

Swap hard-coded values for variables, bring in Agent Mode, and prove everything works.

### Step 5: Store Your Destination in a Variable

Hard-coding a country is fine for one trip, but variables make your request reusable.

1. In the left sidebar, click **Country Dossier** (the collection name itself, not a request inside it).
2. In the panel that opens on the right, select the **Variables** tab.
3. Add a variable named `country`. In the **Shared Value** column, enter your country (e.g. `Bangladesh`).
4. Back in **Get Country**, open the **Params** tab and change the `name` query parameter value to `{{country}}`.
5. Save the request (Ctrl/Cmd+S).

**Important:** Enter your country in the **Shared Value** column, not just **Value**. The plain **Value** stays local to you and isn't synced to the cloud. LiftOff validates through the Postman API, which can only read **Shared Values** — never your local **Value**.

**Validation:** Collection "Country Dossier" has a variable `country` with a non-empty shared value, and the "Get Country" request URL uses `{{country}}` in the `name` parameter.

### Step 6: Let Agent Mode Be Your Guide

Instead of writing tests by hand, ask **Agent Mode** to do it for you.

1. Open **Agent Mode** from the command palette: click the **omni search bar** at the top, type `>` to switch to commands, then type **Open Agent Mode** and select it.
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

Now capture some data from the response so you can reuse it later. Open **Get Country → Scripts → Post-response** and add this to the **bottom** of your existing script:

```javascript
const country = pm.response.json()[0];

pm.collectionVariables.set("capital", country.capital);
pm.collectionVariables.set("currency", country.currency);

console.log(`Welcome to ${country.capital}! Don't forget some ${country.currency}.`);
```

Save the request.

**Validation:** The "Get Country" request has a post-response script that calls `pm.collectionVariables.set`.

### Step 8: Turn Your Stamp Into a Visualization

Your passport stamp is just text in the console right now — let's make it look the part. Ask **Agent Mode** to build a **Postman Visualizer** view from the country data.

1. Open **Agent Mode** again.
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

Confirm everything works end to end.

1. Click **Send**.
2. Check **Test Results** — both tests should pass.
3. Open the response's **Visualize** tab to see your passport-stamp card, flag and all.
4. Open the **Postman Console** (bottom-left, or View → Show Postman Console) and find your `Welcome to ...` message.
5. Pop back to the collection's **Variables** tab and confirm `capital` and `currency` now hold values from the response.

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