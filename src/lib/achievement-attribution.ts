import { Module } from "@/types/module";
import { LearningPath } from "@/types/learning-path";
import { Database } from "@/types/supabase";
import { ranks } from "@/lib/scoring";
import { buildStepModuleIndex, isModuleComplete, isLearningPathComplete } from "@/lib/content-index";

type ProgressRow = Database["public"]["Tables"]["progress"]["Row"];
type UtmRow = Database["public"]["Tables"]["utm_attribution"]["Row"];
type ContentType = "module" | "learning_path";
type AttributionType = "crossing_module" | "acquisition_fallback";

export interface CompletionAttribution {
  source: string;
  medium: string | null;
  campaign: string | null;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  usersCompleted: number;
  userIds: string[];
}

export interface RankAttribution {
  source: string;
  medium: string | null;
  campaign: string | null;
  rankTitle: string;
  rankBadge: string;
  usersReached: number;
  userIds: string[];
  attributionType: AttributionType;
}

export interface RankCrossing {
  rankId: string;
  rankTitle: string;
  rankBadge: string;
  crossedAt: string;
  crossingStepId: string;
  crossingModuleId: string | null;
}

export interface UserRankAttribution {
  rankTitle: string;
  rankBadge: string;
  crossingModuleId: string | null;
  crossingModuleTitle: string | null;
  utmSource: string;
  utmMedium: string | null;
  utmCampaign: string | null;
  attributionType: AttributionType;
}

export interface UserCompletionAttribution {
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  utmSource: string;
  utmMedium: string | null;
  utmCampaign: string | null;
}

// Sorted ascending by points, skipping the zero-point starting rank — everyone
// already "has" that one, so it can never be crossed via a step completion.
const ascendingRanks = [...ranks].sort((a, b) => a.minPoints - b.minPoints).filter((r) => r.minPoints > 0);

export function computeRankCrossings(
  progressRows: Pick<ProgressRow, "step_id" | "points_awarded" | "completed_at">[],
  stepModuleIndex: Map<string, { moduleId: string; points: number }>
): RankCrossing[] {
  const sorted = [...progressRows].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  const crossings: RankCrossing[] = [];
  let cumulative = 0;
  let nextRankIdx = 0;
  for (const row of sorted) {
    cumulative += row.points_awarded;
    while (nextRankIdx < ascendingRanks.length && cumulative >= ascendingRanks[nextRankIdx].minPoints) {
      const rank = ascendingRanks[nextRankIdx];
      crossings.push({
        rankId: rank.id,
        rankTitle: rank.title,
        rankBadge: rank.badge,
        crossedAt: row.completed_at,
        crossingStepId: row.step_id,
        crossingModuleId: stepModuleIndex.get(row.step_id)?.moduleId ?? null,
      });
      nextRankIdx++;
    }
  }
  return crossings;
}

export function attributeCompletions(
  progress: Pick<ProgressRow, "user_id" | "step_id">[],
  utmRows: UtmRow[],
  modules: Module[],
  learningPaths: LearningPath[]
): CompletionAttribution[] {
  const userStepMap = new Map<string, Set<string>>();
  for (const p of progress) {
    if (!userStepMap.has(p.user_id)) userStepMap.set(p.user_id, new Set());
    userStepMap.get(p.user_id)!.add(p.step_id);
  }

  const utmByUserContent = new Map<string, UtmRow>();
  for (const row of utmRows) {
    utmByUserContent.set(`${row.user_id}|${row.content_type}|${row.content_id}`, row);
  }

  const resultMap = new Map<string, CompletionAttribution>();
  const record = (
    row: UtmRow,
    contentType: ContentType,
    contentId: string,
    contentTitle: string,
    userId: string
  ) => {
    const key = `${row.utm_source}|${row.utm_medium ?? ""}|${row.utm_campaign ?? ""}|${contentType}|${contentId}`;
    const existing = resultMap.get(key);
    if (existing) {
      existing.usersCompleted++;
      existing.userIds.push(userId);
    } else {
      resultMap.set(key, {
        source: row.utm_source,
        medium: row.utm_medium,
        campaign: row.utm_campaign,
        contentType,
        contentId,
        contentTitle,
        usersCompleted: 1,
        userIds: [userId],
      });
    }
  };

  for (const [userId, completedStepIds] of userStepMap) {
    for (const mod of modules) {
      if (!isModuleComplete(mod, completedStepIds)) continue;
      const utm = utmByUserContent.get(`${userId}|module|${mod.id}`);
      if (utm) record(utm, "module", mod.id, mod.title, userId);
    }
    for (const path of learningPaths) {
      if (!isLearningPathComplete(path, modules, completedStepIds)) continue;
      const utm = utmByUserContent.get(`${userId}|learning_path|${path.id}`);
      if (utm) record(utm, "learning_path", path.id, path.title, userId);
    }
  }

  return [...resultMap.values()].sort((a, b) => b.usersCompleted - a.usersCompleted);
}

