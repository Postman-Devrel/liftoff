"use client";

import { useProgress } from "@/context/ProgressContext";
import { calculateRank, getNextRank } from "@/lib/scoring";
import { getAllModules } from "@/lib/content-loader";
import ModuleBadge from "@/components/scoring/ModuleBadge";
import RankBadge from "@/components/scoring/RankBadge";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";

export default function ResultsPage() {
  const { points, completedSteps, isStepCompleted } = useProgress();
  const rank = calculateRank(points);
  const next = getNextRank(points);
  const modules = getAllModules();

  const totalSteps = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + l.steps.length, 0),
    0
  );
  const completedCount = Object.keys(completedSteps).length;

  const completedModules = modules.filter((mod) => {
    const total = mod.lessons.reduce((a, l) => a + l.steps.length, 0);
    const done = mod.lessons.reduce(
      (a, l) => a + l.steps.filter((s) => isStepCompleted(s.id)).length,
      0
    );
    return done === total && total > 0;
  });

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 py-12">
      <div
        className="glass-card p-10 text-center max-w-md w-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,108,55,0.06), rgba(139,92,246,0.06))",
        }}
      >
        <div className="flex justify-center mb-6">
          <RankBadge title={rank.title} badgeImg={rank.badgeImg} badgeImgFull={rank.badgeImgFull} size={160} variant="full" />
        </div>
        <h1 className="text-3xl font-bold gradient-text-rainbow mb-2">
          {rank.title}
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">{rank.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-3xl font-bold font-mono text-[var(--orange)]">
              {points}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Points</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-3xl font-bold font-mono text-white">
              {completedCount}/{totalSteps}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Steps</p>
          </div>
        </div>

        {completedModules.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
              Module Badges Earned
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {completedModules.map((mod) => (
                <div key={mod.id} className="flex flex-col items-center gap-2">
                  <ModuleBadge module={mod} size={80} />
                  <span className="text-xs text-[var(--text-secondary)]">
                    {mod.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {next && (
          <p className="text-sm text-[var(--text-tertiary)] mb-8">
            {next.minPoints - points} more points to reach{" "}
            <span className="text-[var(--text-secondary)] font-medium">
              {next.title}
            </span>
          </p>
        )}

        <div className="mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
            Share Your Progress
          </p>
          <ShareButtons
            text={`I've earned ${points} points and reached ${rank.title} rank on LiftOff by @getpostman!${completedModules.length > 0 ? ` Completed ${completedModules.length} module${completedModules.length > 1 ? "s" : ""}!` : ""}`}
            shareType="rank"
            shareId={rank.id}
          />
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary inline-block">
            Dashboard
          </Link>
          <Link href="/" className="btn-ghost inline-block">
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
