import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "../resolve-workspace";

export const validateAiEngineerDownstreamCreateWorkspace: ValidatorFn = async (
  apiKey,
  context
) => {
  const result = await resolveWorkspace(
    apiKey,
    context,
    context.aiEngineerWorkspaceId,
    /erp\s*fleet/i,
    "ERP Fleet"
  );

  if ("error" in result) return result.error;

  return {
    success: true,
    message: `Workspace found: connected to your ERP Fleet workspace.`,
    pointsAwarded: 10,
    context: { ...context, aiEngineerWorkspaceId: result.id },
  };
};
