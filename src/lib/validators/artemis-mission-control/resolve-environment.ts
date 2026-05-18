import { getEnvironment } from "@/lib/postman-api";
import { ValidationContext, ValidationResult } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export async function resolveArtemisEnvironment(
  apiKey: string,
  context: ValidationContext
): Promise<
  | { envId: string; values: { key: string; value: string; type?: string }[] }
  | ValidationResult
> {
  const ws = await resolveWorkspace(
    apiKey,
    context,
    context.artemisWorkspaceId,
    /^Artemis\s+II\s*-\s*.+$/i,
    "Artemis II - [your name]"
  );
  if ("error" in ws) return ws.error;

  const wsEnvironments: { id: string; name: string; uid: string }[] =
    (ws.detail as { environments?: { id: string; name: string; uid: string }[] }).environments || [];

  const artemisEnv = wsEnvironments.find(
    (env) => env.name.trim().toLowerCase() === "artemis.local"
  );

  if (!artemisEnv) {
    const envNames = wsEnvironments
      .map((e) => e.name)
      .join(", ");
    return {
      success: false,
      message: envNames
        ? `Found environments in your Artemis workspace (${envNames}) but none named "artemis.local".`
        : `No environments in your Artemis workspace. Create one named "artemis.local".`,
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, artemisEnv.uid);
  return { envId: artemisEnv.uid, values: envDetail.values || [] };
}
