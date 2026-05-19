import { ValidatorFn } from "@/types/validation";
import { getCollection, getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

type CollectionItem = {
  name?: string;
  request?: unknown;
  event?: { listen: string; script?: { exec?: string[] } }[];
  item?: CollectionItem[];
};

function findRequest(items: CollectionItem[], pattern: RegExp): CollectionItem | null {
  for (const item of items) {
    if (item.request && item.name && pattern.test(item.name)) return item;
    if (item.item) {
      const found = findRequest(item.item, pattern);
      if (found) return found;
    }
  }
  return null;
}

function hasPostResponseScript(item: CollectionItem, varPattern: RegExp): boolean {
  if (!item.event) return false;
  const testEvent = item.event.find((e) => e.listen === "test");
  if (!testEvent?.script?.exec || testEvent.script.exec.length === 0) return false;
  const scriptContent = testEvent.script.exec.join("\n");
  return varPattern.test(scriptContent);
}

export const validateBankingToAccount: ValidatorFn = async (apiKey, context) => {
  const ws = await resolveWorkspace(apiKey, context, context.bankingWorkspaceId, /intergalactic\s+banking/i, "Intergalactic Banking");
  if ("error" in ws) return ws.error;
  const workspace = ws.detail as Record<string, unknown>;

  const collections = (workspace.collections as { name: string; uid: string }[]) || [];
  const bankingCollection = collections.find(
    (c) => /intergalactic\s+bank\s+api/i.test(c.name)
  );
  if (!bankingCollection) {
    return {
      success: false,
      message: "Banking API collection not found. Complete the earlier steps first.",
      pointsAwarded: 0,
    };
  }

  const collectionDetail = await getCollection(apiKey, bankingCollection.uid);
  const items: CollectionItem[] = collectionDetail.item || [];

  const toAccountReq = findRequest(items, /toAccount/i);
  if (!toAccountReq) {
    return {
      success: false,
      message: 'Could not find a "toAccount" request in the collection.',
      pointsAwarded: 0,
    };
  }

  if (!hasPostResponseScript(toAccountReq, /toAccount|accountId/i)) {
    return {
      success: false,
      message: 'The toAccount request does not have a post-response script that saves the accountId. Use Agent Mode to add one.',
      pointsAwarded: 0,
    };
  }

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
    "toAccount",
    'Post-response script found, but "toAccount" variable is not set. Send the toAccount request to populate it, then Share/Persist the environment.'
  );
  if (typeof effectiveValue !== "string") return effectiveValue;

  return {
    success: true,
    message: `Post-response script and variable "toAccount" are both set!`,
    pointsAwarded: 10,
    context: { ...context, environmentId: bankingEnv.uid },
  };
};
