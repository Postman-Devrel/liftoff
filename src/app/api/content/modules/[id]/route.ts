import { NextRequest } from "next/server";
import { getAllModules } from "@/lib/content-loader";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const module = getAllModules().find((m) => m.id === id);

  if (!module) {
    return Response.json({ error: "Module not found" }, { status: 404 });
  }

  const data = {
    id: module.id,
    title: module.title,
    description: module.description,
    icon: module.icon,
    color: module.color,
    lessons: module.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      partNumber: l.partNumber,
      stepCount: l.steps.length,
      totalPoints: l.steps.reduce((a, s) => a + s.points, 0),
      steps: l.steps.map((s) => ({
        id: s.id,
        stepNumber: s.stepNumber,
        title: s.title,
        points: s.points,
        manual: s.manual ?? false,
      })),
    })),
  };

  return Response.json(data);
}
