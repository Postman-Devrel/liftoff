import { ValidatorFn } from "@/types/validation";
import { listWorkspaces, getWorkspace } from "@/lib/postman-api";

export const validateWorkspace: ValidatorFn = async (apiKey, context) => {
  const workspaces = await listWorkspaces(apiKey);

  // Filter to workspaces matching "Artemis II - <name>"
  const candidates = workspaces.filter((ws) => {
    const match = ws.name.match(/^Artemis\s+II\s*-\s*(.+)$/i);
    return match && match[1].trim().length > 0;
  });

  if (candidates.length === 0) {
    return {
      success: false,
      message:
        'No workspace found matching "Artemis II - [your name]". Make sure the name starts with "Artemis II - " followed by your name.',
      pointsAwarded: 0,
    };
  }

  // Check each candidate's detail to verify the current user created it
  for (const ws of candidates) {
    const detail = await getWorkspace(apiKey, ws.id);
    if (context.userId && detail.createdBy === context.userId) {
      return {
        success: true,
        message: `Workspace "${ws.name}" found and verified as yours!`,
        pointsAwarded: 10,
        context: { ...context, workspaceId: ws.id, artemisWorkspaceId: ws.id },
      };
    }
  }

  return {
    success: false,
    message:
      'Found "Artemis II" workspace(s) but none were created by you. Create your own blank workspace named "Artemis II - [your name]".',
    pointsAwarded: 0,
  };
};
