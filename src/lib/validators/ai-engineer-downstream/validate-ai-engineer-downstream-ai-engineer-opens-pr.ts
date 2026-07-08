import { ValidatorFn } from "@/types/validation";

export const validateAiEngineerDownstreamAiEngineerOpensPr: ValidatorFn = async (
  _apiKey,
  context
) => {
  return {
    success: true,
    message:
      "Self-verified: You confirmed the AI Engineer opened a PR updating the downstream consumers of `employee-id`.",
    pointsAwarded: 10,
    context,
  };
};
