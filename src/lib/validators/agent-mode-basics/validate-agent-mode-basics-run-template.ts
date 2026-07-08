import { ValidatorFn } from "@/types/validation";
import { anyRequestHasDescription, resolveAgentModeBasicsCollection } from "./collection-helpers";

export const validateAgentModeBasicsRunTemplate: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveAgentModeBasicsCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  if (!anyRequestHasDescription(resolved.items)) {
    return {
      success: false,
      message:
        'No request description found in your Movies API collection. Run the "Auto-generate documentation for endpoints" template against it, then save.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: "Found generated documentation on a request — the template came through!",
    pointsAwarded: 10,
    context: {
      ...context,
      agentModeBasicsWorkspaceId: resolved.workspaceId,
      agentModeBasicsCollectionUid: resolved.uid,
    },
  };
};
