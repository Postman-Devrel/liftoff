import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateBankingSetApiKey: ValidatorFn = async (apiKey, context) => {
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
  const values: { key: string; value: string; type?: string }[] = envDetail.values || [];

  const apiKeyVar = values.find(
    (v) => v.key === "apiKey" && v.value && v.value.trim().length > 0
  );

  if (!apiKeyVar) {
    return {
      success: false,
      message: 'Variable "apiKey" not found or is empty in Banking.local. Send the Generate API Key request and ensure the value is saved.',
      pointsAwarded: 0,
    };
  }

  if (apiKeyVar.type !== "secret") {
    return {
      success: false,
      message: 'Variable "apiKey" is set but not marked as sensitive. Go to Environments, click on the apiKey value, and set its type to "secret".',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: 'Variable "apiKey" is set and marked as sensitive!',
    pointsAwarded: 10,
    context: { ...context, environmentId: bankingEnv.uid },
  };
};
