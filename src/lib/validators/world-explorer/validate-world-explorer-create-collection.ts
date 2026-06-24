import { ValidatorFn } from "@/types/validation";
import { resolveWorldExplorerCollection } from "./collection-helpers";

export const validateWorldExplorerCreateCollection: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveWorldExplorerCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  return {
    success: true,
    message: 'Collection "Country Dossier" found in your World Explorer workspace!',
    pointsAwarded: 10,
    context: {
      ...context,
      workspaceId: resolved.workspaceId,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
