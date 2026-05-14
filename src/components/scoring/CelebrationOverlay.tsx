"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { useProgress } from "@/context/ProgressContext";
import { calculateRank } from "@/lib/scoring";
import { getAllModules } from "@/lib/content-loader";
import RankBadge from "@/components/scoring/RankBadge";

interface Celebration {
  type: "rank-up" | "module-complete";
  title: string;
  subtitle: string;
  badge: string;
  badgeImg?: string;
  badgeImgFull?: string;
  color: string;
}

export default function CelebrationOverlay() {
  const { points, completedSteps, isHydrated } = useProgress();
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const prevPointsRef = useRef<number | null>(null);
  const prevCompletedRef = useRef<Record<string, boolean> | null>(null);

  const fireConfetti = useCallback(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#FF6C37", "#8B5CF6", "#06B6D4", "#EC4899", "#F59E0B"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#FF6C37", "#8B5CF6", "#06B6D4", "#EC4899", "#F59E0B"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (prevPointsRef.current === null) {
      prevPointsRef.current = points;
      prevCompletedRef.current = completedSteps;
      return;
    }

    if (points === prevPointsRef.current) return;

    const prevRank = calculateRank(prevPointsRef.current);
    const newRank = calculateRank(points);

    const modules = getAllModules();
    let moduleCelebration: Celebration | null = null;

    for (const mod of modules) {
      const totalSteps = mod.lessons.reduce((a, l) => a + l.steps.length, 0);
      const nowCompleted = mod.lessons.reduce(
        (a, l) => a + l.steps.filter((s) => completedSteps[s.id]).length,
        0
      );
      const prevCompleted = mod.lessons.reduce(
        (a, l) =>
          a +
          l.steps.filter((s) => prevCompletedRef.current?.[s.id]).length,
        0
      );

      if (
        nowCompleted === totalSteps &&
        prevCompleted < totalSteps &&
        totalSteps > 0
      ) {
        moduleCelebration = {
          type: "module-complete",
          title: "Module Complete!",
          subtitle: `You finished ${mod.title}`,
          badge: mod.icon,
          badgeImg: `/api/modules/${mod.id}/badge?v=${Date.now().toString(36)}`,
          color: mod.color,
        };
        break;
      }
    }

    if (newRank.id !== prevRank.id && points > prevPointsRef.current) {
      setCelebration({
        type: "rank-up",
        title: "Rank Up!",
        subtitle: `You reached ${newRank.title}`,
        badge: newRank.badge,
        badgeImg: newRank.badgeImg,
        badgeImgFull: newRank.badgeImgFull,
        color: "#8B5CF6",
      });
      fireConfetti();
    } else if (moduleCelebration) {
      setCelebration(moduleCelebration);
      fireConfetti();
    }

    prevPointsRef.current = points;
    prevCompletedRef.current = completedSteps;
  }, [points, completedSteps, isHydrated, fireConfetti]);

  if (!celebration) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => setCelebration(null)}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative glass-card p-10 text-center max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-300"
        style={{
          border: `2px solid ${celebration.color}60`,
          boxShadow: `0 0 60px ${celebration.color}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {celebration.badgeImgFull && celebration.type === "rank-up" ? (
          <div className="flex justify-center mb-6">
            <RankBadge
              title={celebration.subtitle.replace("You reached ", "")}
              badgeImg={celebration.badgeImg || ""}
              badgeImgFull={celebration.badgeImgFull}
              size={160}
              variant="full"
            />
          </div>
        ) : celebration.badgeImg ? (
          <img
            src={celebration.badgeImg}
            alt=""
            width={120}
            height={120}
            className="w-30 h-30 rounded-2xl mx-auto mb-6"
            style={{ boxShadow: `0 0 40px ${celebration.color}30` }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="text-7xl mb-6">{celebration.badge}</div>
        )}
        <h2
          className="text-3xl font-black mb-2"
          style={{
            background: `linear-gradient(135deg, ${celebration.color}, #EC4899)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {celebration.title}
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-6">
          {celebration.subtitle}
        </p>
        <button
          onClick={() => setCelebration(null)}
          className="px-6 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105"
          style={{ background: celebration.color }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
