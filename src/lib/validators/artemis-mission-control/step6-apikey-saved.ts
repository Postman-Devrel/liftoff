import { ValidatorFn } from "@/types/validation";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveArtemisEnvironment } from "./resolve-environment";

export const validateApiKeySaved: ValidatorFn = async (apiKey, context) => {
  const envResult = await resolveArtemisEnvironment(apiKey, context);
  if ("success" in envResult) return envResult;

  const apiKeyValue = resolveEnvVar(
    envResult.values,
    "apiKey",
    "No `apiKey` variable found in your environment. Register first, then add an `apiKey` variable with the returned key."
  );
  if (typeof apiKeyValue !== "string") return apiKeyValue;

  return {
    success: true,
    message:
      "apiKey variable found in your environment! Use it to send GET /mission in the next step.",
    pointsAwarded: 10,
    context,
  };
};
