"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { profile, isAuthenticated, setAuth, clearApiKey } = useAuth();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/postman/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key.trim() }),
      });
      const data = await res.json();

      if (data.valid) {
        setAuth(key.trim(), data.profile);
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
      </main>
    </div>
  );
}
