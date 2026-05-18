import { ValidatorFn } from "@/types/validation";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveArtemisEnvironment } from "./resolve-environment";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateLogDeleted: ValidatorFn = async (apiKey, context) => {
  const envResult = await resolveArtemisEnvironment(apiKey, context);
  if ("success" in envResult) return envResult;

  const apiKeyValue = resolveEnvVar(envResult.values, "apiKey");
  if (typeof apiKeyValue !== "string") return apiKeyValue;

  try {
    const res = await fetch(`${ARTEMIS_API}/logs`, {
      headers: { "x-api-key": apiKeyValue },
    });
    if (!res.ok) {
      return {
        success: false,
        message: `GET /logs returned ${res.status}.`,
        pointsAwarded: 0,
      };
    }

    const data = await res.json();
    const logCount = data.count ?? (data.logs || []).length;

    if (logCount < 3) {
      return {
        success: true,
        message: `Log deleted! You now have ${logCount} log(s). Remember: anomaly logs can't be deleted.`,
        pointsAwarded: 10,
        context,
      };
    }

    return {
      success: false,
      message: `You still have ${logCount} logs. Use DELETE /logs/:id to remove a non-anomaly log.`,
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
