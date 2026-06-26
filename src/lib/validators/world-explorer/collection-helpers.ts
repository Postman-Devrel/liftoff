import { getCollection } from "@/lib/postman-api";
import { ValidationContext } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const WORLD_EXPLORER_WORKSPACE_PATTERN = /^.+\s+-\s+world\s+explorer\s*$/i;
export const WORLD_EXPLORER_WORKSPACE_FRIENDLY = "[Your name] - World Explorer";
const COLLECTION_NAME = "country dossier";

export type CollectionItem = {
  name?: string;
  request?: {
    method?: string;
    url?:
      | string
      | {
          raw?: string;
          query?: { key?: string; value?: string; disabled?: boolean }[];
        };
  };
  event?: { listen: string; script?: { exec?: string[] } }[];
  item?: CollectionItem[];
};

export type CollectionVariable = {
  key?: string;
  value?: unknown;
  type?: string;
};

export type WorldExplorerCollection = {
  uid: string;
  workspaceId: string;
  detail: Record<string, unknown>;
  items: CollectionItem[];
  variables: CollectionVariable[];
};

type ResolveError = {
  error: { success: false; message: string; pointsAwarded: 0 };
};

export async function resolveWorldExplorerWorkspace(
  apiKey: string,
  context: ValidationContext
): Promise<{ id: string; detail: Record<string, unknown> } | ResolveError> {
  return resolveWorkspace(
    apiKey,
    context,
    context.worldExplorerWorkspaceId,
    WORLD_EXPLORER_WORKSPACE_PATTERN,
    WORLD_EXPLORER_WORKSPACE_FRIENDLY
  );
}

export async function resolveWorldExplorerCollection(
  apiKey: string,
  context: ValidationContext
): Promise<WorldExplorerCollection | ResolveError> {
  if (context.worldExplorerCollectionUid) {
    const detail = await getCollection(
      apiKey,
      context.worldExplorerCollectionUid
    );
    return {
      uid: context.worldExplorerCollectionUid,
      workspaceId: context.worldExplorerWorkspaceId || "",
      detail,
      items: (detail.item as CollectionItem[]) || [],
      variables: (detail.variable as CollectionVariable[]) || [],
    };
  }

  const ws = await resolveWorldExplorerWorkspace(apiKey, context);
  if ("error" in ws) return ws;

  const collections =
    (ws.detail.collections as { name: string; uid: string }[]) || [];
  const match = collections.find(
    (c) => (c.name || "").trim().toLowerCase() === COLLECTION_NAME
  );

  if (!match) {
    return {
      error: {
        success: false,
        message:
          'No collection named "Country Dossier" found in your World Explorer workspace. Create a collection with that exact name.',
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
    variables: (detail.variable as CollectionVariable[]) || [],
  };
}


export function getRequestUrlRaw(
  request: CollectionItem["request"]
): string {
  if (!request?.url) return "";
  if (typeof request.url === "string") return request.url;
  return request.url.raw || "";
}

export function getRequestUrlQuery(
  request: CollectionItem["request"]
): { key?: string; value?: string; disabled?: boolean }[] {
  if (!request?.url || typeof request.url === "string") return [];
  return request.url.query || [];
}

export function findGetCountryRequest(
  items: CollectionItem[]
): CollectionItem | null {
  for (const item of items) {
    if (item.request && (item.name || "").trim().toLowerCase() === "get country") {
      return item;
    }
    if (item.item) {
      const found = findGetCountryRequest(item.item);
      if (found) return found;
    }
  }
  return null;
}

export function findAnyCountriesGet(
  items: CollectionItem[]
): CollectionItem | null {
  for (const item of items) {
    if (item.request) {
      const method = (item.request.method || "GET").toUpperCase();
      const url = getRequestUrlRaw(item.request);
      if (method === "GET" && /\/countries\b/i.test(url)) return item;
    }
    if (item.item) {
      const found = findAnyCountriesGet(item.item);
      if (found) return found;
    }
  }
  return null;
}

export function getEventScript(
  item: CollectionItem,
  listen: "test" | "prerequest"
): string {
  const ev = item.event?.find((e) => e.listen === listen);
  if (!ev?.script?.exec) return "";
  return ev.script.exec.join("\n");
}
