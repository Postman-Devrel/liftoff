import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateBankingFromAccount: ValidatorFn = async (apiKey, context) => {
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
      message: 'Environment "Banking.local" not found. Complete the previous steps first.',
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, bankingEnv.uid);
  const values = envDetail.values || [];

  const effectiveValue = resolveEnvVar(
    values,
    "fromAccount",
    'Variable "fromAccount" not found in Banking.local. Add the post-response script and send the fromAccount request.'
  );
  if (typeof effectiveValue !== "string") return effectiveValue;

  return {
    success: true,
    message: `Variable "fromAccount" is set to "${effectiveValue}"!`,
    pointsAwarded: 10,
    context: { ...context, environmentId: bankingEnv.uid },
  };
};
