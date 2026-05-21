import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllModules } from "@/lib/content-loader";
import { ranks } from "@/lib/scoring";

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

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days");
  const days = daysParam === "all" ? null : Math.min(parseInt(daysParam || "30", 10) || 30, 365);

  const supabase = createAdminClient();
  const modules = getAllModules();

  let activityQuery = supabase
    .from("progress")
    .select("completed_at")
    .order("completed_at", { ascending: true });
  if (days) {
    activityQuery = activityQuery.gte(
      "completed_at",
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    );
  }

  const [profilesRes, progressRes, activityRes, userPointsRes] =
    await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("progress").select("*"),
      activityQuery,
      supabase.from("user_points").select("*"),
    ]);

  const profiles = profilesRes.data || [];
  const progress = progressRes.data || [];
  const recentActivity = activityRes.data || [];
  const userPoints = userPointsRes.data || [];

  const totalUsers = profiles.length;
  const totalStepsCompleted = progress.length;
  const totalPointsEarned = progress.reduce(
    (sum, p) => sum + p.points_awarded,
    0
  );

  let totalModulesCompleted = 0;
  const moduleStats = modules.map((mod) => {
    const moduleStepIds = new Set(
      mod.lessons.flatMap((l) => l.steps.map((s) => s.id))
    );
    const totalSteps = moduleStepIds.size;

    const userProgressMap = new Map<string, Set<string>>();
    for (const p of progress) {
      if (moduleStepIds.has(p.step_id)) {
        if (!userProgressMap.has(p.user_id)) {
          userProgressMap.set(p.user_id, new Set());
        }
        userProgressMap.get(p.user_id)!.add(p.step_id);
      }
    }

    const usersStarted = userProgressMap.size;
    let usersCompleted = 0;
    let totalCompletion = 0;
    for (const [, steps] of userProgressMap) {
      const pct = steps.size / totalSteps;
      totalCompletion += pct;
      if (steps.size === totalSteps) usersCompleted++;
    }
    totalModulesCompleted += usersCompleted;

    return {
      moduleId: mod.id,
      title: mod.title,
      color: mod.color,
      icon: mod.icon,
      totalSteps,
      usersStarted,
      usersCompleted,
      avgCompletion:
        usersStarted > 0 ? Math.round((totalCompletion / usersStarted) * 100) : 0,
    };
  });

  const activityByDate = new Map<string, number>();
  if (days) {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      activityByDate.set(d.toISOString().split("T")[0], 0);
    }
  } else {
    const dates = recentActivity.map((a) => a.completed_at.split("T")[0]);
    if (dates.length > 0) {
      const first = new Date(dates[0] + "T00:00:00");
      const last = new Date();
      for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
        activityByDate.set(d.toISOString().split("T")[0], 0);
      }
    }
  }
  for (const a of recentActivity) {
    const date = a.completed_at.split("T")[0];
    activityByDate.set(date, (activityByDate.get(date) || 0) + 1);
  }
  const activity = [...activityByDate.entries()].map(([date, completions]) => ({
    date,
    completions,
  }));

  const pointsMap = new Map(userPoints.map((u) => [u.user_id, u]));
  const rankDistMap = new Map<string, number>();
  for (const r of ranks) {
    rankDistMap.set(r.title, 0);
  }
  for (const up of userPoints) {
    const rank = ranks.find((r) => up.total_points >= r.minPoints) || ranks[ranks.length - 1];
    rankDistMap.set(rank.title, (rankDistMap.get(rank.title) || 0) + 1);
  }
  const usersWithNoPoints = totalUsers - userPoints.length;
  const cadetTitle = ranks[ranks.length - 1].title;
  rankDistMap.set(
    cadetTitle,
    (rankDistMap.get(cadetTitle) || 0) + usersWithNoPoints
  );

  const rankColors: Record<string, string> = {
    "Mass Relay": "#8B5CF6",
    Supernova: "#EC4899",
    "Galaxy Brain": "#06B6D4",
    "Flight Director": "#FF6C37",
    Commander: "#F59E0B",
    "Mission Specialist": "#10B981",
    "Space Cadet": "#64748B",
  };
  const rankDistribution = ranks.map((r) => ({
    rank: r.title,
    count: rankDistMap.get(r.title) || 0,
    color: rankColors[r.title] || "#64748B",
    badge: r.badge,
  })).filter((r) => r.count > 0);

  const leaderboard = profiles
    .map((p) => {
      const up = pointsMap.get(p.id);
      const totalPoints = up?.total_points || 0;
      const totalSteps = up?.total_steps_completed || 0;
      const rank = ranks.find((r) => totalPoints >= r.minPoints) || ranks[ranks.length - 1];
      return {
        userId: p.id,
        displayName: p.display_name || p.discord_username || "Unknown",
        discordUsername: p.discord_username || "",
        avatarUrl: p.discord_avatar_url || "",
        totalPoints,
        totalSteps,
        rank: rank.title,
        rankBadge: rank.badge,
        joinedAt: p.created_at,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return Response.json({
    stats: {
      totalUsers,
      totalStepsCompleted,
      totalPointsEarned,
      totalModulesCompleted,
    },
    activity,
    moduleStats,
    rankDistribution,
    leaderboard,
  });
}
