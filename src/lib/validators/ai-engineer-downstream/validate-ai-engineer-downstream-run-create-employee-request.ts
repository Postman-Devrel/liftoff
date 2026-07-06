import { ValidatorFn } from "@/types/validation";

export const validateAiEngineerDownstreamRunCreateEmployeeRequest: ValidatorFn =
  async (_apiKey, context) => {
    return {
      success: true,
      message:
        "Self-verified: You confirmed the Create Employee request returned a body containing the `employee-id` field.",
      pointsAwarded: 10,
      context,
    };
  };
