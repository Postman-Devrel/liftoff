import { ValidatorFn } from "@/types/validation";
import {
  findGetCountryRequest,
  getEventScript,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

export const validateWorldExplorerVisualization: ValidatorFn = async (
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
        'No post-response script found on the "Get Country" request. Add the visualization snippet to **Scripts → Post-response** and save.',
      pointsAwarded: 0,
    };
  }

  if (!/pm\.visualizer\.set\s*\(/.test(script)) {
    return {
      success: false,
      message:
        'Your post-response script does not call `pm.visualizer.set(...)`. Ask Agent Mode for the visualizer snippet (or paste the one in the instructions), then save.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: "Visualization script in place — open the Visualize tab to see it!",
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
