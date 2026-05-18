import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateMissionResponse: ValidatorFn = async (
  apiKey,
  context
) => {
  if (!context.environmentId) {
    return {
      success: false,
      message: "Please complete the environment steps first.",
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, context.environmentId);
  const values = envDetail.values || [];

  const apiKeyValue = resolveEnvVar(
    values,
    "apiKey",
    "No `apiKey` found in your environment. Complete registration first."
  );
  if (typeof apiKeyValue !== "string") return apiKeyValue;

  try {
    const res = await fetch(`${ARTEMIS_API}/mission`, {
      headers: { "x-api-key": apiKeyValue },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `GET /mission returned ${res.status}. Make sure your API key is valid.`,
        pointsAwarded: 0,
      };
    }

    const data = await res.json();
    if (data.callsign) {
      return {
        success: true,
        message: `Mission data retrieved! Callsign: ${data.callsign}. Now build your visualization in Agent Mode.`,
        pointsAwarded: 10,
        context,
      };
    }

    return {
      success: true,
      message: "GET /mission returned successfully!",
      pointsAwarded: 10,
      context,
    };
  } catch {
    return {
      success: false,
      message: "Could not reach the Artemis API.",
      pointsAwarded: 0,
    };
  }
};
