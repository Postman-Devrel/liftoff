import { ValidatorFn } from "@/types/validation";
import { listWorkspaces, getWorkspace } from "@/lib/postman-api";

export const validateBankingCreateWorkspace: ValidatorFn = async (apiKey, context) => {
  const workspaces = await listWorkspaces(apiKey);

  const candidates = workspaces.filter((ws) => {
    return /intergalactic\s+banking/i.test(ws.name);
  });

  if (candidates.length === 0) {
    return {
      success: false,
      message:
        'No workspace found matching "Your Name – Intergalactic Banking". Create a blank workspace with that naming pattern.',
      pointsAwarded: 0,
    };
  }

  for (const ws of candidates) {
    const detail = await getWorkspace(apiKey, ws.id);
    if (context.userId && detail.createdBy === context.userId) {
      if (ws.type !== "team") {
        return {
          success: false,
          message: `Workspace "${ws.name}" found, but its visibility is "${ws.type}" instead of "team" (Internal). Update the workspace visibility to Internal.`,
          pointsAwarded: 0,
        };
      }

      const warning = candidates.length > 1
        ? ` Note: you have ${candidates.length} workspaces matching "Intergalactic Banking" — using "${ws.name}". Consider deleting duplicates to avoid confusion.`
        : "";

      return {
        success: true,
        message: `Workspace "${ws.name}" found with correct visibility!${warning}`,
        pointsAwarded: 10,
        context: { ...context, workspaceId: ws.id, bankingWorkspaceId: ws.id },
      };
    }
  }

  return {
    success: false,
    message:
      'Found "Intergalactic Banking" workspace(s) but none were created by you. Create your own blank workspace.',
    pointsAwarded: 0,
  };
};
