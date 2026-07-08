import { ValidatorFn } from "@/types/validation";

export const validatePostmanMcpExecuteEndpoint: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: You executed the animated movies GET request through MCP and saw a successful response.",
    pointsAwarded: 10,
    context,
  };
};
