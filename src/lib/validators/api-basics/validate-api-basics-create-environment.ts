import { ValidatorFn } from "@/types/validation";
import { getWorkspace, getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";

export const validateApiBasicsCreateEnvironment: ValidatorFn = async (
  apiKey,
  context
) => {
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

  const localEnv = wsEnvironments.find(
    (env) => env.name.trim().toLowerCase() === "local"
  );

  if (!localEnv) {
    const envNames = wsEnvironments.map((e) => e.name).join(", ");
    return {
      success: false,
      message: envNames
        ? `Found environments in your workspace (${envNames}) but none named exactly "Local".`
        : 'No environments in your workspace. Create one named "Local" with a variable "baseURL" set to "https://api.sampleapis.com".',
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, localEnv.uid);
  const values = envDetail.values || [];

  const baseUrlValue = resolveEnvVar(
    values,
    "baseURL",
    'Environment "Local" found but missing the "baseURL" variable. Add it with the value "https://api.sampleapis.com".'
  );
  if (typeof baseUrlValue !== "string") return baseUrlValue;

  if (baseUrlValue !== "https://api.sampleapis.com") {
    return {
      success: false,
      message: `Variable "baseURL" found but its value is "${baseUrlValue}". Set it to "https://api.sampleapis.com".`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      'Environment "Local" found with baseURL set to "https://api.sampleapis.com"!',
    pointsAwarded: 10,
    context: { ...context, environmentId: localEnv.uid },
  };
};
