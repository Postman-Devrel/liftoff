import { NextRequest } from "next/server";
import { getAllLearningPaths, getModulesForLearningPath } from "@/lib/content-loader";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();
  const moduleId = searchParams.get("moduleId");

  let paths = getAllLearningPaths();

  if (moduleId) {
    paths = paths.filter((p) => p.moduleIds.includes(moduleId));
  }

  if (q) {
    paths = paths.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  const data = paths.map((p) => {
    const modules = getModulesForLearningPath(p.id);
    const stepCount = modules.reduce(
      (a, m) => a + m.lessons.reduce((b, l) => b + l.steps.length, 0),
      0
    );
    const totalPoints = modules.reduce(
      (a, m) =>
        a +
        m.lessons.reduce(
          (b, l) => b + l.steps.reduce((c, s) => c + s.points, 0),
          0
        ),
      0
    );
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      icon: p.icon,
      color: p.color,
      moduleCount: modules.length,
      stepCount,
      totalPoints,
    };
  });

  return Response.json({ learningPaths: data, total: data.length });
}
