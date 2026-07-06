import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

const EXPECTED_BASE_URL = "https://demo.postman-echo.com";
const EXPECTED_GITHUB_REPO = "postman-demo/users-api";

export const validateAiEngineerDownstreamConfigureEnvironment: ValidatorFn = async (
  apiKey,
  context
) => {
  const ws = await resolveWorkspace(
    apiKey,
    context,
    context.aiEngineerWorkspaceId,
    /^Downstream\s+Demo\s*-\s*.+$/i,
    "Downstream Demo - [your name]"
  );
  if ("error" in ws) return ws.error;

  const workspace = ws.detail as Record<string, unknown>;
  const wsEnvironments: { id: string; name: string; uid: string }[] =
    (workspace.environments as { id: string; name: string; uid: string }[]) || [];

  const env = wsEnvironments.find(
    (e) => e.name.trim().toLowerCase() === "downstream demo env"
  );

  if (!env) {
    const names = wsEnvironments.map((e) => e.name).join(", ");
    return {
      success: false,
      message: names
        ? `Found environments (${names}) but none named exactly "Downstream Demo Env". Create one with that name.`
        : 'No environments in your workspace. Create one named "Downstream Demo Env".',
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, env.uid);
  const values = envDetail.values || [];

  const baseUrl = resolveEnvVar(
    values,
    "baseUrl",
    'Environment "Downstream Demo Env" is missing the `baseUrl` variable. Add it with the value `https://demo.postman-echo.com`.'
  );
  if (typeof baseUrl !== "string") return baseUrl;
  if (baseUrl !== EXPECTED_BASE_URL) {
    return {
      success: false,
      message: `Variable \`baseUrl\` found but its value is "${baseUrl}". Set it to "${EXPECTED_BASE_URL}".`,
      pointsAwarded: 0,
    };
  }

  const githubRepo = resolveEnvVar(
    values,
    "githubRepo",
    'Environment "Downstream Demo Env" is missing the `githubRepo` variable. Add it with the value `postman-demo/users-api` (or your own `owner/repo`).'
  );
  if (typeof githubRepo !== "string") return githubRepo;
  if (!/^[^/\s]+\/[^/\s]+$/.test(githubRepo)) {
    return {
      success: false,
      message: `Variable \`githubRepo\` is "${githubRepo}", which does not look like an \`owner/repo\` pair. Set it to something like "${EXPECTED_GITHUB_REPO}".`,
      pointsAwarded: 0,
    };
  }

  const githubTokenEntry = values.find(
    (v: { key: string }) => v.key.toLowerCase() === "githubtoken"
  );
  if (!githubTokenEntry) {
    return {
      success: false,
      message:
        'Environment "Downstream Demo Env" is missing the `githubToken` variable. Add it as a **secret** with your GitHub PAT.',
      pointsAwarded: 0,
    };
  }
  if (githubTokenEntry.type !== "secret") {
    return {
      success: false,
      message:
        '`githubToken` exists but is not marked as a **secret**. Open the environment editor and change its type to "secret".',
      pointsAwarded: 0,
    };
  }
  const tokenValue = resolveEnvVar(
    values,
    "githubToken",
    '`githubToken` is missing.'
  );
  if (typeof tokenValue !== "string") return tokenValue;

  return {
    success: true,
    message:
      'Environment "Downstream Demo Env" is configured with `baseUrl`, `githubRepo`, and a secret `githubToken`.',
    pointsAwarded: 10,
    context: {
      ...context,
      environmentId: env.uid,
      aiEngineerEnvironmentId: env.uid,
    },
  };
};
