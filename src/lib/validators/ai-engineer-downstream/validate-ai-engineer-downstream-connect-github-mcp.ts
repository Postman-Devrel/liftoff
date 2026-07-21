import { ValidatorFn } from "@/types/validation";

export const validateAiEngineerDownstreamConnectGithubMcp: ValidatorFn = async (
  _apiKey,
  context
) => {
  return {
    success: true,
    message:
      "Self-verified: You confirmed the GitHub MCP is connected and authenticated in your workspace.",
    pointsAwarded: 10,
    context,
  };
};
