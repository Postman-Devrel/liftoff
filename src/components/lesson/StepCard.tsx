"use client";

import ReactMarkdown from "react-markdown";
import { useProgress } from "@/context/ProgressContext";
import ValidateButton from "./ValidateButton";
import { Step } from "@/types/module";
import {
  CopyableCodeBlock,
  CopyableBlockquote,
} from "./CopyableBlock";

interface StepCardProps {
  step: Step;
  moduleColor?: string;
}

export default function StepCard({ step, moduleColor = "#FF6C37" }: StepCardProps) {
  const { isStepCompleted } = useProgress();
  const completed = isStepCompleted(step.id);

  return (
    <div
      className="glass-card p-6 transition-all"
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
          <h3 className="text-base font-bold text-white">
            {step.title}
          </h3>
          <div className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-strong:text-white prose-code:text-[var(--orange)] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-a:text-[var(--orange)] prose-a:no-underline hover:prose-a:underline prose-pre:overflow-x-auto prose-pre:max-w-full">
            <ReactMarkdown
              components={{
                pre: CopyableCodeBlock,
                blockquote: CopyableBlockquote,
              }}
            >{step.description}</ReactMarkdown>
          </div>
          <ValidateButton
            stepId={step.id}
            validatorId={step.validatorId}
            points={step.points}
            moduleColor={moduleColor}
          />
        </div>
      </div>
    </div>
  );
}
