"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { ValidationResult } from "@/types/validation";
import { apiPath } from "@/lib/base-path";

interface ValidateButtonProps {
  stepId: string;
  stepTitle: string;
  validatorId: string;
  points: number;
  manual?: boolean;
  moduleColor?: string;
  onError?: (message: string) => void;
}

export default function ValidateButton({
  stepId,
  validatorId,
  points,
  manual,
  moduleColor = "#FF6C37",
  onError,
}: ValidateButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isStepCompleted, completeStep, validationContext } = useProgress();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const completed = isStepCompleted(stepId);

  async function handleValidate() {
    if (completed) return;
    setLoading(true);
    setResult(null);

    if (manual) {
      onError?.("");
      completeStep(stepId, points, validationContext);
      setResult({ success: true, message: "Step completed.", pointsAwarded: points });
      setLoading(false);
      return;
    }

    if (!isAuthenticated) return;

    try {
      const res = await fetch(apiPath("/api/postman/validate/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          validatorId,
          context: validationContext,
          apiKey: sessionStorage.getItem("postman_api_key"),
        }),
      });
      const data: ValidationResult = await res.json();
      setResult(data);

      if (data.success) {
        onError?.("");
        completeStep(stepId, points, data.context);
      } else {
        onError?.(data.message);
      }
    } catch {
      const msg = "Failed to validate. Please try again.";
      onError?.(msg);
      setResult({
        success: false,
        message: msg,
        pointsAwarded: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[var(--green)]/10 border border-[var(--green)]/25">
        <span className="text-[var(--green)]">✓</span>
        <span className="text-[var(--green)] font-medium text-sm">
          Completed · +{points} pts
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-4">
        <Link
          href="/settings"
          className="inline-flex px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{
            background: moduleColor,
            boxShadow: `0 4px 16px ${moduleColor}30`,
          }}
        >
          Connect Postman to Validate →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleValidate}
        disabled={loading}
        className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 hover:opacity-90"
        style={{
          background: moduleColor,
          boxShadow: `0 4px 16px ${moduleColor}30`,
        }}
      >
        {loading ? (manual ? "Completing..." : "Validating...") : (manual ? "Done" : "Validate")}
      </button>
      {result && !result.success && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-[var(--pink)]/8 border border-[var(--pink)]/20">
          <p className="text-[var(--pink)] text-sm">{result.message}</p>
        </div>
      )}
      {result && result.success && !completed && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-[var(--green)]/8 border border-[var(--green)]/20">
          <p className="text-[var(--green)] text-sm">{result.message}</p>
        </div>
      )}
    </div>
  );
}
