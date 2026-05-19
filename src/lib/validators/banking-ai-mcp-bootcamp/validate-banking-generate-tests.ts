import { ValidatorFn } from "@/types/validation";
import { getCollection } from "@/lib/postman-api";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateBankingGenerateTests: ValidatorFn = async (apiKey, context) => {
  const ws = await resolveWorkspace(apiKey, context, context.bankingWorkspaceId, /intergalactic\s+banking/i, "Intergalactic Banking");
  if ("error" in ws) return ws.error;
  const workspace = ws.detail as Record<string, unknown>;
  const collections = (workspace.collections as { name: string; uid: string }[]) || [];

  const bankingCollection = collections.find(
    (c: { name: string }) => /intergalactic\s+bank\s+api/i.test(c.name)
  );

  if (!bankingCollection) {
    return {
      success: false,
      message: "Banking API collection not found. Complete the earlier steps first.",
      pointsAwarded: 0,
    };
  }

  const collectionDetail = await getCollection(apiKey, bankingCollection.uid);
  const items = collectionDetail.item || [];

  let totalRequests = 0;
  let requestsWithTests = 0;

  type CollectionItem = {
    request?: unknown;
    event?: { listen: string; script?: { exec?: string[] } }[];
    item?: CollectionItem[];
  };

  function countTests(itemList: CollectionItem[]) {
    for (const item of itemList) {
      if (item.request) {
        totalRequests++;
        if (item.event) {
          const testEvent = item.event.find((e) => e.listen === "test");
          if (testEvent?.script?.exec && testEvent.script.exec.length > 0) {
            const scriptContent = testEvent.script.exec.join("\n");
            if (/status/i.test(scriptContent) || /pm\.test/i.test(scriptContent)) {
              requestsWithTests++;
            }
          }
        }
      }
      if (item.item) {
        countTests(item.item);
      }
    }
  }

  countTests(items);

  if (requestsWithTests === 0) {
    return {
      success: false,
      message:
        'No test scripts found in the collection. Use Agent Mode with the prompt: "Write tests for all the requests in this collection. Include only status code tests and response time tests."',
      pointsAwarded: 0,
    };
  }

  if (totalRequests > 0 && requestsWithTests < totalRequests) {
    return {
      success: false,
      message: `Only ${requestsWithTests} of ${totalRequests} requests have test scripts. Use Agent Mode to write tests for all requests in the collection.`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `All ${requestsWithTests} requests have test scripts — nice work!`,
    pointsAwarded: 10,
    context,
  };
};
