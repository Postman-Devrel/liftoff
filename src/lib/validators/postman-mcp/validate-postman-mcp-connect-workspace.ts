import { ValidatorFn } from "@/types/validation";

export const validatePostmanMcpConnectWorkspace: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: Your assistant found your AI Basics workspace via MCP.",
    pointsAwarded: 10,
    context,
  };
};
