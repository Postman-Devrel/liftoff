import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateApiKeySaved: ValidatorFn = async (apiKey, context) => {
  if (!context.environmentId) {
    return {
      success: false,
      message: "Please complete the environment steps first (Lesson 1).",
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, context.environmentId);
  const values = envDetail.values || [];

  const apiKeyValue = resolveEnvVar(
    values,
    "apiKey",
    "No `apiKey` variable found in your environment. Register first, then add an `apiKey` variable with the returned key."
  );
  if (typeof apiKeyValue !== "string") return apiKeyValue;

  // Verify the key works by calling GET /mission
  try {
    const res = await fetch(`${ARTEMIS_API}/mission`, {
      headers: { "x-api-key": apiKeyValue },
    });
    if (res.ok) {
      return {
        success: true,
        message:
          "API key is saved and working — GET /mission returned 200 OK!",
        pointsAwarded: 10,
        context,
      };
    }
    return {
      success: false,
      message: `GET /mission returned ${res.status}. Check that your apiKey is correct and the environment is selected.`,
      pointsAwarded: 0,
    };
  } catch {
    return {
      success: false,
      message: "Could not reach the Artemis API to verify your key.",
      pointsAwarded: 0,
    };
  }
};
