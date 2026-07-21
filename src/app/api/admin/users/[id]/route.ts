import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllModules, getAllLearningPaths } from "@/lib/content-loader";
import { ranks } from "@/lib/scoring";
import { attributeUserRank, attributeUserCompletions } from "@/lib/achievement-attribution";
import { BASE_PATH } from "@/lib/base-path";

function verifyAdmin(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const token = request.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(adminPassword));
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();
  const modules = getAllModules();
  const learningPaths = getAllLearningPaths();

  const [profileRes, progressRes, utmRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("progress")
      .select("*")
      .eq("user_id", id)
      .order("completed_at", { ascending: false }),
    supabase.from("utm_attribution").select("*").eq("user_id", id),
  ]);

  if (profileRes.error || !profileRes.data) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const profile = profileRes.data;
  const userProgress = progressRes.data || [];
  const userUtmRows = utmRes.data || [];
  const completedStepIds = new Set(userProgress.map((p) => p.step_id));
  const completedStepMap = new Map(
    userProgress.map((p) => [p.step_id, p])
  );

  const rankAttribution = attributeUserRank(userProgress, userUtmRows, modules);
  const completionAttribution = attributeUserCompletions(
    completedStepIds,
    userUtmRows,
    modules,
    learningPaths
  );

  const totalPoints = userProgress.reduce(
    (sum, p) => sum + p.points_awarded,
    0
  );
  const rank =
    ranks.find((r) => totalPoints >= r.minPoints) || ranks[ranks.length - 1];

  const moduleProgress = modules.map((mod) => {
    const steps = mod.lessons.flatMap((l) =>
      l.steps.map((s) => {
        const prog = completedStepMap.get(s.id);
        return {
          stepId: s.id,
          title: s.title,
          lessonTitle: l.title,
          points: s.points,
          completed: completedStepIds.has(s.id),
          completedAt: prog?.completed_at || null,
        };
      })
    );

    return {
      moduleId: mod.id,
      title: mod.title,
      color: mod.color,
      icon: mod.icon,
      totalSteps: steps.length,
      completedSteps: steps.filter((s) => s.completed).length,
      steps,
    };
  });

  const recentActivity = userProgress.slice(0, 20).map((p) => {
    let stepTitle = p.step_id;
    let moduleName = "";
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        const step = lesson.steps.find((s) => s.id === p.step_id);
        if (step) {
          stepTitle = step.title;
          moduleName = mod.title;
          break;
        }
      }
      if (moduleName) break;
    }
    return {
      stepId: p.step_id,
      stepTitle,
      moduleName,
      completedAt: p.completed_at,
      points: p.points_awarded,
    };
  });

  return Response.json({
    profile: {
      id: profile.id,
      displayName:
        profile.display_name || profile.discord_username || "Unknown",
      discordUsername: profile.discord_username || "",
      avatarUrl: profile.discord_avatar_url || "",
      joinedAt: profile.created_at,
    },
    stats: {
      totalPoints,
      totalSteps: userProgress.length,
      rank: rank.title,
      rankBadge: rank.badge,
      rankBadgeImg: `${BASE_PATH}${rank.badgeImg}`,
    },
    modules: moduleProgress,
    recentActivity,
    attribution: {
      rank: rankAttribution,
      completions: completionAttribution,
    },
  });
}
