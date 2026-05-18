import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateApiBasicsCreateCollection: ValidatorFn = async (apiKey, context) => {
  const ws = await resolveWorkspace(apiKey, context, context.apiBasicsWorkspaceId, /^API\s+Basics\s*-\s*.+$/i, "API Basics - [your name]");
  if ("error" in ws) return ws.error;

  const workspace = ws.detail as Record<string, unknown>;
  const collections = (workspace.collections as { name: string; uid: string }[]) || [];

  const myCollection = collections.find(
    (c: { name: string }) => c.name.toLowerCase() === "my first collection"
  );

  if (!myCollection) {
    if (collections.length > 0) {
      const names = collections.map((c: { name: string }) => c.name).join(", ");
      return {
        success: false,
        message: `Found collections (${names}) but none named "My First Collection". Create a collection with that exact name.`,
        pointsAwarded: 0,
      };
    }
    return {
      success: false,
      message:
        'No collections found in your workspace. Create a new collection named "My First Collection".',
      pointsAwarded: 0,
    };
  }

  return {
    success: true,
    message: `Collection "${myCollection.name}" found in your workspace!`,
    pointsAwarded: 10,
    context,
  };
};
