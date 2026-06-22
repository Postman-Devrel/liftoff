import { NextRequest } from "next/server";
import { getAllModules, getModulesForLearningPath } from "@/lib/content-loader";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();
  const pathId = searchParams.get("pathId");

  let modules = pathId ? getModulesForLearningPath(pathId) : getAllModules();

  if (q) {
    modules = modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }

  const base = new URL(request.url).origin;

  const data = modules.map((m) => {
    const stepCount = m.lessons.reduce((a, l) => a + l.steps.length, 0);
    const totalPoints = m.lessons.reduce(
      (a, l) => a + l.steps.reduce((b, s) => b + s.points, 0),
      0
    );
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      icon: m.icon,
      badgeUrl: `${base}/api/modules/${m.id}/badge`,
      color: m.color,
      lessonCount: m.lessons.length,
      stepCount,
      totalPoints,
    };
  });

  return Response.json({ modules: data, total: data.length });
}
