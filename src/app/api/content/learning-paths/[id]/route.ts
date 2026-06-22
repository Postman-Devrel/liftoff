import { NextRequest } from "next/server";
import { getLearningPath, getModulesForLearningPath } from "@/lib/content-loader";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const path = getLearningPath(id);

  if (!path) {
    return Response.json({ error: "Learning path not found" }, { status: 404 });
  }

  const modules = getModulesForLearningPath(path.id);

  const data = {
    id: path.id,
    title: path.title,
    description: path.description,
    icon: path.icon,
    color: path.color,
    modules: modules.map((m) => {
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
        color: m.color,
        lessonCount: m.lessons.length,
        stepCount,
        totalPoints,
      };
    }),
  };

  return Response.json(data);
}
