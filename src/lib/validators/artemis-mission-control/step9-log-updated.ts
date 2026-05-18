import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateLogUpdated: ValidatorFn = async (apiKey, context) => {
  if (!context.environmentId) {
    return {
      success: false,
      message: "Please complete the environment steps first.",
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, context.environmentId);
  const values = envDetail.values || [];

  const apiKeyValue = resolveEnvVar(values, "apiKey");
  if (typeof apiKeyValue !== "string") return apiKeyValue;

  try {
    const res = await fetch(`${ARTEMIS_API}/mission`, {
      headers: { "x-api-key": apiKeyValue },
    });
    if (!res.ok) {
      return {
        success: false,
        message: `GET /mission returned ${res.status}.`,
        pointsAwarded: 0,
      };
    }

    const data = await res.json();
    const steps = data.steps || data.mission_steps || [];
    const updateStep = steps.find(
      (s: { name: string; completed: boolean }) =>
        s.name?.toLowerCase().includes("update") && s.completed
    );

    if (updateStep) {
      return {
        success: true,
        message: "Log update detected! PATCH /logs/:id completed.",
        pointsAwarded: 10,
        context,
      };
    }

    return {
      success: false,
      message:
        "No log update detected yet. Use PATCH /logs/:id to update a log's title or description.",
      pointsAwarded: 0,
    };
  } catch {
    return {
      success: false,
      message: "Could not reach the Artemis API.",
      pointsAwarded: 0,
    };
  }
};
