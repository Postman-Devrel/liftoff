import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";

export const validateEnvironmentValues: ValidatorFn = async (
  apiKey,
  context
) => {
  if (!context.environmentId) {
    return {
      success: false,
      message: "Please complete Step 3 first (create the environment).",
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, context.environmentId);
  const values = envDetail.values || [];

  const baseUrlValue = resolveEnvVar(values, "baseUrl");
  if (typeof baseUrlValue !== "string") return baseUrlValue;

  const issues: string[] = [];

  if (baseUrlValue !== "https://artemis.up.railway.app") {
    issues.push(
      `baseUrl is "${baseUrlValue}" — should be exactly "https://artemis.up.railway.app"`
    );
  }

  const apiKeyVar = values.find(
    (v: { key: string }) => v.key.toLowerCase() === "apikey"
  );

  if (!apiKeyVar) {
    issues.push("apiKey variable not found");
  } else if (apiKeyVar.type !== "secret") {
    issues.push(
      `apiKey type is "${apiKeyVar.type}" — should be marked as "secret" in Postman`
    );
  }

  if (issues.length > 0) {
    return {
      success: false,
      message: `Not quite right: ${issues.join("; ")}`,
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message:
      "Environment configured correctly! baseUrl is set to the Artemis API and apiKey is marked as secret.",
    pointsAwarded: 10,
    context,
  };
};
