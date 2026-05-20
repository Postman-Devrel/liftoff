import { ValidatorFn } from "@/types/validation";
import { getCollection, getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";
import { resolveBankingCollection } from "./resolve-collection";

type CollectionItem = {
  name?: string;
  request?: { url?: { raw?: string } | string };
  item?: CollectionItem[];
};

function countUrlUsage(items: CollectionItem[]): { total: number; usingVariable: number } {
  let total = 0;
  let usingVariable = 0;
  for (const item of items) {
    if (item.request) {
      total++;
      const raw = typeof item.request.url === "string"
        ? item.request.url
        : item.request.url?.raw || "";
      if (raw.includes("{{baseUrl}}")) usingVariable++;
    }
    if (item.item) {
      const sub = countUrlUsage(item.item);
      total += sub.total;
      usingVariable += sub.usingVariable;
    }
  }
  return { total, usingVariable };
}

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

  if (effectiveValue !== "https://template.postman-echo.com") {
    return {
      success: false,
      message: `Variable "baseUrl" found but its value is "${effectiveValue}". Expected "https://template.postman-echo.com".`,
      pointsAwarded: 0,
    };
  }

  let collectionUid = context.bankingCollectionUid;
  if (!collectionUid) {
    const collections = (workspace.collections as { name: string; uid: string }[]) || [];
    const resolved = await resolveBankingCollection(apiKey, collections);
    if (resolved) collectionUid = resolved.uid;
  }

  if (collectionUid) {
    const collectionDetail = await getCollection(apiKey, collectionUid);
    const items: CollectionItem[] = collectionDetail.item || [];
    const { total, usingVariable } = countUrlUsage(items);

    if (total > 0 && usingVariable === 0) {
      return {
        success: false,
        message: 'Variable "baseUrl" is set correctly, but no requests in the collection use {{baseUrl}} in their URL. Use Agent Mode to update all request URLs.',
        pointsAwarded: 0,
      };
    }

    if (total > 0 && usingVariable < total) {
      return {
        success: false,
        message: `Variable "baseUrl" is set, but only ${usingVariable} of ${total} requests use {{baseUrl}}. Update all request URLs to use the variable.`,
        pointsAwarded: 0,
      };
    }
  }

  return {
    success: true,
    message: 'Variable "baseUrl" is correctly set and all requests use {{baseUrl}}!',
    pointsAwarded: 10,
    context: { ...context, environmentId: bankingEnv.uid },
  };
};
