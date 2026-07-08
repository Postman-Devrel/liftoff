import { ValidatorFn } from "@/types/validation";
import { listWorkspaces, getWorkspace, getCollection } from "@/lib/postman-api";

type WorkspaceCollection = {
  id: string;
  name: string;
  uid: string;
};

type CollectionItem = {
  name?: string;
  item?: CollectionItem[];
  request?: unknown;
};

function findRequestByName(
  items: CollectionItem[] | undefined,
  target: string
): CollectionItem | undefined {
  if (!items) return undefined;
  const lower = target.toLowerCase();
  for (const item of items) {
    if (
      item.request &&
      typeof item.name === "string" &&
      item.name.trim().toLowerCase() === lower
    ) {
      return item;
    }
    if (item.item) {
      const found = findRequestByName(item.item, target);
      if (found) return found;
    }
  }
  return undefined;
}

export const validateAiEngineerDownstreamCreateWorkspaceAndPushToCloud: ValidatorFn =
  async (apiKey, context) => {
    const workspaces = await listWorkspaces(apiKey);

    const candidates = workspaces.filter((ws) => {
      const match = ws.name.match(
        /^Enterprise Resource Planning\s*-\s*(.+)$/i
      );
      return match && match[1].trim().length > 0;
    });

    if (candidates.length === 0) {
      return {
        success: false,
        message:
          'No workspace found matching "Enterprise Resource Planning - [your name]". Create a Postman workspace from your local clone whose name starts with "Enterprise Resource Planning - " followed by your name, then push it to the cloud.',
        pointsAwarded: 0,
      };
    }

    const ownedWorkspaces: { id: string; name: string; detail: Record<string, unknown> }[] = [];
    for (const ws of candidates) {
      const detail = await getWorkspace(apiKey, ws.id);
      if (context.userId && detail.createdBy === context.userId) {
        ownedWorkspaces.push({ id: ws.id, name: ws.name, detail });
      }
    }

    if (ownedWorkspaces.length === 0) {
      return {
        success: false,
        message:
          'Found "Enterprise Resource Planning" workspace(s), but none were created by you. Create your own workspace named "Enterprise Resource Planning - [your name]" from your local clone of the ERP repo, then push it to the cloud.',
        pointsAwarded: 0,
      };
    }

    // A learner may have more than one matching workspace (e.g. an old/duplicate one).
    // Check every owned candidate for the actual pushed collection instead of
    // assuming the first one returned by the API is the right one.
    let attemptedNames: string[] = [];
    for (const ws of ownedWorkspaces) {
      const collections = (ws.detail.collections as WorkspaceCollection[]) || [];
      const erpCollection = collections.find(
        (c) => c.name.trim().toLowerCase() === "enterprise resource planning api"
      );
      if (!erpCollection) {
        attemptedNames.push(ws.name);
        continue;
      }

      const collectionDetail = await getCollection(apiKey, erpCollection.uid);
      const items = (collectionDetail?.item as CollectionItem[]) || [];
      const createEmployee = findRequestByName(items, "Create Employee");
      if (!createEmployee) {
        attemptedNames.push(ws.name);
        continue;
      }

      return {
        success: true,
        message: `Workspace "${ws.name}" verified — "Enterprise Resource Planning API" collection with a "Create Employee" request is present.`,
        pointsAwarded: 10,
        context: {
          ...context,
          workspaceId: ws.id,
          aiEngineerWorkspaceId: ws.id,
        },
      };
    }

    return {
      success: false,
      message: `Found workspace(s) ${attemptedNames.map((n) => `"${n}"`).join(", ")} matching "Enterprise Resource Planning - [your name]", but none of them contain an "Enterprise Resource Planning API" collection with a "Create Employee" request yet. Push the workspace to the cloud so the collection syncs.`,
      pointsAwarded: 0,
    };
  };
