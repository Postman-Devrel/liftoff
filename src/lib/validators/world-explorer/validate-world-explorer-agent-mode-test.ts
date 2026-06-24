import { ValidatorFn } from "@/types/validation";
import {
  findGetCountryRequest,
  getEventScript,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

export const validateWorldExplorerAgentModeTest: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveWorldExplorerCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  const req = findGetCountryRequest(resolved.items);
  if (!req) {
    return {
      success: false,
      message:
        'No request named "Get Country" found. Complete the earlier steps first.',
      pointsAwarded: 0,
    };
  }

  const script = getEventScript(req, "test");
  if (!script) {
    return {
      success: false,
      message:
        'No post-response script found on the "Get Country" request. Open **Scripts → Post-response**, add a `pm.test(...)` block, and save.',
      pointsAwarded: 0,
    };
  }

  if (!/pm\.test\s*\(/.test(script)) {
    return {
      success: false,
      message:
        'A post-response script exists but it does not call `pm.test(...)`. Add a `pm.test(...)` assertion and save the request.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: "Post-response test found — Agent Mode came through!",
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
