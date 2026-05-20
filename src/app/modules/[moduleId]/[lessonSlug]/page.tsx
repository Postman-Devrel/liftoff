"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLesson, getModule } from "@/lib/content-loader";
import AuthGuard from "@/components/auth/AuthGuard";
import PostmanConnectionBar from "@/components/auth/PostmanConnectionBar";
import StepCard from "@/components/lesson/StepCard";
import ProgressBar from "@/components/lesson/ProgressBar";
import PointsDisplay from "@/components/scoring/PointsDisplay";
import { useProgress } from "@/context/ProgressContext";
import Link from "next/link";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.lessonSlug as string;
  const mod = getModule(params.moduleId as string);
  const lesson = getLesson(slug, mod.id);
  const { isStepCompleted, resetProgress } = useProgress();
  const prevModuleCompleteRef = useRef<boolean | null>(null);

  const allModuleSteps = mod.lessons.flatMap((l) => l.steps);
  const moduleComplete = allModuleSteps.every((s) => isStepCompleted(s.id));

  useEffect(() => {
    if (prevModuleCompleteRef.current === null) {
      prevModuleCompleteRef.current = moduleComplete;
      return;
    }
    if (moduleComplete && !prevModuleCompleteRef.current) {
      const timer = setTimeout(() => {
        router.push(`/modules/${mod.id}`);
      }, 2000);
      prevModuleCompleteRef.current = moduleComplete;
      return () => clearTimeout(timer);
    }
    prevModuleCompleteRef.current = moduleComplete;
  }, [moduleComplete, mod.id, router]);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--text-secondary)]">Lesson not found.</p>
      </div>
    );
  }

  const allCompleted = lesson.steps.every((s) => isStepCompleted(s.id));

  const lessonIndex = mod.lessons.findIndex((l) => l.slug === slug);
  const prevLesson = lessonIndex > 0 ? mod.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < mod.lessons.length - 1 ? mod.lessons[lessonIndex + 1] : null;

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
                href={`/modules/${mod.id}`}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                ←
              </Link>
              <div>
                <p
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: mod.color }}
                >
                  {mod.title}
                </p>
                <h1 className="text-lg font-bold text-white">
                  Part {lesson.partNumber}: {lesson.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PointsDisplay />
              <button
                onClick={resetProgress}
                className="px-3 py-1.5 rounded-lg text-xs text-[var(--text-tertiary)] border border-white/10 hover:bg-white/5 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="mb-6">
            <PostmanConnectionBar />
          </div>

          <ProgressBar steps={lesson.steps} />

          <div className="mt-8 flex flex-col gap-5">
            {lesson.steps.map((step) => (
              <StepCard key={step.id} step={step} moduleTitle={mod.title} moduleColor={mod.color} />
            ))}
          </div>

          <div className="mt-10 flex items-center justify-between">
            {prevLesson ? (
              <Link
                href={`/modules/${mod.id}/${prevLesson.slug}`}
                className="btn-ghost text-sm"
              >
                ← Part {prevLesson.partNumber}: {prevLesson.title}
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                href={`/modules/${mod.id}/${nextLesson.slug}`}
                className="btn-ghost text-sm"
              >
                Part {nextLesson.partNumber}: {nextLesson.title} →
              </Link>
            ) : (
              <Link href={`/modules/${mod.id}`} className="btn-ghost text-sm">
                Module Overview →
              </Link>
            )}
          </div>

          {allCompleted && (
            <div
              className="mt-8 glass-card p-8 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,108,55,0.08), rgba(139,92,246,0.08))",
              }}
            >
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold gradient-text-rainbow mb-2">
                Lesson Complete!
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                {nextLesson
                  ? `Ready for Part ${nextLesson.partNumber}: ${nextLesson.title}`
                  : "You've finished all lessons in this module!"}
              </p>
              <div className="flex gap-3 justify-center">
                {nextLesson ? (
                  <Link
                    href={`/modules/${mod.id}/${nextLesson.slug}`}
                    className="btn-primary inline-block"
                  >
                    Next Lesson →
                  </Link>
                ) : (
                  <Link href="/results" className="btn-primary inline-block">
                    View Results
                  </Link>
                )}
                <Link
                  href={`/modules/${mod.id}`}
                  className="btn-ghost inline-block"
                >
                  Module Overview
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
