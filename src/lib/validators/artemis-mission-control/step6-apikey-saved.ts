import { ValidatorFn } from "@/types/validation";
import { resolveArtemisEnvironment } from "./resolve-environment";

export const validateApiKeySaved: ValidatorFn = async (apiKey, context) => {
  const envResult = await resolveArtemisEnvironment(apiKey, context);
  if ("success" in envResult) return envResult;

  const apiKeyVar = envResult.values.find(
    (v: { key: string }) => v.key.toLowerCase() === "apikey"
  );

  if (!apiKeyVar) {
    return {
      success: false,
      message:
        "No `apiKey` variable found in your environment. Register first, then add an `apiKey` variable with the returned key.",
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      "apiKey variable found in your environment! Use it to send GET /mission in the next step.",
    pointsAwarded: 10,
    context,
  };
};
