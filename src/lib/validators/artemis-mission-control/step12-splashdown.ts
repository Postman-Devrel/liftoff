import { ValidatorFn } from "@/types/validation";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveArtemisEnvironment } from "./resolve-environment";

const ARTEMIS_API = "https://artemis.up.railway.app";

export const validateSplashdown: ValidatorFn = async (apiKey, context) => {
  const envResult = await resolveArtemisEnvironment(apiKey, context);
  if ("success" in envResult) return envResult;

  const apiKeyValue = resolveEnvVar(envResult.values, "apiKey");
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
    const completion =
      data.mission_status?.completion_percentage ?? data.completion_percentage;

    if (completion === 100) {
      return {
        success: true,
        message:
          "Splashdown confirmed! Mission completion at 100%. Outstanding work, crew member!",
        pointsAwarded: 10,
        context,
      };
    }

    const steps = data.mission_status?.steps || [];
    const incomplete = steps.filter(
      (s: { completed: boolean }) => !s.completed
    );

    return {
      success: false,
      message: `Mission at ${completion ?? "?"}% complete. ${incomplete.length} step(s) remaining. Complete all mission steps and try again.`,
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
