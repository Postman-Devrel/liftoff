import { ValidatorFn } from "@/types/validation";
import { anyRequestHasTestScript, resolveAgentModeBasicsCollection } from "./collection-helpers";

export const validateAgentModeBasicsAddTests: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveAgentModeBasicsCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  if (!anyRequestHasTestScript(resolved.items)) {
    return {
      success: false,
      message:
        'No post-response test script found on any request in your Movies API collection. Ask Agent Mode to add status-code tests, then save.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: "Found a post-response test script — Agent Mode came through!",
    pointsAwarded: 10,
    context: {
      ...context,
      agentModeBasicsWorkspaceId: resolved.workspaceId,
      agentModeBasicsCollectionUid: resolved.uid,
    },
  };
};
