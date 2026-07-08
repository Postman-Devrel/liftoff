import { ValidatorFn } from "@/types/validation";

export const validatePostmanMcpReadCollection: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: Your assistant listed the requests in your Movies API collection via MCP.",
    pointsAwarded: 10,
    context,
  };
};
