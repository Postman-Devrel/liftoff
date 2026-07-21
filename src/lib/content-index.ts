import { Module } from "@/types/module";
import { LearningPath } from "@/types/learning-path";

export interface StepLocation {
  moduleId: string;
  points: number;
}

export function buildStepModuleIndex(modules: Module[]): Map<string, StepLocation> {
  const index = new Map<string, StepLocation>();
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      for (const step of lesson.steps) {
        index.set(step.id, { moduleId: mod.id, points: step.points });
      }
    }
  }
  return index;
}

export function buildModuleLearningPathIndex(
  learningPaths: LearningPath[]
): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const path of learningPaths) {
    for (const moduleId of path.moduleIds) {
      const existing = index.get(moduleId);
      if (existing) existing.push(path.id);
      else index.set(moduleId, [path.id]);
    }
  }
  return index;
}

export function isModuleComplete(mod: Module, completedStepIds: Set<string>): boolean {
  return mod.lessons.every((l) => l.steps.every((s) => completedStepIds.has(s.id)));
}

export function isLearningPathComplete(
  path: LearningPath,
  modules: Module[],
  completedStepIds: Set<string>
): boolean {
  const pathModules = path.moduleIds
    .map((id) => modules.find((m) => m.id === id))
    .filter((m): m is Module => m !== undefined);
  if (pathModules.length === 0) return false;
  return pathModules.every((m) => isModuleComplete(m, completedStepIds));
}
