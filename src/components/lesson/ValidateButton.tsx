"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { ValidationResult } from "@/types/validation";

interface ValidateButtonProps {
  stepId: string;
  validatorId: string;
  points: number;
  moduleColor?: string;
}

export default function ValidateButton({
  stepId,
  validatorId,
  points,
  moduleColor = "#FF6C37",
}: ValidateButtonProps) {
  const { apiKey, isAuthenticated, setAuth } = useAuth();
  const { isStepCompleted, completeStep, validationContext } = useProgress();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [key, setKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);

  const completed = isStepCompleted(stepId);

  async function handleConnectAndValidate(e: React.FormEvent) {
    e.preventDefault();
    setKeyError("");
    setKeyLoading(true);

    try {
      const res = await fetch("/api/postman/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        setAuth(key.trim(), data.profile);
        setShowKeyPrompt(false);
        setKey("");
      } else {
        setKeyError(data.message || "Invalid API key");
      }
    } catch {
      setKeyError("Failed to validate API key.");
    } finally {
      setKeyLoading(false);
    }
  }

  async function handleValidate() {
    if (!apiKey || completed) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/postman/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          validatorId,
          apiKey,
          context: validationContext,
        }),
      });
      const data: ValidationResult = await res.json();
      setResult(data);

      if (data.success) {
        completeStep(stepId, points, data.context);
      }
    } catch {
      setResult({
        success: false,
        message: "Failed to validate. Please try again.",
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
    if (showKeyPrompt) {
      return (
        <div className="mt-4">
          <form onSubmit={handleConnectAndValidate} className="flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="PMAK-..."
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--orange)]"
              required
            />
            <button
              type="submit"
              disabled={keyLoading || !key.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--orange)] hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {keyLoading ? "..." : "Connect"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowKeyPrompt(false);
                setKey("");
                setKeyError("");
              }}
              className="px-3 py-2 rounded-lg text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            >
              Cancel
            </button>
          </form>
          {keyError && <p className="text-xs text-[var(--pink)] mt-2">{keyError}</p>}
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            <a
              href="https://go.postman.co/settings/me/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--orange)] hover:underline"
            >
              Get a Postman API key →
            </a>
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <button
          onClick={() => setShowKeyPrompt(true)}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{
            background: moduleColor,
            boxShadow: `0 4px 16px ${moduleColor}30`,
          }}
        >
          Connect Postman to Validate
        </button>
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
        {loading ? "Validating..." : "Validate"}
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
