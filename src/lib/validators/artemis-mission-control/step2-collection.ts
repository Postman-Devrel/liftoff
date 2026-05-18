import { ValidatorFn } from "@/types/validation";
import { getWorkspace } from "@/lib/postman-api";

export const validateCollection: ValidatorFn = async (apiKey, context) => {
  const wsId = context.artemisWorkspaceId || context.workspaceId;
  if (!wsId) {
    return {
      success: false,
      message: "Please complete Step 1 first (create the workspace).",
      pointsAwarded: 0,
    };
  }

  const workspace = await getWorkspace(apiKey, wsId);
  const collections = workspace.collections || [];

  // The OpenAPI spec generates a collection named "Artemis Mission Control API"
  const artemisCollection = collections.find(
    (c: { name: string }) =>
      c.name.toLowerCase().includes("artemis") &&
      c.name.toLowerCase().includes("mission")
  );

  if (artemisCollection) {
    return {
      success: true,
      message: `Collection "${artemisCollection.name}" found! OpenAPI spec imported successfully.`,
      pointsAwarded: 10,
      context,
    };
  }

  if (collections.length > 0) {
    const names = collections
      .map((c: { name: string }) => c.name)
      .join(", ");
    return {
      success: false,
      message: `Found collections (${names}) but none match the Artemis Mission Control API spec. Import the OpenAPI spec from: https://raw.githubusercontent.com/mishra-aanchal/artemis-mission-control-api-workshop/refs/heads/main/openapi.yaml`,
      pointsAwarded: 0,
    };
  }

  return {
    success: false,
    message:
      "No collections found in your Artemis workspace. Import the OpenAPI spec URL in Postman.",
    pointsAwarded: 0,
  };
};
