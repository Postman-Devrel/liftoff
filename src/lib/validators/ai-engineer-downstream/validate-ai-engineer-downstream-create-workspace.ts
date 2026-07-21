import { ValidatorFn } from "@/types/validation";

export const validateAiEngineerDownstreamCreateWorkspace: ValidatorFn = async (
  _apiKey,
  context
) => {
  return {
    success: true,
    message:
      "Self-verified: You confirmed a new Postman workspace is created and open.",
    pointsAwarded: 10,
    context,
  };
};
