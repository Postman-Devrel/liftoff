import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

type WorkspaceApi = {
  id: string;
  name: string;
};

export const validateAiEngineerDownstreamRenameSchemaField: ValidatorFn = async (
  apiKey,
  context
) => {
  const ws = await resolveWorkspace(
    apiKey,
    context,
    context.aiEngineerWorkspaceId,
    /^Downstream\s+Demo\s*-\s*.+$/i,
    "Downstream Demo - [your name]"
  );
  if ("error" in ws) return ws.error;

  const workspace = ws.detail as Record<string, unknown>;
  const apis = (workspace.apis as WorkspaceApi[]) || [];

  const usersApi = apis.find((a) => a.name.trim().toLowerCase() === "users api");
  if (!usersApi) {
    const apiNames = apis.map((a) => a.name).join(", ");
    return {
      success: false,
      message: apiNames
        ? `Found APIs in your workspace (${apiNames}) but none named "Users API". Create an API named "Users API" with the spec from the step.`
        : 'No APIs found in your workspace. Click **APIs** → **+**, name it "Users API", and paste the OpenAPI spec from the step.',
      pointsAwarded: 0,
    };
  }

  const res = await fetch(`https://api.getpostman.com/apis/${usersApi.id}`, {
    headers: {
      "x-api-key": apiKey,
      "User-Agent": "LiftOff/1.0 (quickstarts.postman.com)",
    },
  });

  if (!res.ok) {
    return {
      success: false,
      message: `Found "Users API" but the Postman API returned ${res.status} when fetching its spec. Try saving the spec again.`,
      pointsAwarded: 0,
    };
  }

  const body = await res.text();

  if (/\buser_id\b/.test(body)) {
    return {
      success: false,
      message:
        'The "Users API" spec still contains `user_id`. Rename it to `userId` in every response schema, then save the spec.',
      pointsAwarded: 0,
    };
  }

  if (!/\buserId\b/.test(body)) {
    return {
      success: false,
      message:
        'The "Users API" spec does not contain `userId`. Paste the OpenAPI spec from the step (with `userId` in the response schema) and save.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      'Spec updated — `userId` is present in the "Users API" response schema and `user_id` is gone.',
    pointsAwarded: 10,
    context: { ...context, aiEngineerWorkspaceId: ws.id },
  };
};
