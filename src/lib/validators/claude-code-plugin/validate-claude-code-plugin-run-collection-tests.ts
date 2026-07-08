import { ValidatorFn } from "@/types/validation";

export const validateClaudeCodePluginRunCollectionTests: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: You ran your collection's tests through Claude Code and reviewed the results.",
    pointsAwarded: 10,
    context,
  };
};
