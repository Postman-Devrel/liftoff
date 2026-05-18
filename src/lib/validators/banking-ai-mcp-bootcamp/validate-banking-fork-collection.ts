import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateBankingForkCollection: ValidatorFn = async (apiKey, context) => {
  const ws = await resolveWorkspace(apiKey, context, context.bankingWorkspaceId, /intergalactic\s+banking/i, "Intergalactic Banking");
  if ("error" in ws) return ws.error;
  const workspace = ws.detail as Record<string, unknown>;
  const collections = (workspace.collections as { name: string; uid: string }[]) || [];

  const bankingCollection = collections.find(
    (c: { name: string }) => /intergalactic\s+bank\s+api/i.test(c.name)
  );

  if (!bankingCollection) {
    if (collections.length > 0) {
      const names = collections.map((c: { name: string }) => c.name).join(", ");
      return {
        success: false,
        message: `Found collections (${names}) but none matching "Intergalactic Bank API". Fork the "[Do It Yourself] Intergalactic Bank API" collection from the bootcamp workspace.`,
        pointsAwarded: 0,
      };
    }
    return {
      success: false,
      message:
        'No collections found in your workspace. Fork the "[Do It Yourself] Intergalactic Bank API" from https://www.postman.com/devrel/ai-powered-api-mcp-bootcamp/overview',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Collection "${bankingCollection.name}" found in your workspace!`,
    pointsAwarded: 10,
    context,
  };
};
