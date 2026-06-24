import { ValidatorFn } from "@/types/validation";
import {
  findAnyCountriesGet,
  findGetCountryRequest,
  getRequestUrlRaw,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

export const validateWorldExplorerAddLookup: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveWorldExplorerCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  const named = findGetCountryRequest(resolved.items);
  if (!named) {
    const fallback = findAnyCountriesGet(resolved.items);
    if (fallback) {
      return {
        success: false,
        message: `Found a GET request to /countries, but it's named "${fallback.name || "(unnamed)"}". Rename it to **Get Country** and save the request.`,
        pointsAwarded: 0,
      };
    }
    return {
      success: false,
      message:
        'No request named "Get Country" found in the World Explorer collection. Add a GET request named **Get Country** that points at `https://liftoff-101.mock.postman.postman.dev/countries`.',
      pointsAwarded: 0,
    };
  }

  const method = (named.request?.method || "GET").toUpperCase();
  if (method !== "GET") {
    return {
      success: false,
      message: `The "Get Country" request uses ${method}. Change it to **GET** and save.`,
      pointsAwarded: 0,
    };
  }

  const url = getRequestUrlRaw(named.request);
  if (!/\/countries\b/i.test(url)) {
    return {
      success: false,
      message:
        'The "Get Country" request URL does not contain `/countries`. Set the URL to `https://liftoff-101.mock.postman.postman.dev/countries` and save.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: '"Get Country" request found and pointed at /countries!',
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
