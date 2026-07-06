import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";

type GitHubPull = {
  title?: string;
  merged_at?: string | null;
  number?: number;
};

export const validateAiEngineerDownstreamMergePr: ValidatorFn = async (
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

  const env =
    (context.aiEngineerEnvironmentId &&
      wsEnvironments.find((e) => e.uid === context.aiEngineerEnvironmentId)) ||
    wsEnvironments.find(
      (e) => e.name.trim().toLowerCase() === "downstream demo env"
    );

  if (!env) {
    return {
      success: false,
      message:
        'Environment "Downstream Demo Env" not found. Complete Step 2 first so the validator can read your `githubRepo`.',
      pointsAwarded: 0,
    };
  }

  const envDetail = await getEnvironment(apiKey, env.uid);
  const githubRepo = resolveEnvVar(
    envDetail.values || [],
    "githubRepo",
    'Environment "Downstream Demo Env" is missing the `githubRepo` variable. Set it to an `owner/repo` you have a merged PR in.'
  );
  if (typeof githubRepo !== "string") return githubRepo;

  const githubUrl = `https://api.github.com/repos/${githubRepo}/pulls?state=closed&per_page=50`;
  const res = await fetch(githubUrl, {
    headers: {
      "User-Agent": "LiftOff/1.0 (quickstarts.postman.com)",
      Accept: "application/vnd.github+json",
    },
  });

  if (res.status === 404) {
    return {
      success: false,
      message: `GitHub returned 404 for \`${githubRepo}\`. Update \`githubRepo\` to a real public repo (\`owner/repo\`) that has at least one merged PR.`,
      pointsAwarded: 0,
    };
  }

  if (!res.ok) {
    return {
      success: false,
      message: `GitHub API returned ${res.status} for \`${githubRepo}\`. Check that the repo is public and try again.`,
      pointsAwarded: 0,
    };
  }

  const pulls = (await res.json()) as GitHubPull[];
  if (!Array.isArray(pulls)) {
    return {
      success: false,
      message:
        "GitHub did not return a list of pull requests. Verify `githubRepo` is set to a valid `owner/repo`.",
      pointsAwarded: 0,
    };
  }

  const merged = pulls.filter((p) => p.merged_at);
  if (merged.length === 0) {
    return {
      success: false,
      message: `No merged PRs found on \`${githubRepo}\`. Merge the AI Engineer's PR (or point \`githubRepo\` at a repo that has at least one merged PR).`,
      pointsAwarded: 0,
    };
  }

  const renameMatch = merged.find((p) =>
    /rename.*user[_\s]*id.*userId/i.test(p.title || "")
  );

  return {
    success: true,
    message: renameMatch
      ? `Merged PR #${renameMatch.number} ("${renameMatch.title}") confirmed via the GitHub API.`
      : `${merged.length} merged PR(s) confirmed on \`${githubRepo}\` via the GitHub API.`,
    pointsAwarded: 10,
    context,
  };
};
