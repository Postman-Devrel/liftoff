import { ValidatorFn } from "@/types/validation";

export const validateClaudeCodePluginQueryMoviesApi: ValidatorFn = async (_apiKey, context) => {
  return {
    success: true,
    message: "Self-verified: Claude Code returned a list of movies from the live API.",
    pointsAwarded: 10,
    context,
  };
};
