import { listWorkspaces, getWorkspace } from "@/lib/postman-api";
import { ValidationContext } from "@/types/validation";

export async function resolveWorkspace(
  apiKey: string,
  context: ValidationContext,
  scopedId: string | undefined,
  namePattern: RegExp,
  friendlyName: string
): Promise<{ id: string; detail: Record<string, unknown> } | { error: { success: false; message: string; pointsAwarded: 0 } }> {
  if (scopedId) {
    const detail = await getWorkspace(apiKey, scopedId);
    return { id: scopedId, detail };
  }

  const workspaces = await listWorkspaces(apiKey);
  const candidates = workspaces.filter((ws) => namePattern.test(ws.name));

  for (const ws of candidates) {
    const detail = await getWorkspace(apiKey, ws.id);
    if (context.userId && detail.createdBy === context.userId) {
      return { id: ws.id, detail };
    }
  }

  return {
    error: {
      success: false,
      message: candidates.length > 0
        ? `Found "${friendlyName}" workspace(s) but none created by you. Please complete Step 1 first.`
        : `No workspace matching "${friendlyName}" found. Please complete Step 1 first.`,
      pointsAwarded: 0,
    },
  };
}
