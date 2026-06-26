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

Sign in to Postman and create a new **internal** workspace.
Name it: **[Your name] - World Explorer**

**Validation:** An internal workspace named "[Your name] - World Explorer" exists and was created by the current user.

### Step 2: Create a Collection

Inside your new workspace, create a collection called **Country Dossier**.

**Validation:** Collection named "Country Dossier" exists in the workspace and was created by the current user.

### Step 3: Add Your First Lookup

Inside **Country Dossier**, add a **GET** request named **Get Country** pointing at:

```
https://liftoff-101.mock.postman.postman.dev/countries
```

Click **Send**. You should get **200 OK** and a JSON array of country objects. Have a quick scroll — each entry has `name`, `capital`, `currency`, `population`, and a `media` block with image links.

**Validation:** Collection "Country Dossier" contains a GET request named "Get Country" whose URL includes `/countries`.

### Step 4: Pick a Destination

Time to filter. Open **Get Country** and add a **query parameter**:

| Key    | Value                       |
| ------ | --------------------------- |
| `name` | *your home country*, e.g. `Bangladesh` |

Your URL should now end with `?name=Bangladesh` (or wherever you're headed). **Send** again and confirm the array now contains just your country.

**Validation:** The "Get Country" request has a query parameter with the key `name` and a non-empty value.

---

## Part 2: Travel Smarter

Swap hard-coded values for variables, bring in Agent Mode, and prove everything works.

### Step 5: Store Your Destination in a Variable

Hard-coding a country is fine for one trip, but variables make your request reusable.

1. Open the **Country Dossier** collection, go to the **Variables** tab.
2. Add a variable named `country`. In the **Shared Value** column, enter your country (e.g. `Bangladesh`).
3. Back in **Get Country**, change the `name` query parameter value to `{{country}}`.
4. Save the request (Ctrl/Cmd+S).

**Important:** Enter your country in the **Shared Value** column, not just **Value**. The plain **Value** stays local to you and isn't synced to the cloud. LiftOff validates through the Postman API, which can only read **Shared Values** — never your local **Value**.

**Validation:** Collection "Country Dossier" has a variable `country` with a non-empty shared value, and the "Get Country" request URL uses `{{country}}` in the `name` parameter.

### Step 6: Let Agent Mode Be Your Guide

Instead of writing tests by hand, ask **Agent Mode** to do it for you.

1. Open **Agent Mode** in Postman.
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

> No Agent Mode available? Open **Scripts → Post-response** and paste the script above yourself.

**Validation:** The "Get Country" request has a post-response script containing `pm.test`.

### Step 7: Stamp Your Passport

Now capture some data from the response so you can reuse it later. Add this to the **bottom** of your post-response script (**Scripts → Post-response**):

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

Open **Get Country → Scripts → Pre-request** and add:

```javascript
const destinations = ["Bangladesh", "Japan", "Brazil", "Kenya", "Norway", "Peru"];
const pick = destinations[Math.floor(Math.random() * destinations.length)];

pm.collectionVariables.set("country", pick);
console.log(`Today's destination: ${pick}`);
```

Save, then **Send** a few times and watch the response — and your visualization — change. Since your `name` parameter already uses `{{country}}`, no other edits are needed.

**Validation:** The "Get Country" request has a pre-request script that calls `pm.collectionVariables.set("country", ...)`.