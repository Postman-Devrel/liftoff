import { ValidatorFn } from "@/types/validation";

export const validateClaudeCodePluginSearchWorkspace: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: Claude Code found your Movies API collection through a search prompt.",
    pointsAwarded: 10,
    context,
  };
};
