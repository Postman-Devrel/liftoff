import { ValidatorFn } from "@/types/validation";

export const validateClaudeCodePluginRunSetup: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: You ran /postman:setup and saw your workspaces listed.",
    pointsAwarded: 10,
    context,
  };
};
