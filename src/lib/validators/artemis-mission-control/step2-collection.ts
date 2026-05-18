import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

export const validateCollection: ValidatorFn = async (apiKey, context) => {
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

  const artemisCollection = collections.find(
    (c) =>
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
    const names = collections.map((c) => c.name).join(", ");
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
