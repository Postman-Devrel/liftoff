import { ValidatorFn } from "@/types/validation";
import { resolveWorldExplorerWorkspace } from "./collection-helpers";

export const validateWorldExplorerCreateWorkspace: ValidatorFn = async (
  apiKey,
  context
) => {
  const ws = await resolveWorldExplorerWorkspace(apiKey, context);
  if ("error" in ws) return ws.error;

  const name = (ws.detail.name as string) || "your World Explorer workspace";

  return {
    success: true,
    message: `Workspace "${name}" found and verified as yours!`,
    pointsAwarded: 10,
    context: {
      ...context,
      workspaceId: ws.id,
      worldExplorerWorkspaceId: ws.id,
    },
  };
};
