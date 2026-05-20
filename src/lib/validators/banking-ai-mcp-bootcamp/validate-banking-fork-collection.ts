import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";
import { resolveBankingCollection } from "./resolve-collection";

export const validateBankingForkCollection: ValidatorFn = async (apiKey, context) => {
  const ws = await resolveWorkspace(apiKey, context, context.bankingWorkspaceId, /intergalactic\s+banking/i, "Intergalactic Banking");
  if ("error" in ws) return ws.error;
  const workspace = ws.detail as Record<string, unknown>;
  const collections = (workspace.collections as { name: string; uid: string }[]) || [];

  const bankingCollection = await resolveBankingCollection(apiKey, collections);

  if (!bankingCollection) {
    const hasAny = collections.some(
      (c) => /intergalactic\s+bank\s+api/i.test(c.name)
    );
    if (hasAny) {
      const names = collections
        .filter((c) => /intergalactic\s+bank\s+api/i.test(c.name))
        .map((c) => `"${c.name}"`)
        .join(", ");
      return {
        success: false,
        message: `Found ${names} but none contain the expected requests (Generate API Key, fromAccount, toAccount, Create new transaction). Make sure you forked the correct "[Do It Yourself] Intergalactic Bank API" collection.`,
        pointsAwarded: 0,
      };
    }
    if (collections.length > 0) {
      const names = collections.map((c) => c.name).join(", ");
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
    message: `Collection "${bankingCollection.name}" found with all expected requests!`,
    pointsAwarded: 10,
    context: { ...context, bankingCollectionUid: bankingCollection.uid },
  };
};
