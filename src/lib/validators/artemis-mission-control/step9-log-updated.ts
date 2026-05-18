import { ValidatorFn } from "@/types/validation";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveArtemisEnvironment } from "./resolve-environment";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateLogUpdated: ValidatorFn = async (apiKey, context) => {
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
    const logs: { id: number; created_at: string; updated_at: string }[] =
      data.logs || [];

    const updatedLog = logs.find((l) => l.updated_at !== l.created_at);

    if (updatedLog) {
      return {
        success: true,
        message: `Log #${updatedLog.id} has been updated! PATCH /logs/:id completed.`,
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
