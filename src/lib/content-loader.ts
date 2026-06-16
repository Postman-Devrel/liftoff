import artemisModule from "@/content/modules/artemis-mission-control/module.json";
import apiBasicsModule from "@/content/modules/api-basics/module.json";
import bankingModule from "@/content/modules/banking-ai-mcp-bootcamp/module.json";
import introToPostmanPath from "@/content/learning-paths/intro-to-postman/learning-path.json";
import aiPath from "@/content/learning-paths/ai/learning-path.json";
import { Module, Lesson } from "@/types/module";
import { LearningPath } from "@/types/learning-path";

const allModules: Module[] = [artemisModule as Module, apiBasicsModule as Module, bankingModule as Module];
const allLearningPaths: LearningPath[] = [
  introToPostmanPath as LearningPath,
  aiPath as LearningPath,
];

export function getAllModules(): Module[] {
  return allModules.filter((m) => !m.private);
}

export function getAllModulesIncludingPrivate(): Module[] {
  return allModules;
}

export function getModule(moduleId?: string): Module {
  if (moduleId) {
    return allModules.find((m) => m.id === moduleId) || allModules[0];
  }
  return allModules[0];
}

export function getLesson(slug: string, moduleId?: string): Lesson | undefined {
  const mod = getModule(moduleId);
  return mod.lessons.find((l) => l.slug === slug);
}

export function getAllLessonSlugs(): string[] {
  return allModules.flatMap((m) => m.lessons.map((l) => l.slug));
}

export function getAllLearningPaths(): LearningPath[] {
  return allLearningPaths.filter((p) => !p.private);
}

export function getAllLearningPathsIncludingPrivate(): LearningPath[] {
  return allLearningPaths;
}

export function getLearningPath(pathId: string): LearningPath | undefined {
  return allLearningPaths.find((p) => p.id === pathId);
}

export function getModulesForLearningPath(pathId: string): Module[] {
  const path = getLearningPath(pathId);
  if (!path) return [];
  return path.moduleIds
    .map((id) => allModules.find((m) => m.id === id))
    .filter((m): m is Module => m !== undefined);
}
