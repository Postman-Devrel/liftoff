"use client";

import { useState } from "react";
import { Module } from "@/types/module";
import { useProgress } from "@/context/ProgressContext";
import { apiPath } from "@/lib/base-path";

interface ModuleBadgeProps {
  module: Module;
  size?: number;
}

export default function ModuleBadge({ module, size = 120 }: ModuleBadgeProps) {
  const { isStepCompleted } = useProgress();
  const [imgError, setImgError] = useState(false);

  const totalSteps = module.lessons.reduce((a, l) => a + l.steps.length, 0);
  const completed = module.lessons.reduce(
    (a, l) => a + l.steps.filter((s) => isStepCompleted(s.id)).length,
    0
  );
  const allDone = completed === totalSteps && totalSteps > 0;

  if (!allDone) {
    return (
      <div
        className="rounded-2xl flex items-center justify-center opacity-30 grayscale"
        style={{
          width: size,
          height: size,
          background: `${module.color}10`,
          border: `2px dashed ${module.color}40`,
        }}
      >
        <span className="text-4xl">{module.icon}</span>
      </div>
    );
  }

  if (imgError) {
    return (
      <div
        className="rounded-2xl flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
          border: `2px solid ${module.color}60`,
          boxShadow: `0 0 30px ${module.color}20`,
        }}
      >
        <span className="text-5xl">{module.icon}</span>
      </div>
    );
  }

  return (
    <img
      src={apiPath(`/api/modules/${module.id}/badge/?v=${Date.now().toString(36)}`)}
      alt={`${module.title} badge`}
      width={size}
      height={size}
      className="rounded-2xl"
      style={{ boxShadow: `0 0 30px ${module.color}30` }}
      onError={() => setImgError(true)}
    />
  );
}
