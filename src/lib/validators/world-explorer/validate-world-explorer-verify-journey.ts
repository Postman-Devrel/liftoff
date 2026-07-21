import { ValidatorFn } from "@/types/validation";
import {
  findGetCountryRequest,
  getEventScript,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

const COUNTRIES_URL = "https://liftoff-101.mock.postman.postman.dev/countries";

export const validateWorldExplorerVerifyJourney: ValidatorFn = async (
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
  if (!/pm\.test\s*\(/.test(script)) {
    return {
      success: false,
      message:
        'Your "Get Country" request still has no `pm.test(...)` assertion. Complete Step 5 first.',
      pointsAwarded: 0,
    };
  }

  try {
    const res = await fetch(COUNTRIES_URL);
    if (!res.ok) {
      return {
        success: false,
        message: `The LiftOff Countries API returned ${res.status}. Try sending your request again — it should return 200 OK.`,
        pointsAwarded: 0,
      };
    }
    const body = await res.json();
    if (!Array.isArray(body) || body.length === 0) {
      return {
        success: false,
        message:
          "The Countries API responded but did not return a non-empty array. Try again in a moment.",
        pointsAwarded: 0,
      };
    }
  } catch {
    return {
      success: false,
      message:
        "Could not reach the LiftOff Countries API. Check your network and try sending the request in Postman.",
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: "Journey verified — tests in place and the Countries API is healthy!",
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
