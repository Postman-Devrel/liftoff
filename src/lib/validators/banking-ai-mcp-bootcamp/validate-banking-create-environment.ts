import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateBankingCreateEnvironment: ValidatorFn = async (apiKey, context) => {
  const ws = await resolveWorkspace(apiKey, context, context.bankingWorkspaceId, /intergalactic\s+banking/i, "Intergalactic Banking");
  if ("error" in ws) return ws.error;
  const workspace = ws.detail as Record<string, unknown>;
  const wsEnvironments: { id: string; name: string; uid: string }[] =
    (workspace.environments as { id: string; name: string; uid: string }[]) || [];

  const bankingEnv = wsEnvironments.find(
    (env) => env.name.trim().toLowerCase() === "banking.local"
  );

  if (!bankingEnv) {
    const envNames = wsEnvironments.map((e) => e.name).join(", ");
    return {
      success: false,
      message: envNames
        ? `Found environments (${envNames}) but none named "Banking.local". Use Agent Mode to create it.`
        : 'No environments found. Use Agent Mode with the prompt: `Create an Environment Variable file called Banking.local`',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Environment "Banking.local" found in your workspace!`,
    pointsAwarded: 10,
    context: { ...context, environmentId: bankingEnv.uid },
  };
};
