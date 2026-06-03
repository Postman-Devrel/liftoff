# API Basics

Learn the fundamentals of REST APIs using Postman.

## Part 1: Your First Request

Set up your workspace and make your first API call.

### Step 1: Create a Workspace

Sign in to Postman and create a new blank workspace.
Name it: **API Basics - [your name]**

**Validation:** Workspace named "API Basics - [name]" exists and was created by the current user.

### Step 2: Create a Collection

Create a new collection in your workspace called **My First Collection** and add a GET request to `https://api.sampleapis.com/coffee/hot`.

**Validation:** Collection named "My First Collection" exists in the workspace with a GET request whose URL includes `/coffee/hot`.

### Step 3: Create an Environment

Create a new environment in your workspace called **Local** and add a variable called **baseURL** with the initial value `https://api.sampleapis.com`.

**Important:** After setting the value, click the **Share** button (or **Persist All**) in the environment editor to sync your values to the cloud. LiftOff validates via the Postman API, which can only see shared/initial values — not local current values.

**Validation:** Environment named "Local" exists in the workspace with a variable "baseURL" set to "https://api.sampleapis.com".

### Step 4: Use Your Environment Variable

1. Open the GET request in **My First Collection** (from Step 2).
2. Replace the full URL with: `{{baseURL}}/coffee/hot`
3. In the environment dropdown (top-right), select **Local**.
4. Save the request (Ctrl/Cmd+S).

**Validation:** GET request in **My First Collection** uses `{{baseURL}}/coffee/hot` in the saved URL; environment **Local** exists with shared `baseURL` = `https://api.sampleapis.com`.

### Step 5: Send Your Request and Add a Test

1. With **Local** still selected, click **Send**.
2. Expect **200 OK** and a JSON array of coffee objects (`title`, `description`, etc.).
3. Open **Scripts** → **Post-response** and add:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

4. Click **Send** again and confirm the test passes in **Test Results**.

**Validation:** Request has a post-response test script with `pm.test`; `GET https://api.sampleapis.com/coffee/hot` returns 200 (server-side sanity check).
