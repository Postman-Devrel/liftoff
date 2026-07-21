import { ValidatorFn } from "@/types/validation";

export const validateAiEngineerDownstreamAddLocalisationSupport: ValidatorFn =
  async (_apiKey, context) => {
    return {
      success: true,
      message:
        "Self-verified: You confirmed the AI Engineer opened localisation PRs across the affected ERP repos.",
      pointsAwarded: 10,
      context,
    };
  };