export function attributeRanks(
  progress: Pick<ProgressRow, "user_id" | "step_id" | "points_awarded" | "completed_at">[],
  utmRows: UtmRow[],
  modules: Module[]
): RankAttribution[] {
  const stepModuleIndex = buildStepModuleIndex(modules);

  const progressByUser = new Map<string, typeof progress>();
  for (const p of progress) {
    if (!progressByUser.has(p.user_id)) progressByUser.set(p.user_id, []);
    progressByUser.get(p.user_id)!.push(p);
  }

  const utmByUserModule = new Map<string, UtmRow>();
  const earliestUtmByUser = new Map<string, UtmRow>();
  for (const row of utmRows) {
    if (row.content_type === "module") {
      utmByUserModule.set(`${row.user_id}|${row.content_id}`, row);
    }
    const earliest = earliestUtmByUser.get(row.user_id);
    if (!earliest || row.first_seen_at < earliest.first_seen_at) {
      earliestUtmByUser.set(row.user_id, row);
    }
  }

  const resultMap = new Map<string, RankAttribution>();
  const record = (
    row: UtmRow,
    rankTitle: string,
    rankBadge: string,
    attributionType: AttributionType,
    userId: string
  ) => {
    const key = `${row.utm_source}|${row.utm_medium ?? ""}|${row.utm_campaign ?? ""}|${rankTitle}|${attributionType}`;
    const existing = resultMap.get(key);
    if (existing) {
      existing.usersReached++;
      existing.userIds.push(userId);
    } else {
      resultMap.set(key, {
        source: row.utm_source,
        medium: row.utm_medium,
        campaign: row.utm_campaign,
        rankTitle,
        rankBadge,
        usersReached: 1,
        userIds: [userId],
        attributionType,
      });
    }
  };

  for (const [userId, userProgress] of progressByUser) {
    const crossings = computeRankCrossings(userProgress, stepModuleIndex);
    for (const crossing of crossings) {
      const direct = crossing.crossingModuleId
        ? utmByUserModule.get(`${userId}|${crossing.crossingModuleId}`)
        : undefined;
      if (direct) {
        record(direct, crossing.rankTitle, crossing.rankBadge, "crossing_module", userId);
        continue;
      }
      const fallback = earliestUtmByUser.get(userId);
      if (fallback) {
        record(fallback, crossing.rankTitle, crossing.rankBadge, "acquisition_fallback", userId);
      }
    }
  }

  return [...resultMap.values()].sort((a, b) => b.usersReached - a.usersReached);
}

// Per-user variants — same rules as the aggregate functions above, scoped to
// a single user's progress/utm rows for the admin user-detail panel.

export function attributeUserRank(
  userProgress: Pick<ProgressRow, "step_id" | "points_awarded" | "completed_at">[],
  userUtmRows: UtmRow[],
  modules: Module[]
): UserRankAttribution | null {
  const stepModuleIndex = buildStepModuleIndex(modules);
  const crossings = computeRankCrossings(userProgress, stepModuleIndex);
  const current = crossings[crossings.length - 1];
  if (!current) return null;

  const moduleRow = current.crossingModuleId
    ? userUtmRows.find((r) => r.content_type === "module" && r.content_id === current.crossingModuleId)
    : undefined;

  if (moduleRow) {
    const mod = modules.find((m) => m.id === current.crossingModuleId);
    return {
      rankTitle: current.rankTitle,
      rankBadge: current.rankBadge,
      crossingModuleId: current.crossingModuleId,
      crossingModuleTitle: mod?.title ?? current.crossingModuleId,
      utmSource: moduleRow.utm_source,
      utmMedium: moduleRow.utm_medium,
      utmCampaign: moduleRow.utm_campaign,
      attributionType: "crossing_module",
    };
  }

  const fallback = [...userUtmRows].sort((a, b) => (a.first_seen_at < b.first_seen_at ? -1 : 1))[0];
  if (!fallback) return null;

  return {
    rankTitle: current.rankTitle,
    rankBadge: current.rankBadge,
    crossingModuleId: current.crossingModuleId,
    crossingModuleTitle: null,
    utmSource: fallback.utm_source,
    utmMedium: fallback.utm_medium,
    utmCampaign: fallback.utm_campaign,
    attributionType: "acquisition_fallback",
  };
}

export function attributeUserCompletions(
  completedStepIds: Set<string>,
  userUtmRows: UtmRow[],
  modules: Module[],
  learningPaths: LearningPath[]
): UserCompletionAttribution[] {
  const results: UserCompletionAttribution[] = [];

  for (const mod of modules) {
    if (!isModuleComplete(mod, completedStepIds)) continue;
    const row = userUtmRows.find((r) => r.content_type === "module" && r.content_id === mod.id);
    if (row) {
      results.push({
        contentType: "module",
        contentId: mod.id,
        contentTitle: mod.title,
        utmSource: row.utm_source,
        utmMedium: row.utm_medium,
        utmCampaign: row.utm_campaign,
      });
    }
  }

  for (const path of learningPaths) {
    if (!isLearningPathComplete(path, modules, completedStepIds)) continue;
    const row = userUtmRows.find((r) => r.content_type === "learning_path" && r.content_id === path.id);
    if (row) {
      results.push({
        contentType: "learning_path",
        contentId: path.id,
        contentTitle: path.title,
        utmSource: row.utm_source,
        utmMedium: row.utm_medium,
        utmCampaign: row.utm_campaign,
      });
    }
  }

  return results;
}
