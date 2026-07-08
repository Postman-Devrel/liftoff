"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { getAllModules, getAllLearningPaths, getModulesForLearningPath } from "@/lib/content-loader";
import { calculateRank, getNextRank } from "@/lib/scoring";
import RankBadge from "@/components/scoring/RankBadge";
import NavMenu from "@/components/NavMenu";
import InlineMarkdown from "@/components/lesson/InlineMarkdown";
import { LearningPath } from "@/types/learning-path";
import { Module } from "@/types/module";

const BADGE_VERSION = "1";

function ProfileSection() {
  const { isRegistered, discordProfile, signInWithDiscord, signOut } = useAuth();
  const { points } = useProgress();
  const rank = calculateRank(points);
  const next = getNextRank(points);

  if (!isRegistered || !discordProfile) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-xl font-bold text-white mb-2">
          Join LiftOff
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          Sign in with Discord to save your progress, earn ranks, and track
          your learning.
        </p>
        <button onClick={signInWithDiscord} className="btn-primary inline-flex items-center gap-2">
          <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.7 40.7 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1 0A60.4 60.4 0 00.4 45.1a.3.3 0 000 .2A58.8 58.8 0 0018.1 55a.2.2 0 00.2-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.6.2.2 0 01 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.6 58.6 0 0070.6 45.3a.2.2 0 000-.2A60 60 0 0060.2 5a.2.2 0 00-.1 0zM23.7 37a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1zm23.6 0a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1z" />
          </svg>
          Sign in with Discord
        </button>
        <p className="text-xs text-[var(--text-tertiary)] mt-4">
          Or browse learning paths below — connect Postman when you&apos;re ready to validate.
        </p>
      </div>
    );
  }

  const progressToNext = next
    ? ((points - rank.minPoints) / (next.minPoints - rank.minPoints)) * 100
    : 100;

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-4 mb-6">
        {discordProfile.avatarUrl ? (
          <img
            src={discordProfile.avatarUrl}
            alt={discordProfile.displayName}
            className="w-14 h-14 rounded-full border-2 border-[#5865F2]"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#5865F2] flex items-center justify-center text-2xl font-bold text-white">
            {discordProfile.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white truncate">
              {discordProfile.displayName}
            </h2>
            <span className="flex-shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#5865F2]/15 text-[#5865F2] border border-[#5865F2]/20">
              Discord
            </span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] truncate">
            @{discordProfile.username}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Settings
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <RankBadge title={rank.title} badgeImg={rank.badgeImg} badgeImgFull={rank.badgeImgFull} size={80} variant="full" />
        <div>
          <p className="font-bold text-white">{rank.title}</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {rank.description}
          </p>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-mono font-bold text-[var(--orange)]">
            {points} pts
          </span>
          {next && (
            <span className="text-[var(--text-tertiary)]">
              {next.minPoints - points} pts to {next.title}
            </span>
          )}
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(progressToNext, 100)}%`,
              background: "linear-gradient(90deg, var(--orange), var(--pink), var(--purple), var(--cyan))",
            }}
          />
        </div>
      </div>

      <BadgeRow points={points} />
      <EarnedBadges />
    </div>
  );
}

function BadgeRow({ points }: { points: number }) {
  const milestones = [
    { pts: 50, icon: "🚀", label: "50" },
    { pts: 100, icon: "🌍", label: "100" },
    { pts: 500, icon: "🌙", label: "500" },
    { pts: 1000, icon: "☄️", label: "1K" },
    { pts: 5000, icon: "⭐", label: "5K" },
    { pts: 10000, icon: "🌌", label: "10K" },
  ];

  const lastEarnedIdx = milestones.reduce(
    (acc, m, i) => (points >= m.pts ? i : acc),
    -1
  );

  return (
    <div className="mt-4">
      <div className="flex items-center gap-0">
        {milestones.map((m, i) => {
          const earned = points >= m.pts;
          const isTrail = i <= lastEarnedIdx;
          return (
            <div key={m.pts} className="flex items-center flex-1">
              <div
                className={`flex flex-col items-center flex-1 py-2 rounded-lg transition-all ${
                  earned ? "bg-white/5" : "opacity-30"
                }`}
                title={`${m.pts} points`}
              >
                <span className={`text-lg ${earned ? "" : "grayscale"}`}>
                  {m.icon}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] mt-0.5">
                  {m.label}
                </span>
              </div>
              {i < milestones.length - 1 && (
                <div
                  className={`h-0.5 w-2 flex-shrink-0 rounded-full transition-colors ${
                    isTrail && i < lastEarnedIdx ? "bg-[var(--orange)]" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EarnedBadges() {
  const modules = getAllModules();
  const learningPaths = getAllLearningPaths();
  const { isStepCompleted } = useProgress();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const earnedModules = modules.filter((mod) => {
    const total = mod.lessons.reduce((a, l) => a + l.steps.length, 0);
    const done = mod.lessons.reduce(
      (a, l) => a + l.steps.filter((s) => isStepCompleted(s.id)).length,
      0
    );
    return done === total && total > 0;
  });

  const earnedPaths = learningPaths.filter((path) => {
    const pathModules = getModulesForLearningPath(path.id);
    if (pathModules.length === 0) return false;
    return pathModules.every((mod) => {
      const total = mod.lessons.reduce((a, l) => a + l.steps.length, 0);
      const done = mod.lessons.reduce(
        (a, l) => a + l.steps.filter((s) => isStepCompleted(s.id)).length,
        0
      );
      return done === total && total > 0;
    });
  });

  if (earnedModules.length === 0 && earnedPaths.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-white/5">
      <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
        Earned Badges
      </p>
      <div className="flex gap-3 flex-wrap">
        {earnedPaths.map((path) => (
          <Link
            key={`path-${path.id}`}
            href={`/learning-paths/${path.id}`}
            className="group relative"
            title={`${path.title} Path`}
          >
            {!imgErrors[`path-${path.id}`] ? (
              <img
                src={`/api/learning-paths/${path.id}/badge?v=${BADGE_VERSION}`}
                alt={`${path.title} path badge`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl transition-transform group-hover:scale-110"
                style={{ boxShadow: `0 0 16px ${path.color}30` }}
                onError={() => setImgErrors((prev) => ({ ...prev, [`path-${path.id}`]: true }))}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${path.color}40, ${path.color}15)`,
                  border: `2px solid ${path.color}60`,
                }}
              >🛸</div>
            )}
          </Link>
        ))}
        {earnedModules.map((mod) => (
          <Link
            key={mod.id}
            href={`/modules/${mod.id}`}
            className="group relative"
            title={mod.title}
          >
            {!imgErrors[mod.id] ? (
              <img
                src={`/api/modules/${mod.id}/badge?v=${BADGE_VERSION}`}
                alt={`${mod.title} badge`}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl transition-transform group-hover:scale-110"
                style={{ boxShadow: `0 0 16px ${mod.color}30` }}
                onError={() => setImgErrors((prev) => ({ ...prev, [mod.id]: true }))}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${mod.color}40, ${mod.color}15)`,
                  border: `2px solid ${mod.color}60`,
                }}
              >🛸</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function LearningPathCard({ path }: { path: LearningPath }) {
  const { isStepCompleted } = useProgress();
  const [imgError, setImgError] = useState(false);
  const pathModules = getModulesForLearningPath(path.id);

  const totalSteps = pathModules.reduce(
    (a, mod) => a + mod.lessons.reduce((b, l) => b + l.steps.length, 0),
    0
  );
  const completedSteps = pathModules.reduce(
    (a, mod) =>
      a + mod.lessons.reduce(
        (b, l) => b + l.steps.filter((s) => isStepCompleted(s.id)).length,
        0
      ),
    0
  );
  const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Link
      href={`/learning-paths/${path.id}`}
      className="glass-card p-6 block hover:translate-y-[-2px] transition-all group"
      style={{ borderLeftWidth: "4px", borderLeftColor: path.color }}
    >
      <div className="flex items-start gap-4">
        {!imgError ? (
          <img
            src={`/api/learning-paths/${path.id}/badge?v=${BADGE_VERSION}`}
            alt={`${path.title} badge`}
            width={56}
            height={56}
            className="w-14 h-14 rounded-2xl flex-shrink-0"
            style={{ boxShadow: `0 0 20px ${path.color}30` }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${path.color}30, ${path.color}10)`, border: `1px solid ${path.color}30` }}
          >🛸</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-mono uppercase tracking-widest font-semibold"
              style={{ color: path.color }}
            >
              {pathModules.length} {pathModules.length === 1 ? "module" : "modules"} · {totalSteps} steps
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-[var(--text-primary)] mb-1.5">
            {path.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            <InlineMarkdown>{path.description}</InlineMarkdown>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[var(--text-tertiary)]">
            {completedSteps}/{totalSteps} steps completed
          </span>
          <span className="font-mono" style={{ color: path.color }}>
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, background: path.color }}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        {pathModules.map((mod) => (
          <span
            key={mod.id}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{
              background: `${mod.color}15`,
              color: mod.color,
              border: `1px solid ${mod.color}30`,
            }}
          >
            {mod.icon} {mod.title}
          </span>
        ))}
      </div>
    </Link>
  );
}

function ModuleCard({ module }: { module: Module }) {
  const { isStepCompleted } = useProgress();
  const [imgError, setImgError] = useState(false);
  const totalSteps = module.lessons.reduce((a, l) => a + l.steps.length, 0);
  const completed = module.lessons.reduce(
    (a, l) => a + l.steps.filter((s) => isStepCompleted(s.id)).length,
    0
  );
  const percentage = totalSteps > 0 ? (completed / totalSteps) * 100 : 0;

  return (
    <Link
      href={`/modules/${module.id}`}
      className="glass-card p-6 block hover:translate-y-[-2px] transition-all group"
      style={{ borderLeftWidth: "4px", borderLeftColor: module.color }}
    >
      <div className="flex items-start gap-4">
        {!imgError ? (
          <img
            src={`/api/modules/${module.id}/badge?v=${BADGE_VERSION}`}
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

export default function Home() {
  const learningPaths = getAllLearningPaths();
  const allModules = getAllModules();
  const [view, setView] = useState<"paths" | "modules">("paths");

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden py-20 px-6">
        <div className="absolute top-4 right-6 z-10">
          <NavMenu />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--purple), transparent)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, var(--orange), transparent)" }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--orange)]/10 border border-[var(--orange)]/20 text-[var(--orange)] text-sm font-medium mb-8">
            <img src="/postman-logo.png" alt="Postman" className="h-5 w-auto object-contain" />
            <span>Powered by Postman</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-4">
            <span className="text-white">Lift</span>
            <span className="gradient-text">Off</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Interactive, hands-on learning modules with{" "}
            <span className="text-white font-medium">real-time API validation</span>.
            Complete steps in Postman, validate your work, earn your rank.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ProfileSection />
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="mb-6 flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
              <button
                onClick={() => setView("paths")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === "paths"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Learning Paths
                <span className={`ml-2 text-xs font-mono ${view === "paths" ? "text-[var(--orange)]" : "text-[var(--text-tertiary)]"}`}>
                  {learningPaths.length}
                </span>
              </button>
              <button
                onClick={() => setView("modules")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === "modules"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Modules
                <span className={`ml-2 text-xs font-mono ${view === "modules" ? "text-[var(--orange)]" : "text-[var(--text-tertiary)]"}`}>
                  {allModules.length}
                </span>
              </button>
            </div>

            {view === "paths" && (
              <div className="flex flex-col gap-4">
                {learningPaths.map((path) => (
                  <LearningPathCard key={path.id} path={path} />
                ))}
                {learningPaths.length === 0 && (
                  <div className="glass-card p-6 text-center border-dashed">
                    <p className="text-[var(--text-tertiary)] text-sm">No learning paths available yet.</p>
                  </div>
                )}
              </div>
            )}

            {view === "modules" && (
              <div className="flex flex-col gap-4">
                {allModules.map((mod) => (
                  <ModuleCard key={mod.id} module={mod} />
                ))}
                {allModules.length === 0 && (
                  <div className="glass-card p-6 text-center border-dashed">
                    <p className="text-[var(--text-tertiary)] text-sm">No modules available yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
