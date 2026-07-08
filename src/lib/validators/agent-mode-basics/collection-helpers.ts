import { getCollection } from "@/lib/postman-api";
import { ValidationContext } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const AGENT_MODE_BASICS_WORKSPACE_PATTERN = /^.+\s+-\s+ai\s+basics\s*$/i;
export const AGENT_MODE_BASICS_WORKSPACE_FRIENDLY = "[Your name] - AI Basics";

export type CollectionItem = {
  name?: string;
  description?: string;
  request?: { method?: string; description?: string };
  event?: { listen: string; script?: { exec?: string[] } }[];
  item?: CollectionItem[];
};

export type AgentModeBasicsCollection = {
  uid: string;
  workspaceId: string;
  detail: Record<string, unknown>;
  items: CollectionItem[];
};

type ResolveError = {
  error: { success: false; message: string; pointsAwarded: 0 };
};

export async function resolveAgentModeBasicsWorkspace(
  apiKey: string,
  context: ValidationContext
): Promise<{ id: string; detail: Record<string, unknown> } | ResolveError> {
  return resolveWorkspace(
    apiKey,
    context,
    context.agentModeBasicsWorkspaceId,
    AGENT_MODE_BASICS_WORKSPACE_PATTERN,
    AGENT_MODE_BASICS_WORKSPACE_FRIENDLY
  );
}

export async function resolveAgentModeBasicsCollection(
  apiKey: string,
  context: ValidationContext
): Promise<AgentModeBasicsCollection | ResolveError> {
  if (context.agentModeBasicsCollectionUid) {
    const detail = await getCollection(apiKey, context.agentModeBasicsCollectionUid);
    return {
      uid: context.agentModeBasicsCollectionUid,
      workspaceId: context.agentModeBasicsWorkspaceId || "",
      detail,
      items: (detail.item as CollectionItem[]) || [],
    };
  }

  const ws = await resolveAgentModeBasicsWorkspace(apiKey, context);
  if ("error" in ws) return ws;

  const collections =
    (ws.detail.collections as { name: string; uid: string }[]) || [];
  const match = collections.find((c) => /movie/i.test(c.name || ""));

  if (!match) {
    return {
      error: {
        success: false,
        message:
          'No collection with "Movies" in its name found in your AI Basics workspace. Complete the previous step first.',
        pointsAwarded: 0,
      },
    };
  }

  const detail = await getCollection(apiKey, match.uid);
  return {
    uid: match.uid,
    workspaceId: ws.id,
    detail,
    items: (detail.item as CollectionItem[]) || [],
  };
}

export function findAnyRequest(items: CollectionItem[]): CollectionItem | null {
  for (const item of items) {
    if (item.request) return item;
    if (item.item) {
      const found = findAnyRequest(item.item);
      if (found) return found;
    }
  }
  return null;
}

export function anyRequestHasTestScript(items: CollectionItem[]): boolean {
  for (const item of items) {
    if (item.request) {
      const ev = item.event?.find((e) => e.listen === "test");
      const script = ev?.script?.exec?.join("\n") || "";
      if (script.trim().length > 0) return true;
    }
    if (item.item && anyRequestHasTestScript(item.item)) return true;
  }
  return false;
}

export function anyRequestHasDescription(items: CollectionItem[]): boolean {
  for (const item of items) {
    if (item.request) {
      const description = item.request.description || item.description || "";
      if (description.trim().length > 0) return true;
    }
    if (item.item && anyRequestHasDescription(item.item)) return true;
  }
  return false;
}
