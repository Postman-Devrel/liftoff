"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useProgress } from "@/context/ProgressContext";
import { getLearningPath, getModulesForLearningPath } from "@/lib/content-loader";
import NavMenu from "@/components/NavMenu";
import { Module } from "@/types/module";
import { useUtmTracking } from "@/hooks/useUtmTracking";
import InlineMarkdown from "@/components/lesson/InlineMarkdown";
import { apiPath } from "@/lib/base-path";

const BADGE_VERSION = "1";

function ModuleCard({ module }: { module: Module }) {
  const { isStepCompleted } = useProgress();
  const [imgError, setImgError] = useState(false);
  const totalSteps = module.lessons.reduce((a, l) => a + l.steps.length, 0);
  const completed = module.lessons.reduce(
    (a, l) => a + l.steps.filter((s) => isStepCompleted(s.id)).length,
    0
  );
  const percentage = totalSteps > 0 ? (completed / totalSteps) * 100 : 0;
  const allDone = completed === totalSteps && totalSteps > 0;

  return (
    <Link
      href={`/modules/${module.id}`}
      className="glass-card p-6 block hover:translate-y-[-2px] transition-all group"
      style={{ borderLeftWidth: "4px", borderLeftColor: module.color }}
    >
      <div className="flex items-start gap-4">
        {!imgError ? (
          <img
            src={apiPath(`/api/modules/${module.id}/badge?v=${BADGE_VERSION}`)}
            alt={`${module.title} badge`}
            width={56}
            height={56}
            className="w-14 h-14 rounded-2xl flex-shrink-0"
            style={{ boxShadow: `0 0 20px ${module.color}30` }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`, border: `1px solid ${module.color}30` }}
          >🛸</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-mono uppercase tracking-widest font-semibold"
              style={{ color: module.color }}
            >
              {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"} · {totalSteps} steps
            </span>
            {allDone && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                ✓ Complete
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-[var(--text-primary)] mb-1.5">
            {module.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            <InlineMarkdown>{module.description}</InlineMarkdown>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--text-tertiary)]">
            {completed}/{totalSteps} completed
          </span>
          <span className="font-mono" style={{ color: module.color }}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: module.color }}
          />
        </div>
      </div>
    </Link>
  );
}

export default function LearningPathPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = use(params);
  const path = getLearningPath(pathId);

  if (!path) notFound();

  const modules = getModulesForLearningPath(pathId);
  const { isStepCompleted } = useProgress();
  const [pathImgError, setPathImgError] = useState(false);
  useUtmTracking("learning_path", pathId);

  const totalSteps = modules.reduce(
    (a, mod) => a + mod.lessons.reduce((b, l) => b + l.steps.length, 0),
    0
  );
  const completedSteps = modules.reduce(
    (a, mod) =>
      a + mod.lessons.reduce(
        (b, l) => b + l.steps.filter((s) => isStepCompleted(s.id)).length,
        0
      ),
    0
  );
  const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const pathComplete = completedSteps === totalSteps && totalSteps > 0;

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden py-16 px-6">
        <div className="absolute top-4 right-6 z-10">
          <NavMenu />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: `radial-gradient(circle, ${path.color}, transparent)` }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-white transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Learning Paths
          </Link>

          <div className="flex items-center gap-5">
            {!pathImgError ? (
              <img
                src={apiPath(`/api/learning-paths/${path.id}/badge?v=${BADGE_VERSION}`)}
                alt={`${path.title} badge`}
                width={72}
                height={72}
                className="w-16 h-16 rounded-2xl flex-shrink-0"
                style={{ boxShadow: `0 0 30px ${path.color}40` }}
                onError={() => setPathImgError(true)}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${path.color}30, ${path.color}10)`, border: `2px solid ${path.color}40` }}
              >🛸</div>
            )}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: path.color }}>
                Learning Path
              </p>
              <h1 className="text-3xl font-black text-white">{path.title}</h1>
            </div>
          </div>

          <p className="mt-4 text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            <InlineMarkdown>{path.description}</InlineMarkdown>
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[var(--text-tertiary)]">
                    {modules.length} {modules.length === 1 ? "module" : "modules"} · {completedSteps}/{totalSteps} steps
                  </span>
                  <span className="font-mono font-bold" style={{ color: path.color }}>
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%`, background: path.color }}
                  />
                </div>
              </div>
              {pathComplete && (
                <span className="flex-shrink-0 text-xs font-mono px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  ✓ Path Complete
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        <div className="flex flex-col gap-4">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
          {modules.length === 0 && (
            <div className="glass-card p-8 text-center border-dashed">
              <p className="text-[var(--text-tertiary)] text-sm">No modules in this path yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
