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

export const validateAiEngineerDownstreamForkRepoCreateWorkspace: ValidatorFn =
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
          'No workspace found matching "Enterprise Resource Planning - [your name]". Fork the ERP repo and create a Postman workspace whose name starts with "Enterprise Resource Planning - " followed by your name.',
        pointsAwarded: 0,
      };
    }

    let ownedWorkspace: { id: string; name: string; detail: Record<string, unknown> } | undefined;
    for (const ws of candidates) {
      const detail = await getWorkspace(apiKey, ws.id);
      if (context.userId && detail.createdBy === context.userId) {
        ownedWorkspace = { id: ws.id, name: ws.name, detail };
        break;
      }
    }

    if (!ownedWorkspace) {
      return {
        success: false,
        message:
          'Found "Enterprise Resource Planning" workspace(s), but none were created by you. Create your own workspace named "Enterprise Resource Planning - [your name]" from your fork of the ERP repo.',
        pointsAwarded: 0,
      };
    }

    const collections =
      (ownedWorkspace.detail.collections as WorkspaceCollection[]) || [];
    const erpCollection = collections.find(
      (c) => c.name.trim().toLowerCase() === "enterprise resource planning"
    );

    if (!erpCollection) {
      const names = collections.map((c) => c.name).join(", ");
      return {
        success: false,
        message: names
          ? `Workspace "${ownedWorkspace.name}" found, but it does not contain an "Enterprise Resource Planning" collection (found: ${names}). Import the ERP repo so the collection is created in the workspace.`
          : `Workspace "${ownedWorkspace.name}" found, but no collections are present. Import the ERP repo so the "Enterprise Resource Planning" collection is created.`,
        pointsAwarded: 0,
      };
    }

    const collectionDetail = await getCollection(apiKey, erpCollection.uid);
    const items = (collectionDetail?.item as CollectionItem[]) || [];
    const createEmployee = findRequestByName(items, "Create Employee");

    if (!createEmployee) {
      return {
        success: false,
        message:
          'The "Enterprise Resource Planning" collection was found, but it does not contain a "Create Employee" request. Re-import the ERP repo so the collection includes the Create Employee request.',
        pointsAwarded: 0,
      };
    }

    return {
      success: true,
      message: `Workspace "${ownedWorkspace.name}" verified — "Enterprise Resource Planning" collection with a "Create Employee" request is present.`,
      pointsAwarded: 10,
      context: {
        ...context,
        workspaceId: ownedWorkspace.id,
        aiEngineerWorkspaceId: ownedWorkspace.id,
      },
    };
  };
