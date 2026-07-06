import { ValidatorFn } from "@/types/validation";
import { getWorkspace, getCollection } from "@/lib/postman-api";

type WorkspaceCollection = {
  id: string;
  name: string;
  uid: string;
};

type CollectionResponse = {
  name?: string;
  body?: string;
};

type CollectionItem = {
  name?: string;
  item?: CollectionItem[];
  request?: unknown;
  response?: CollectionResponse[];
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

export const validateAiEngineerDownstreamRenameSchemaField: ValidatorFn = async (
  apiKey,
  context
) => {
  const workspaceId = context.workspaceId || context.aiEngineerWorkspaceId;
  if (!workspaceId) {
    return {
      success: false,
      message:
        "Please complete Part 1, Step 1 first (create the workspace).",
      pointsAwarded: 0,
    };
  }

  const workspace = await getWorkspace(apiKey, workspaceId);
  const collections =
    (workspace.collections as WorkspaceCollection[]) || [];
  const erpCollection = collections.find(
    (c) => c.name.trim().toLowerCase() === "enterprise resource planning"
  );

  if (!erpCollection) {
    return {
      success: false,
      message:
        'No "Enterprise Resource Planning" collection found in your workspace. Complete Part 1, Step 1 first.',
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
        'The "Enterprise Resource Planning" collection is missing a "Create Employee" request.',
      pointsAwarded: 0,
    };
  }

  const responses = createEmployee.response || [];
  if (responses.length === 0) {
    return {
      success: false,
      message:
        'The "Create Employee" request has no saved responses yet. In Postman, send the request and save the response as an example, then re-validate.',
      pointsAwarded: 0,
    };
  }

  const hasEmployeeIdResponse = responses.some((r) => {
    const body = typeof r.body === "string" ? r.body : JSON.stringify(r.body ?? "");
    return body.includes('"employee-id"');
  });

  if (!hasEmployeeIdResponse) {
    return {
      success: false,
      message:
        'None of the saved responses on "Create Employee" contain the `employee-id` field. Ask Agent Mode to rename `id` to `employee-id` on the Create Employee response schema, then save an updated example.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      'Verified — a saved "Create Employee" response contains the `employee-id` field.',
    pointsAwarded: 10,
    context: {
      ...context,
      workspaceId,
      aiEngineerWorkspaceId: workspaceId,
    },
  };
};
