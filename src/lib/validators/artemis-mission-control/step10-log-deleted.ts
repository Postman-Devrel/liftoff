import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateLogDeleted: ValidatorFn = async (apiKey, context) => {
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
    const deleteStep = steps.find(
      (s: { name: string; completed: boolean }) =>
        s.name?.toLowerCase().includes("delete") && s.completed
    );

    if (deleteStep) {
      return {
        success: true,
        message: "Log deletion confirmed! Remember: anomaly logs can't be deleted.",
        pointsAwarded: 10,
        context,
      };
    }

    return {
      success: false,
      message:
        "No log deletion detected. Use DELETE /logs/:id (pick a non-anomaly log).",
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
