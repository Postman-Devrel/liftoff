import { ValidatorFn } from "@/types/validation";
import { getWorkspace, getCollection } from "@/lib/postman-api";

type WorkspaceCollection = {
  id: string;
  name: string;
  uid: string;
};

type CollectionItem = {
  name?: string;
  item?: CollectionItem[];
  request?: {
    url?: unknown;
    body?: unknown;
  };
  event?: Array<{
    listen?: string;
    script?: { exec?: string[] | string };
  }>;
};

function flattenRequests(items: CollectionItem[] | undefined): CollectionItem[] {
  if (!items) return [];
  const out: CollectionItem[] = [];
  for (const item of items) {
    if (item.request) {
      out.push(item);
    }
    if (item.item) {
      out.push(...flattenRequests(item.item));
    }
  }
  return out;
}

function stringifyRequest(item: CollectionItem): string {
  const parts: string[] = [];
  if (item.request?.url !== undefined) {
    parts.push(JSON.stringify(item.request.url));
  }
  if (item.request?.body !== undefined) {
    parts.push(JSON.stringify(item.request.body));
  }
  for (const ev of item.event || []) {
    const exec = ev.script?.exec;
    if (Array.isArray(exec)) {
      parts.push(exec.join("\n"));
    } else if (typeof exec === "string") {
      parts.push(exec);
    }
  }
  return parts.join("\n");
}

export const validateAiEngineerDownstreamConsumersUseEmployeeId: ValidatorFn =
  async (apiKey, context) => {
    const workspaceId = context.workspaceId || context.aiEngineerWorkspaceId;
    if (!workspaceId) {
      return {
        success: false,
        message:
          "Please complete Part 1 first (create the workspace and push it to the cloud).",
        pointsAwarded: 0,
      };
    }

    const workspace = await getWorkspace(apiKey, workspaceId);
    const collections =
      (workspace.collections as WorkspaceCollection[]) || [];
    const erpCollection = collections.find(
      (c) => c.name.trim().toLowerCase() === "enterprise resource planning api"
    );

    if (!erpCollection) {
      return {
        success: false,
        message:
          'No "Enterprise Resource Planning API" collection found in your workspace. Complete Part 1 first.',
        pointsAwarded: 0,
      };
    }

    const collectionDetail = await getCollection(apiKey, erpCollection.uid);
    const requests = flattenRequests(
      (collectionDetail?.item as CollectionItem[]) || []
    );

    if (requests.length === 0) {
      return {
        success: false,
        message:
          'The "Enterprise Resource Planning API" collection has no requests to inspect.',
        pointsAwarded: 0,
      };
    }

    let employeeIdReferences = 0;
    let legacyIdReferences = 0;

    for (const req of requests) {
      const blob = stringifyRequest(req);
      if (blob.includes("employee-id")) {
        employeeIdReferences++;
      }
      // Legacy `id` — only flag if it's clearly a JSON key: `"id"`
      if (/"id"\s*:/.test(blob)) {
        legacyIdReferences++;
      }
    }

    if (employeeIdReferences === 0) {
      return {
        success: false,
        message:
          'No requests in the "Enterprise Resource Planning API" collection reference `employee-id`. Pull the merged downstream updates and re-validate.',
        pointsAwarded: 0,
      };
    }

    const legacyNote =
      legacyIdReferences > 0
        ? ` Heads up: ${legacyIdReferences} request(s) still contain a legacy \`"id"\` JSON key — consider a follow-up pass.`
        : "";

    return {
      success: true,
      message: `Verified — ${employeeIdReferences} request(s) in the "Enterprise Resource Planning API" collection reference \`employee-id\`.${legacyNote}`,
      pointsAwarded: 10,
      context,
    };
  };
