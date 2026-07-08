import artemisModule from "@/content/modules/artemis-mission-control/module.json";
import apiBasicsModule from "@/content/modules/api-basics/module.json";
import bankingModule from "@/content/modules/banking-ai-mcp-bootcamp/module.json";
import worldExplorerModule from "@/content/modules/world-explorer/module.json";
import agentModeBasicsModule from "@/content/modules/agent-mode-basics/module.json";
import postmanMcpModule from "@/content/modules/postman-mcp/module.json";
import claudeCodePluginModule from "@/content/modules/claude-code-plugin/module.json";
import aiEngineerDownstreamModule from "@/content/modules/ai-engineer-downstream/module.json";
import introToPostmanPath from "@/content/learning-paths/intro-to-postman/learning-path.json";
import postman101Path from "@/content/learning-paths/postman-101/learning-path.json";
import aiPath from "@/content/learning-paths/ai/learning-path.json";
import buildingWithAiPath from "@/content/learning-paths/building-with-ai/learning-path.json";
import { Module, Lesson } from "@/types/module";
import { LearningPath } from "@/types/learning-path";

const allModules: Module[] = [
  artemisModule as Module,
  apiBasicsModule as Module,
  bankingModule as Module,
  worldExplorerModule as Module,
  agentModeBasicsModule as Module,
  postmanMcpModule as Module,
  claudeCodePluginModule as Module,
  aiEngineerDownstreamModule as Module,
];
const allLearningPaths: LearningPath[] = [
  postman101Path as LearningPath,
  introToPostmanPath as LearningPath,
  aiPath as LearningPath,
  buildingWithAiPath as LearningPath,
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
