import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateTestCollection: ValidatorFn = async (
  apiKey,
  context
) => {
  const ws = await resolveWorkspace(
    apiKey,
    context,
    context.artemisWorkspaceId,
    /^Artemis\s+II\s*-\s*.+$/i,
    "Artemis II - [your name]"
  );
  if ("error" in ws) return ws.error;

  const collections = (
    (ws.detail as Record<string, unknown>).collections as
      { name: string; uid: string }[]
  ) || [];

  const testCollection = collections.find(
    (c) =>
      c.name.toLowerCase().includes("test") ||
      c.name.toLowerCase().includes("integration")
  );

  if (testCollection) {
    return {
      success: true,
      message: `Test collection "${testCollection.name}" found in your workspace!`,
      pointsAwarded: 10,
      context,
    };
  }

  if (collections.length >= 2) {
    return {
      success: true,
      message: `Found ${collections.length} collections in your workspace — looks like you've created your test suite!`,
      pointsAwarded: 10,
      context,
    };
  }

  return {
    success: false,
    message:
      "No integration test collection found. Use Agent Mode to generate an end-to-end test collection.",
    pointsAwarded: 0,
  };
};
