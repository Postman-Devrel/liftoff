import { ValidatorFn } from "@/types/validation";
import { getWorkspace, getEnvironment } from "@/lib/postman-api";

export const validateEnvironmentExists: ValidatorFn = async (
  apiKey,
  context
) => {
  const wsId = context.artemisWorkspaceId || context.workspaceId;
  if (!wsId) {
    return {
      success: false,
      message: "Please complete Step 1 first (create the workspace).",
      pointsAwarded: 0,
    };
  }

  // Only look at environments inside the user's Artemis workspace
  const workspace = await getWorkspace(apiKey, wsId);
  const wsEnvironments: { id: string; name: string; uid: string }[] =
    workspace.environments || [];

  const artemisEnv = wsEnvironments.find(
    (env) => env.name.trim().toLowerCase() === "artemis.local"
  );

  if (!artemisEnv) {
    const envNames = wsEnvironments.map((e) => e.name).join(", ");
    return {
      success: false,
      message: envNames
        ? `Found environments in your workspace (${envNames}) but none named exactly "artemis.local".`
        : 'No environments in your Artemis workspace. Create one named "artemis.local" with variables: baseUrl, apiKey, logId.',
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, artemisEnv.uid);
  const values = envDetail.values || [];
  const varKeys = values.map((v: { key: string }) => v.key.toLowerCase());

  const required = ["baseurl", "apikey", "logid"];
  const missing = required.filter((r) => !varKeys.includes(r));

  if (missing.length > 0) {
    const displayNames = missing.map((m) => {
      if (m === "baseurl") return "baseUrl";
      if (m === "apikey") return "apiKey";
      return "logId";
    });
    return {
      success: false,
      message: `Environment "artemis.local" found but missing variables: ${displayNames.join(", ")}. Add them and try again.`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      'Environment "artemis.local" found with all required variables (baseUrl, apiKey, logId)!',
    pointsAwarded: 10,
    context: { ...context, environmentId: artemisEnv.uid },
  };
};
