import { ValidatorFn } from "@/types/validation";
import { getCollection } from "@/lib/postman-api";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

type CollectionItem = {
  name?: string;
  request?: unknown;
  item?: CollectionItem[];
};

function collectRequestNames(items: CollectionItem[]): string[] {
  const names: string[] = [];
  for (const item of items) {
    if (item.request && item.name) names.push(item.name);
    if (item.item) names.push(...collectRequestNames(item.item));
  }
  return names;
}

const EXPECTED_REQUESTS = [
  /generate\s+api\s+key/i,
  /fromAccount/i,
  /toAccount/i,
  /new\s+transaction|create.*transaction/i,
  /transaction\s+by\s+id/i,
];

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

  const collectionDetail = await getCollection(apiKey, bankingCollection.uid);
  const items: CollectionItem[] = collectionDetail.item || [];
  const requestNames = collectRequestNames(items);

  const missing = EXPECTED_REQUESTS.filter(
    (pattern) => !requestNames.some((name) => pattern.test(name))
  );

  if (missing.length > 0) {
    return {
      success: false,
      message: `Collection "${bankingCollection.name}" found but it's missing expected requests. Make sure you forked the correct "[Do It Yourself] Intergalactic Bank API" collection — it should contain requests like Generate API Key, fromAccount, toAccount, and Create new transaction.`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Collection "${bankingCollection.name}" found with all expected requests!`,
    pointsAwarded: 10,
    context,
  };
};
