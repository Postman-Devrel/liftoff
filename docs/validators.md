# LiftOff Validators Reference

Validators are TypeScript functions that verify a learner has completed a step by checking their Postman workspace via the Postman API. Each step in a module has a `validatorId` that maps to a validator function in the registry.

## Architecture

```
User clicks "Validate"
  → POST /api/postman/validate { stepId, apiKey, context }
  → validatorRegistry[stepId](apiKey, context)
  → Returns { success, message, pointsAwarded, context }
```

### Key Files

| File | Purpose |
|------|---------|
| `src/types/validation.ts` | Type definitions (`ValidatorFn`, `ValidationContext`, `ValidationResult`) |
| `src/lib/postman-api.ts` | Postman API client (all API calls go through here) |
| `src/lib/validators/index.ts` | Validator registry — maps `validatorId` strings to functions |
| `src/lib/validators/<module-id>/` | Validator files grouped by module |

### ValidatorFn Signature

```typescript
type ValidatorFn = (
  apiKey: string,
  context: ValidationContext
) => Promise<ValidationResult>;
```

### ValidationContext

Context is passed between steps — early steps discover IDs that later steps depend on.

```typescript
interface ValidationContext {
  userId?: string;       // Set automatically from the Postman API key
  workspaceId?: string;  // Discovered by workspace validators, used by all subsequent steps
  environmentId?: string; // Discovered by environment validators
}
```

Always return updated context when discovering new IDs so downstream validators can use them.

## Postman API Client

All Postman API calls use the client in `src/lib/postman-api.ts`. Available methods:

| Method | Endpoint | Returns |
|--------|----------|---------|
| `getMe(apiKey)` | `GET /me` | `{ id, username }` |
| `listWorkspaces(apiKey)` | `GET /workspaces` | `PostmanWorkspace[]` |
| `getWorkspace(apiKey, id)` | `GET /workspaces/:id` | Workspace detail with `collections`, `environments`, `createdBy` |
| `listEnvironments(apiKey)` | `GET /environments` | `PostmanEnvironment[]` |
| `getEnvironment(apiKey, uid)` | `GET /environments/:uid` | Environment detail with `values` array |
| `getCollection(apiKey, uid)` | `GET /collections/:uid` | Collection detail with `item` (requests) array |

If a step needs a Postman API method that doesn't exist here, add it before writing the validator.

## Validator Patterns

### Workspace Check

Verify a workspace with a specific name exists and was created by the current user.

```typescript
import { ValidatorFn } from "@/types/validation";
import { listWorkspaces, getWorkspace } from "@/lib/postman-api";

export const validateMyWorkspace: ValidatorFn = async (apiKey, context) => {
  const workspaces = await listWorkspaces(apiKey);

  const candidates = workspaces.filter((ws) => {
    const match = ws.name.match(/^My Module\s*-\s*(.+)$/i);
    return match && match[1].trim().length > 0;
  });

  if (candidates.length === 0) {
    return {
      success: false,
      message: 'No workspace matching "My Module - [your name]" found.',
      pointsAwarded: 0,
    };
  }

  for (const ws of candidates) {
    const detail = await getWorkspace(apiKey, ws.id);
    if (context.userId && detail.createdBy === context.userId) {
      return {
        success: true,
        message: `Workspace "${ws.name}" found and verified!`,
        pointsAwarded: 10,
        context: { ...context, workspaceId: ws.id },
      };
    }
  }

  return {
    success: false,
    message: 'Found matching workspace(s) but none created by you.',
    pointsAwarded: 0,
  };
};
```

**Key points:**
- Always scope to `context.userId` to verify ownership
- Return `workspaceId` in context so subsequent steps can use it

### Collection Check

Verify a collection exists inside the user's workspace.

