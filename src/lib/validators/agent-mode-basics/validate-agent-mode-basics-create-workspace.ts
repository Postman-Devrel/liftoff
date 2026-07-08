import { ValidatorFn } from "@/types/validation";
import { resolveAgentModeBasicsWorkspace } from "./collection-helpers";

export const validateAgentModeBasicsCreateWorkspace: ValidatorFn = async (
  apiKey,
  context
) => {
  const ws = await resolveAgentModeBasicsWorkspace(apiKey, context);
  if ("error" in ws) return ws.error;

  const name = (ws.detail.name as string) || "your AI Basics workspace";

  return {
    success: true,
    message: `Workspace "${name}" found and verified as yours!`,
    pointsAwarded: 10,
    context: {
      ...context,
      workspaceId: ws.id,
      agentModeBasicsWorkspaceId: ws.id,
    },
  };
};
