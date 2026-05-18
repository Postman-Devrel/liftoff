import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateBankingSetBaseUrl: ValidatorFn = async (apiKey, context) => {
  const ws = await resolveWorkspace(apiKey, context, context.bankingWorkspaceId, /intergalactic\s+banking/i, "Intergalactic Banking");
  if ("error" in ws) return ws.error;
  const workspace = ws.detail as Record<string, unknown>;
  const wsEnvironments: { id: string; name: string; uid: string }[] =
    (workspace.environments as { id: string; name: string; uid: string }[]) || [];

  const bankingEnv = wsEnvironments.find(
    (env) => env.name.trim().toLowerCase() === "banking.local"
  );

  if (!bankingEnv) {
    return {
      success: false,
      message: 'Environment "Banking.local" not found. Complete the previous step first.',
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, bankingEnv.uid);
  const values = envDetail.values || [];

  const effectiveValue = resolveEnvVar(
    values,
    "baseUrl",
    'Variable "baseUrl" not found in Banking.local. Use Agent Mode to add it.'
  );
  if (typeof effectiveValue !== "string") return effectiveValue;

  if (effectiveValue !== "https://ai-powered-bootcamp-production.up.railway.app") {
    return {
      success: false,
      message: `Variable "baseUrl" found but its value is "${effectiveValue}". Expected "https://ai-powered-bootcamp-production.up.railway.app".`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: 'Variable "baseUrl" is correctly set!',
    pointsAwarded: 10,
    context: { ...context, environmentId: bankingEnv.uid },
  };
};
