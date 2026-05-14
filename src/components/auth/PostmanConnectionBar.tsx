"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PostmanConnectionBar() {
  const { apiKey, profile, isAuthenticated, setAuth, clearApiKey } = useAuth();
  const [showForm, setShowForm] = useState(false);
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
        setShowForm(false);
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

  if (isAuthenticated && profile) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--orange)]/8 border border-[var(--orange)]/15">
        <div className="w-2 h-2 rounded-full bg-[var(--green)] flex-shrink-0" />
        <span className="text-sm text-[var(--text-secondary)] flex-1 min-w-0 truncate">
          Connected as <span className="text-white font-medium">@{profile.username}</span>
        </span>
        <button
          onClick={() => {
            clearApiKey();
            setShowForm(true);
          }}
          className="text-xs text-[var(--orange)] hover:underline flex-shrink-0"
        >
          Switch org
        </button>
        <button
          onClick={clearApiKey}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] flex-shrink-0"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-white mb-1">Connect Postman</h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">
          Enter your API key to validate exercises.{" "}
          <a
            href="https://go.postman.co/settings/me/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--orange)] hover:underline"
          >
            Get a key →
          </a>
        </p>
        <form onSubmit={handleConnect} className="flex gap-2">
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
            disabled={loading || !key.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--orange)] hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            {loading ? "..." : "Connect"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setKey("");
              setError("");
            }}
            className="px-3 py-2 rounded-lg text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
          >
            Cancel
          </button>
        </form>
        {error && <p className="text-xs text-[var(--pink)] mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--orange)]/8 border border-[var(--orange)]/20 hover:bg-[var(--orange)]/15 transition-colors"
    >
      <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] flex-shrink-0" />
      <span className="text-sm text-[var(--text-secondary)]">
        Connect Postman to validate exercises
      </span>
      <span className="text-xs text-[var(--orange)] ml-auto">Connect →</span>
    </button>
  );
}
