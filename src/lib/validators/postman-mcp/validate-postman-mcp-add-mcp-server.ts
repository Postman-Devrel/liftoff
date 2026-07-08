import { ValidatorFn } from "@/types/validation";

export const validatePostmanMcpAddMcpServer: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: You added the Postman MCP Server to your editor.",
    pointsAwarded: 10,
    context,
  };
};
