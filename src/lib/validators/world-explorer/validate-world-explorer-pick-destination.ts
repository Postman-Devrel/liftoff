import { ValidatorFn } from "@/types/validation";
import {
  findGetCountryRequest,
  getRequestUrlQuery,
  getRequestUrlRaw,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

export const validateWorldExplorerPickDestination: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveWorldExplorerCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  const req = findGetCountryRequest(resolved.items);
  if (!req?.request) {
    return {
      success: false,
      message:
        'No request named "Get Country" found in the World Explorer collection. Complete Step 2 first.',
      pointsAwarded: 0,
    };
  }

  const query = getRequestUrlQuery(req.request);
  const rawUrl = getRequestUrlRaw(req.request);
  const nameQuery = query.find(
    (q) => (q.key || "").toLowerCase() === "name" && !q.disabled
  );

  const value =
    typeof nameQuery?.value === "string" ? nameQuery.value.trim() : "";

  if (!nameQuery) {
    if (/[?&]name=[^&]+/i.test(rawUrl)) {
      return {
        success: true,
        message: "Found a `name` query parameter in the request URL — nice work!",
        pointsAwarded: 10,
        context: {
          ...context,
          worldExplorerWorkspaceId: resolved.workspaceId,
          worldExplorerCollectionUid: resolved.uid,
        },
      };
    }
    return {
      success: false,
      message:
        'The "Get Country" request has no `name` query parameter. Add a query parameter with key `name` and your country as the value, then save the request.',
      pointsAwarded: 0,
    };
  }

  if (!value) {
    return {
      success: false,
      message:
        'Your `name` query parameter is empty. Set it to your country (e.g. `Bangladesh`) and save the request.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Query parameter \`name=${value}\` looks good!`,
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
