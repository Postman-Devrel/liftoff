import { ValidatorFn } from "@/types/validation";
import { getCollection } from "@/lib/postman-api";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

type CollectionItem = {
  name?: string;
  request?: unknown;
  item?: CollectionItem[];
};

const EXPECTED_REQUESTS = [
  { label: "Mobile App Tests", pattern: /mobile\s+app\s+tests/i },
  { label: "Web Dashboard QA", pattern: /web\s+dashboard\s+qa/i },
  { label: "Partner Integration Suite", pattern: /partner\s+integration\s+suite/i },
];

function collectRequestNames(items: CollectionItem[]): string[] {
  const names: string[] = [];
  for (const item of items) {
    if (item.request && item.name) names.push(item.name);
    if (item.item) names.push(...collectRequestNames(item.item));
  }
  return names;
}

export const validateAiEngineerDownstreamAskAiEngineer: ValidatorFn = async (
  apiKey,
  context
) => {
  const ws = await resolveWorkspace(
    apiKey,
    context,
    context.aiEngineerWorkspaceId,
    /^Downstream\s+Demo\s*-\s*.+$/i,
    "Downstream Demo - [your name]"
  );
  if ("error" in ws) return ws.error;

  const workspace = ws.detail as Record<string, unknown>;
  const collections =
    (workspace.collections as { name: string; uid: string }[]) || [];

  const consumersCollection = collections.find(
    (c) => c.name.trim().toLowerCase() === "downstream consumers"
  );

  if (!consumersCollection) {
    const names = collections.map((c) => c.name).join(", ");
    return {
      success: false,
      message: names
        ? `Found collections (${names}) but none named "Downstream Consumers". Ask the AI Engineer to create the collection using the prompt in this step.`
        : 'No collections found in your workspace. Run the AI Engineer prompt from this step to create the "Downstream Consumers" collection.',
      pointsAwarded: 0,
    };
  }

  const detail = await getCollection(apiKey, consumersCollection.uid);
  const requestNames = collectRequestNames((detail.item || []) as CollectionItem[]);

  const missing = EXPECTED_REQUESTS.filter(
    (e) => !requestNames.some((n) => e.pattern.test(n))
  );

  if (missing.length > 0) {
    return {
      success: false,
      message: `Collection "Downstream Consumers" is missing the following consumer requests: ${missing
        .map((m) => `"${m.label}"`)
        .join(", ")}. Re-run the AI Engineer prompt — every consumer should get its own request.`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      'AI Engineer surfaced all three downstream consumers — "Mobile App Tests", "Web Dashboard QA", and "Partner Integration Suite" are present.',
    pointsAwarded: 10,
    context: {
      ...context,
      aiEngineerConsumersCollectionUid: consumersCollection.uid,
    },
  };
};
