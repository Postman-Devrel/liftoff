import { ValidatorFn } from "@/types/validation";
import {
  findGetCountryRequest,
  getRequestUrlQuery,
  getRequestUrlRaw,
  resolveWorldExplorerCollection,
} from "./collection-helpers";

export const validateWorldExplorerStoreVariable: ValidatorFn = async (
  apiKey,
  context
) => {
  const resolved = await resolveWorldExplorerCollection(apiKey, context);
  if ("error" in resolved) return resolved.error;

  const countryVar = resolved.variables.find(
    (v) => (v.key || "").toLowerCase() === "country"
  );

  if (!countryVar) {
    return {
      success: false,
      message:
        'No `country` collection variable found. Open the **Country Dossier** collection → **Variables** tab and add a variable named `country`.',
      pointsAwarded: 0,
    };
  }

  const value =
    typeof countryVar.value === "string" ? countryVar.value.trim() : "";

  if (!value) {
    return {
      success: false,
      message:
        'Your `country` collection variable exists but its **Shared Value** is empty. Enter your country in the **Shared Value** column (not just **Value**) — LiftOff can only read shared values.',
      pointsAwarded: 0,
    };
  }

  const req = findGetCountryRequest(resolved.items);
  if (!req?.request) {
    return {
      success: false,
      message:
        'No request named "Get Country" found. Complete the earlier steps first.',
      pointsAwarded: 0,
    };
  }

  const query = getRequestUrlQuery(req.request);
  const rawUrl = getRequestUrlRaw(req.request);
  const nameQuery = query.find(
    (q) => (q.key || "").toLowerCase() === "name" && !q.disabled
  );
  const nameValue =
    typeof nameQuery?.value === "string" ? nameQuery.value : "";

  const usesVariable =
    /\{\{\s*country\s*\}\}/i.test(nameValue) ||
    /[?&]name=\{\{\s*country\s*\}\}/i.test(rawUrl);

  if (!usesVariable) {
    return {
      success: false,
      message:
        'Your `name` query parameter is not using `{{country}}`. Change the value to `{{country}}` and save the request.',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Variable \`country\` is set to "${value}" and the request uses \`{{country}}\`. Off you go!`,
    pointsAwarded: 10,
    context: {
      ...context,
      worldExplorerWorkspaceId: resolved.workspaceId,
      worldExplorerCollectionUid: resolved.uid,
    },
  };
};
