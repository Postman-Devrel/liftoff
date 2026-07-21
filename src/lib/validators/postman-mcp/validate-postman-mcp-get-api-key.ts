import { ValidatorFn } from "@/types/validation";

export const validatePostmanMcpGetApiKey: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: You generated a Postman API key.",
    pointsAwarded: 10,
    context,
  };
};