```typescript
import { ValidatorFn } from "@/types/validation";
import { getWorkspace } from "@/lib/postman-api";

export const validateMyCollection: ValidatorFn = async (apiKey, context) => {
  if (!context.workspaceId) {
    return {
      success: false,
      message: "Please complete Step 1 first (create the workspace).",
      pointsAwarded: 0,
    };
  }

  const workspace = await getWorkspace(apiKey, context.workspaceId);
  const collections = workspace.collections || [];

  const target = collections.find(
    (c: { name: string }) => c.name.toLowerCase() === "my collection"
  );

  if (!target) {
    return {
      success: false,
      message: 'No collection named "My Collection" found in your workspace.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Collection "${target.name}" found!`,
    pointsAwarded: 10,
    context,
  };
};
```

**Key points:**
- Require `context.workspaceId` — fail with a helpful "complete Step N first" message if missing
- Use case-insensitive matching for names

### Environment Check

Verify an environment exists and has the correct variables and values.

```typescript
import { ValidatorFn } from "@/types/validation";
import { getWorkspace, getEnvironment } from "@/lib/postman-api";

export const validateMyEnvironment: ValidatorFn = async (apiKey, context) => {
  if (!context.workspaceId) {
    return {
      success: false,
      message: "Please complete Step 1 first (create the workspace).",
      pointsAwarded: 0,
    };
  }

  const workspace = await getWorkspace(apiKey, context.workspaceId);
  const wsEnvironments: { id: string; name: string; uid: string }[] =
    workspace.environments || [];

  const targetEnv = wsEnvironments.find(
    (env) => env.name.trim().toLowerCase() === "my env"
  );

  if (!targetEnv) {
    return {
      success: false,
      message: 'No environment named "My Env" found.',
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, targetEnv.uid);
  const values: { key: string; value: string; current_value?: string }[] =
    envDetail.values || [];

  const myVar = values.find((v) => v.key.toLowerCase() === "baseurl");

  if (!myVar) {
    return {
      success: false,
      message: 'Environment found but missing "baseURL" variable.',
      pointsAwarded: 0,
    };
  }

  // IMPORTANT: Always use current_value with fallback to value
  const effectiveValue = myVar.current_value || myVar.value;

  if (effectiveValue !== "https://example.com") {
    return {
      success: false,
      message: `Variable "baseURL" is "${effectiveValue}" — expected "https://example.com".`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: 'Environment configured correctly!',
    pointsAwarded: 10,
    context: { ...context, environmentId: targetEnv.uid },
  };
};
```

#### Critical: Postman Environment Value Fields

The Postman API returns environment variables with **two value fields**:

| Field | Description |
|-------|-------------|
| `value` | The **initial value** — shared with team members and synced to the cloud |
| `current_value` | The **current value** — local to the user's session |

**The Postman API can only read values that have been shared/persisted.** When a user sets a value in the Postman UI, it typically goes into the "current value" column, which is local-only and invisible to the API. The "initial value" column is what gets synced to the cloud.

Users must click **Share** (or **Persist All**) in the Postman environment editor to copy current values into initial values, making them visible to the API.

**Always check both fields:**
```typescript
const effectiveValue = variable.current_value || variable.value;
```

**Always include this notice in step descriptions** for any step that creates or modifies environment variables:

> **Important:** After setting values, click the **Share** button (or **Persist All**) in the environment editor to sync your values to the cloud. LiftOff validates via the Postman API, which can only see shared/initial values — not local current values.

### API Response Check

Call an external API and verify the response. Used for steps that ask learners to verify an API is running.

```typescript
import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";

const TARGET_API = "https://api.example.com";

export const validateApiCall: ValidatorFn = async (apiKey, context) => {
  if (!context.environmentId) {
    return {
      success: false,
      message: "Please complete the environment steps first.",
      pointsAwarded: 0,
    };
  }

  // Read the API key from the user's environment
  const envDetail = await getEnvironment(apiKey, context.environmentId);
  const values: { key: string; value: string; current_value?: string }[] =
    envDetail.values || [];
  const apiKeyVar = values.find((v) => v.key.toLowerCase() === "apikey");
  const apiKeyValue = apiKeyVar?.current_value || apiKeyVar?.value;

  if (!apiKeyValue) {
    return {
      success: false,
      message: "apiKey not found in your environment.",
      pointsAwarded: 0,
    };
  }

  try {
    const res = await fetch(`${TARGET_API}/endpoint`, {
      headers: { "x-api-key": apiKeyValue },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `API returned ${res.status}. Check your API key.`,
        pointsAwarded: 0,
      };
    }

    return {
      success: true,
      message: "API call successful!",
      pointsAwarded: 10,
      context,
    };
  } catch {
    return {
      success: false,
      message: "Could not reach the API.",
      pointsAwarded: 0,
    };
  }
};
```

**Key points:**
- Always read credentials from the user's environment, not hardcoded
- Use `current_value || value` when reading environment variables
- Handle network errors gracefully with try/catch

## Existing Validators

### api-basics

| Validator ID | File | What it checks |
|-------------|------|---------------|
| `validate-api-basics-create-workspace` | `api-basics/validate-api-basics-create-workspace.ts` | Workspace named "API Basics - [name]" exists, owned by current user |
| `validate-api-basics-create-collection` | `api-basics/validate-api-basics-create-collection.ts` | Collection "My First Collection" with a GET request to `/coffee/hot` |
| `validate-api-basics-create-environment` | `api-basics/validate-api-basics-create-environment.ts` | Environment "Local" with `baseURL` = `https://api.sampleapis.com` |
| `validate-api-basics-use-base-url` | `api-basics/validate-api-basics-use-base-url.ts` | Coffee GET request URL uses `{{baseURL}}/coffee/hot`; Local env has correct `baseURL` |
| `validate-api-basics-send-and-test` | `api-basics/validate-api-basics-send-and-test.ts` | Coffee request has `pm.test` status check; sample coffee API returns 200 |

### artemis-mission-control

| Validator ID | File | What it checks |
|-------------|------|---------------|
| `validate-workspace` | `step1-workspace.ts` | Workspace "Artemis II - [name]" exists, owned by user |
| `validate-collection` | `step2-collection.ts` | Collection from imported OpenAPI spec contains "artemis" + "mission" |
| `validate-environment-exists` | `step3-environment.ts` | Environment "artemis.local" with variables: baseUrl, apiKey, logId |
| `validate-environment-values` | `step4-env-values.ts` | baseUrl = `https://artemis.up.railway.app`, apiKey marked as secret |
| `validate-health-and-register` | `step5-health-register.ts` | Artemis API health check passes, apiKey env var is populated |
| `validate-apikey-saved` | `step6-apikey-saved.ts` | apiKey env var works — GET /mission returns 200 |
| `validate-mission-response` | `step7-mission-response.ts` | GET /mission returns mission data with a callsign |
| `validate-mission-logs` | `step8-mission-logs.ts` | GET /logs returns at least 3 logs |
| `validate-log-updated` | `step9-log-updated.ts` | Mission "update" step is marked completed |
| `validate-log-deleted` | `step10-log-deleted.ts` | Mission "delete" step is marked completed |
| `validate-mission-briefing` | `step11-mission-briefing.ts` | Mission "briefing" step is marked completed |
| `validate-splashdown` | `step12-splashdown.ts` | Mission completion_percentage = 100 |
| `validate-test-collection` | `step13-test-collection.ts` | A test/integration collection exists (or 2+ collections) |
| `validate-test-environment` | `step14-test-environment.ts` | Environment "artemis.test" exists in workspace |

## Writing Good Error Messages

Validators should give clear, actionable error messages:

- **Tell the user what's wrong:** `'Found environments (Dev, Staging) but none named exactly "Local".'`
- **Tell them how to fix it:** `'Add a variable "baseURL" with the value "https://api.sampleapis.com".'`
- **Handle prerequisites:** `'Please complete Step 1 first (create the workspace).'`
- **Show what you found vs what you expected:** `'Variable "baseURL" is "http://localhost" — expected "https://api.sampleapis.com".'`

## Adding a New Validator

1. Create the file at `src/lib/validators/<module-id>/<validatorId>.ts`
2. Export a named `ValidatorFn` function
3. Import and register it in `src/lib/validators/index.ts`
4. Run `npx next build` to verify

Or use `/liftoff-module sync` to auto-generate validators from `module.json`.
