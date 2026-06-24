import { ValidatorFn } from "@/types/validation";
import {
  findGetCountryRequest,
  getEventScript,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

export const validateWorldExplorerSurpriseDestination: ValidatorFn = async (
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

  const script = getEventScript(req, "prerequest");
  if (!script) {
    return {
      success: false,
      message:
        'No pre-request script found on the "Get Country" request. Open **Scripts → Pre-request**, paste the surprise-destination snippet, and save.',
      pointsAwarded: 0,
    };
  }

  if (
    !/pm\.collectionVariables\.set\s*\(\s*["'`]country["'`]\s*,/.test(script)
  ) {
    return {
      success: false,
      message:
        'A pre-request script exists but it does not call `pm.collectionVariables.set("country", ...)`. Make sure the snippet writes to the `country` variable, then save.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: "Surprise destination set — every Send is a new adventure!",
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
