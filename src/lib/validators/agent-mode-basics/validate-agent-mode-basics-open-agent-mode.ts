import { ValidatorFn } from "@/types/validation";

export const validateAgentModeBasicsOpenAgentMode: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: You opened Agent Mode and tried the @ context picker.",
    pointsAwarded: 10,
    context,
  };
};
