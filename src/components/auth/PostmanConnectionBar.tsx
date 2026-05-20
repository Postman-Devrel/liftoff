"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PostmanConnectionBar() {
  const { profile, isAuthenticated } = useAuth();

  if (isAuthenticated && profile) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--orange)]/8 border border-[var(--orange)]/15">
        <div className="w-2 h-2 rounded-full bg-[var(--green)] flex-shrink-0" />
        <span className="text-sm text-[var(--text-secondary)] flex-1 min-w-0 truncate">
          Connected as <span className="text-white font-medium">@{profile.username}</span>
        </span>
        <Link
          href="/settings"
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] flex-shrink-0"
        >
          Settings
        </Link>
      </div>
    );
  }

  return (
    <Link
      href="/settings"
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--orange)]/8 border border-[var(--orange)]/20 hover:bg-[var(--orange)]/15 transition-colors"
    >
      <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] flex-shrink-0" />
      <span className="text-sm text-[var(--text-secondary)]">
        Connect your Postman API key to validate exercises
      </span>
      <span className="text-xs text-[var(--orange)] ml-auto">Settings →</span>
    </Link>
  );
}
