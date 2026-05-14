"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getModule } from "@/lib/content-loader";
import { useProgress } from "@/context/ProgressContext";
import AuthGuard from "@/components/auth/AuthGuard";
import PostmanConnectionBar from "@/components/auth/PostmanConnectionBar";
import PointsDisplay from "@/components/scoring/PointsDisplay";
import ModuleBadge from "@/components/scoring/ModuleBadge";

export default function ModuleOverviewPage() {
  const params = useParams();
  const mod = getModule(params.moduleId as string);
  const { isStepCompleted, resetModule } = useProgress();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  const totalSteps = mod.lessons.reduce((a, l) => a + l.steps.length, 0);
  const completedTotal = mod.lessons.reduce(
    (a, l) => a + l.steps.filter((s) => isStepCompleted(s.id)).length,
    0
  );
  const overallPct = totalSteps > 0 ? (completedTotal / totalSteps) * 100 : 0;

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <nav
          className="sticky top-0 z-10 border-b border-[var(--glass-border)] px-6 py-4"
          style={{ background: "rgba(7,0,15,0.92)", backdropFilter: "blur(16px)" }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                ←
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  {!imgError ? (
                    <img
                      src={`/api/modules/${mod.id}/badge?v=${Date.now().toString(36)}`}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-lg"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span>{mod.icon}</span>
                  )}
                  {mod.title}
                </h1>
              </div>
            </div>
            <PointsDisplay />
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-6">
            <PostmanConnectionBar />
          </div>

          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            {mod.description}
          </p>

          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">
                {completedTotal} of {totalSteps} steps completed
              </span>
              <div className="flex items-center gap-3">
                {completedTotal > 0 && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-xs text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                  >
                    Reset module
                  </button>
                )}
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  {Math.round(overallPct)}%
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${overallPct}%`,
                  background:
                    "linear-gradient(90deg, var(--orange), var(--pink), var(--purple), var(--cyan))",
                }}
              />
            </div>
          </div>

          {completedTotal === totalSteps && totalSteps > 0 && (
            <div
              className="glass-card p-8 mb-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,108,55,0.08), rgba(139,92,246,0.08))",
              }}
            >
              <div className="flex justify-center mb-4">
                <ModuleBadge module={mod} size={140} />
              </div>
              <h2 className="text-2xl font-bold gradient-text-rainbow mb-2">
                Module Complete!
              </h2>
              <p className="text-[var(--text-secondary)]">
                You earned the {mod.title} badge.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {mod.lessons.map((lesson) => {
              const completed = lesson.steps.filter((s) =>
                isStepCompleted(s.id)
              ).length;
              const pct =
                lesson.steps.length > 0
                  ? (completed / lesson.steps.length) * 100
                  : 0;
              const allDone = completed === lesson.steps.length;

              return (
                <Link
                  key={lesson.id}
                  href={`/modules/${mod.id}/${lesson.slug}`}
                  className="glass-card p-6 block hover:translate-y-[-2px] transition-all group"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: allDone ? "var(--green)" : mod.color,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        background: allDone
                          ? "rgba(16,185,129,0.15)"
                          : `${mod.color}15`,
                        color: allDone ? "var(--green)" : mod.color,
                      }}
                    >
                      {allDone ? "✓" : `P${lesson.partNumber}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[10px] font-mono uppercase tracking-widest font-semibold"
                          style={{ color: allDone ? "var(--green)" : mod.color }}
                        >
                          Part {lesson.partNumber} · {lesson.steps.length} steps
                        </span>
                        {allDone && (
                          <span className="text-[10px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[var(--green)]/10 text-[var(--green)]">
                            Done
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {lesson.title}
                      </h3>
                    </div>
                    <span className="font-mono text-sm text-[var(--text-tertiary)]">
                      {completed}/{lesson.steps.length}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: allDone ? "var(--green)" : mod.color,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </main>

        {showResetConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowResetConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="relative glass-card p-8 max-w-sm mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-2">Reset {mod.title}?</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                This will clear all {completedTotal} completed step{completedTotal !== 1 ? "s" : ""} and
                deduct {completedTotal * 10} points. You can redo the module from scratch.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const allStepIds = mod.lessons.flatMap((l) =>
                      l.steps.map((s) => s.id)
                    );
                    resetModule(allStepIds, 10);
                    setShowResetConfirm(false);
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition-colors"
                >
                  Reset Module
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
