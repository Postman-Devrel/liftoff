import { getAllModulesIncludingPrivate, getAllLearningPathsIncludingPrivate } from "@/lib/content-loader";
import { isModuleComplete, isLearningPathComplete } from "@/lib/content-index";
import { ranks } from "@/lib/scoring";
import { LiftoffWebhookEvent } from "@/lib/webhooks";

const ascendingRanks = [...ranks].sort((a, b) => a.minPoints - b.minPoints).filter((r) => r.minPoints > 0);

// Diffs progress before/after a single step completion and returns the
// webhook events (module/path completions, rank-ups) that step newly triggered.
export function detectCompletionEvents(params: {
  completedBefore: Set<string>;
  completedAfter: Set<string>;
  pointsBefore: number;
  pointsAfter: number;
  discordId: string | null;
  baseUrl: string;
  occurredAt: string;
}): LiftoffWebhookEvent[] {
  const { completedBefore, completedAfter, pointsBefore, pointsAfter, discordId, baseUrl, occurredAt } = params;
  const events: LiftoffWebhookEvent[] = [];

  for (const mod of getAllModulesIncludingPrivate()) {
    if (!isModuleComplete(mod, completedBefore) && isModuleComplete(mod, completedAfter)) {
      events.push({
        type: "module_completed",
        discordId,
        moduleId: mod.id,
        moduleTitle: mod.title,
        badgeUrl: `${baseUrl}/api/modules/${mod.id}/badge`,
        occurredAt,
      });
    }
  }

  const modules = getAllModulesIncludingPrivate();
  for (const path of getAllLearningPathsIncludingPrivate()) {
    if (
      !isLearningPathComplete(path, modules, completedBefore) &&
      isLearningPathComplete(path, modules, completedAfter)
    ) {
      events.push({
        type: "learning_path_completed",
        discordId,
        learningPathId: path.id,
        learningPathTitle: path.title,
        badgeUrl: `${baseUrl}/api/learning-paths/${path.id}/badge`,
        occurredAt,
      });
    }
  }

  for (const rank of ascendingRanks) {
    if (rank.minPoints > pointsBefore && rank.minPoints <= pointsAfter) {
      events.push({
        type: "rank_up",
        discordId,
        rankId: rank.id,
        rankTitle: rank.title,
        badgeUrl: `${baseUrl}${rank.badgeImgFull}`,
        occurredAt,
      });
    }
  }

  return events;
}
