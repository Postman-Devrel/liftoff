import { ValidatorFn } from "@/types/validation";
import {
  findGetCountryRequest,
  getEventScript,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

export const validateWorldExplorerStampPassport: ValidatorFn = async (
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
        'No post-response script found. Add the passport-stamping snippet to **Scripts → Post-response** and save.',
      pointsAwarded: 0,
    };
  }

  if (!/pm\.collectionVariables\.set\s*\(/.test(script)) {
    return {
      success: false,
      message:
        'Your post-response script does not call `pm.collectionVariables.set(...)`. Add the snippet from Step 6 and save.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: "Passport stamped — your script writes back to collection variables!",
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
