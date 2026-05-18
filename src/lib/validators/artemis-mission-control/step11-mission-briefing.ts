import { ValidatorFn } from "@/types/validation";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveArtemisEnvironment } from "./resolve-environment";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateMissionBriefing: ValidatorFn = async (
  apiKey,
  context
) => {
  const envResult = await resolveArtemisEnvironment(apiKey, context);
  if ("success" in envResult) return envResult;

  const apiKeyValue = resolveEnvVar(envResult.values, "apiKey");
  if (typeof apiKeyValue !== "string") return apiKeyValue;

  try {
    const res = await fetch(`${ARTEMIS_API}/mission/brief`, {
      method: "POST",
      headers: {
        "x-api-key": apiKeyValue,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    if (!res.ok) {
      return {
        success: false,
        message: `POST /mission/brief returned ${res.status}.`,
        pointsAwarded: 0,
      };
    }

    const data = await res.json();

    if (data.briefing) {
      return {
        success: true,
        message: `Mission briefing received! ${data.briefing.total_logs} log(s) across ${Object.keys(data.briefing.categories || {}).length} category/ies.`,
        pointsAwarded: 10,
        context,
      };
    }

    return {
      success: false,
      message:
        'No briefing data returned. Send POST /mission/brief with body `{}`.',
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
