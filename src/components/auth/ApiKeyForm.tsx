"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ApiKeyForm() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trimmed = key.trim();
      const res = await fetch("https://api.getpostman.com/me", {
        headers: { "x-api-key": trimmed },
      });

      if (res.ok) {
        const data = await res.json();
        const user = data.user || {};
        setAuth({
          username: user.username || "Unknown",
          fullName: user.fullName || user.username || "Unknown",
          email: user.email || "",
          avatar: user.avatar || "",
        });
        sessionStorage.setItem("postman_api_key", trimmed);
        router.push("/");
      } else {
        setError("Invalid API key. Please check and try again.");
      }
    } catch {
      setError("Failed to reach Postman API. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <label htmlFor="apiKey" className="text-sm text-[var(--text-secondary)]">
        Postman API Key
      </label>
      <input
        id="apiKey"
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="PMAK-..."
        className="w-full px-4 py-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--orange)] backdrop-blur-md"
        required
      />
      <a
        href="https://go.postman.co/settings/me/api-keys"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[var(--orange)] hover:underline"
      >
        Generate a Postman API key →
      </a>
      {error && (
        <p className="text-sm text-[var(--pink)]">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || !key.trim()}
        className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[var(--orange)] to-[var(--pink)] hover:opacity-90 disabled:opacity-40 transition-opacity shadow-lg shadow-[var(--orange)]/20"
      >
        {loading ? "Connecting..." : "Connect to Postman"}
      </button>
    </form>
  );
}
