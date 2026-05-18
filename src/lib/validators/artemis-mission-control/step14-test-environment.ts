import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateTestEnvironment: ValidatorFn = async (
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

  const environments = (
    (ws.detail as Record<string, unknown>).environments as
      { name: string; uid: string }[]
  ) || [];

  const testEnv = environments.find(
    (e) => e.name.trim().toLowerCase() === "artemis.test"
  );

  if (!testEnv) {
    return {
      success: false,
      message:
        'No "artemis.test" environment found. Create it with baseUrl set to https://artemis.up.railway.app.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      'Test environment "artemis.test" found! Run your collection with the Collection Runner to verify.',
    pointsAwarded: 10,
    context,
  };
};
