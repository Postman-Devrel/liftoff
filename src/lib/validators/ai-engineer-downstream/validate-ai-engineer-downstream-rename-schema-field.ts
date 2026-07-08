import { ValidatorFn } from "@/types/validation";

export const validateAiEngineerDownstreamRenameSchemaField: ValidatorFn = async (
  _apiKey,
  context
) => {
  return {
    success: true,
    message:
      "Self-verified: You confirmed the Create Employee response schema now defines `employee-id` instead of `id`.",
    pointsAwarded: 10,
    context,
  };
};
