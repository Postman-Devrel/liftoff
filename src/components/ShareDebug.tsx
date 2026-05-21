"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";

interface DebugInfo {
  username: string;
  workspaceId: string;
  workspaceName: string;
  collections: { name: string; uid: string }[];
}

interface ShareDebugProps {
  moduleId: string;
}

export default function ShareDebug({ moduleId }: ShareDebugProps) {
  const { isAuthenticated } = useAuth();
  const { validationContext } = useProgress();
  const [info, setInfo] = useState<DebugInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function fetchDebug() {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    setInfo(null);

    try {
      const res = await fetch("/api/postman/debug-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, context: validationContext }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setInfo(data);
      }
    } catch {
      setError("Failed to fetch debug info.");
    } finally {
      setLoading(false);
    }
  }

  function handleToggle() {
    if (!open) {
      setOpen(true);
      if (!info && !error) fetchDebug();
    } else {
      setOpen(false);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mt-12 pt-6 border-t border-white/5">
      <button
        onClick={handleToggle}
        className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        {open ? "Hide debug info" : "Share debug info"}
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs">
          {loading && (
            <p className="text-[var(--text-tertiary)]">Loading...</p>
          )}
          {error && <p className="text-[var(--pink)]">{error}</p>}
          {info && (
            <div className="space-y-2 text-[var(--text-secondary)]">
              <div>
                <span className="text-[var(--text-tertiary)]">Username: </span>
                <span className="text-white">{info.username}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Workspace: </span>
                <span className="text-white">{info.workspaceName}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Workspace ID: </span>
                <span className="text-white select-all">{info.workspaceId}</span>
              </div>
              {info.collections.length > 0 && (
                <div>
                  <span className="text-[var(--text-tertiary)]">Collections:</span>
                  <ul className="mt-1 ml-3 space-y-0.5">
                    {info.collections.map((c) => (
                      <li key={c.uid}>
                        <span className="text-white">{c.name}</span>
                        <span className="text-[var(--text-tertiary)]"> ({c.uid})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {info.collections.length === 0 && (
                <div>
                  <span className="text-[var(--text-tertiary)]">Collections: </span>
                  <span className="text-white">None found</span>
                </div>
              )}
              <button
                onClick={() => {
                  const text = [
                    `Username: ${info.username}`,
                    `Workspace: ${info.workspaceName}`,
                    `Workspace ID: ${info.workspaceId}`,
                    `Collections: ${info.collections.map((c) => `${c.name} (${c.uid})`).join(", ") || "None"}`,
                  ].join("\n");
                  navigator.clipboard.writeText(text);
                }}
                className="mt-2 px-3 py-1 rounded-lg text-[10px] font-semibold text-[var(--text-tertiary)] bg-white/5 hover:bg-white/10 transition-colors"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
