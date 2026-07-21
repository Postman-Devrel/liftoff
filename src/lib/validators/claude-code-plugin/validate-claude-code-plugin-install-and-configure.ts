import { ValidatorFn } from "@/types/validation";

export const validateClaudeCodePluginInstallAndConfigure: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: You installed the Postman plugin and started Claude Code with it loaded.",
    pointsAwarded: 10,
    context,
  };
};
