"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { apiPath } from "@/lib/base-path";

export default function SettingsPage() {
  const { profile, isAuthenticated, setAuth, clearApiKey } = useAuth();
  const { points, resetProgress } = useProgress();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(apiPath("/api/postman/validate-key"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        setAuth(data.profile);
        setKey("");
      } else {
        setError(data.message || "Invalid API key");
      }
    } catch {
      setError("Failed to validate API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-10 border-b border-[var(--glass-border)] px-6 py-4"
        style={{ background: "rgba(7,0,15,0.92)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            ←
          </Link>
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-1">Postman API Key</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Your API key connects LiftOff to your Postman account. It&apos;s used to
            validate exercises across all modules.
          </p>

          {isAuthenticated && profile ? (
            <div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--green)]/8 border border-[var(--green)]/20 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--green)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    Connected as @{profile.username}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {profile.fullName} · {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => clearApiKey()}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div>
              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <label
                    htmlFor="api-key"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                  >
                    API Key
                  </label>
                  <input
                    id="api-key"
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="PMAK-..."
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !key.trim()}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--orange)] hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {loading ? "Connecting..." : "Connect"}
                </button>
              </form>
              {error && (
                <p className="text-sm text-[var(--pink)] mt-3">{error}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)] mt-4">
                Don&apos;t have a key?{" "}
                <a
                  href="https://go.postman.co/settings/me/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--orange)] hover:underline"
                >
                  Generate one in Postman →
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="glass-card p-8 mt-6">
          <h2 className="text-xl font-bold text-white mb-1">Reset All Progress</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            This will permanently erase all your completed steps, points, and earned
            ranks across every module. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={points === 0}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Reset all progress
          </button>
        </div>
      </main>

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowResetConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative glass-card p-8 max-w-sm mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              You currently have <span className="text-white font-bold">{points} points</span>.
              Resetting will erase all progress across every module.
            </p>
            <p className="text-xs text-[var(--pink)] mb-6">
              This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition-colors"
              >
                Reset everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
