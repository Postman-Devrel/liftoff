"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useProgress } from "@/context/ProgressContext";
import ValidateButton from "./ValidateButton";
import DiscordHelpButton from "./DiscordHelpButton";
import { Step } from "@/types/module";
import {
  CopyableCodeBlock,
  CopyableBlockquote,
} from "./CopyableBlock";

interface StepCardProps {
  step: Step;
  moduleTitle: string;
  moduleColor?: string;
}

export default function StepCard({ step, moduleTitle, moduleColor = "#FF6C37" }: StepCardProps) {
  const [stepUrl, setStepUrl] = useState("");
  const [lastError, setLastError] = useState("");
  useEffect(() => {
    setStepUrl(`${window.location.origin}${window.location.pathname}#${step.id}`);
  }, [step.id]);
  const { isStepCompleted } = useProgress();
  const completed = isStepCompleted(step.id);

  return (
    <div
      id={step.id}
      className="glass-card p-6 transition-all scroll-mt-24"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: completed ? "var(--green)" : moduleColor,
        background: completed ? "rgba(16, 185, 129, 0.04)" : undefined,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors"
          style={{
            borderColor: completed ? "var(--green)" : moduleColor,
            background: completed ? "var(--green)" : "transparent",
            color: completed ? "white" : moduleColor,
          }}
        >
          {completed ? "✓" : step.stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white">
              {step.title}
            </h3>
            <DiscordHelpButton
              stepId={step.id}
              stepTitle={step.title}
              moduleTitle={moduleTitle}
              stepUrl={stepUrl}
              errorMessage={lastError}
            />
          </div>
          <div className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-[var(--orange)] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-a:text-[var(--orange)] prose-a:no-underline hover:prose-a:underline prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:border-collapse prose-th:border prose-th:border-white/10 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:text-white prose-th:bg-white/5 prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: CopyableCodeBlock,
                blockquote: CopyableBlockquote,
              }}
            >{step.description}</ReactMarkdown>
          </div>
          <ValidateButton
            stepId={step.id}
            stepTitle={step.title}
            validatorId={step.validatorId}
            points={step.points}
            manual={step.manual}
            moduleColor={moduleColor}
            onError={setLastError}
          />
        </div>
      </div>
    </div>
  );
}
