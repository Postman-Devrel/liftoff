import { ValidatorFn } from "@/types/validation";
import { resolveAgentModeBasicsCollection } from "./collection-helpers";

export const validateAgentModeBasicsCreateCollection: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveAgentModeBasicsCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  if (resolved.items.length === 0) {
    return {
      success: false,
      message:
        'Your "Movies API" collection exists but has no requests yet. Ask Agent Mode to add requests for the Movies API endpoints.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Collection "Movies API" found with ${resolved.items.length} request(s)!`,
    pointsAwarded: 10,
    context: {
      ...context,
      workspaceId: resolved.workspaceId,
      agentModeBasicsWorkspaceId: resolved.workspaceId,
      agentModeBasicsCollectionUid: resolved.uid,
    },
  };
};
