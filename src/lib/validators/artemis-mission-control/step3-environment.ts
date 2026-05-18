import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateEnvironmentExists: ValidatorFn = async (
  apiKey,
  context
) => {
  const ws = await resolveWorkspace(
    apiKey,
    context,
    context.artemisWorkspaceId,
    /^Artemis\s+II\s*-\s*.+$/i,
    "Artemis II - [your name]"
  );
  if ("error" in ws) return ws.error;

  const wsEnvironments: { id: string; name: string; uid: string }[] =
    ((ws.detail as Record<string, unknown>).environments as { id: string; name: string; uid: string }[]) || [];

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
