import { ValidatorFn } from "@/types/validation";

export const validateAiEngineerDownstreamMergePr: ValidatorFn = async (
  _apiKey,
  context
) => {
  return {
    success: true,
    message:
      "Self-verified: You confirmed the AI Engineer's PR was merged into `main` on your ERP fork.",
    pointsAwarded: 10,
    context,
  };
};
