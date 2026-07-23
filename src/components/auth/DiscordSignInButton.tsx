"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DiscordSignInButton() {
  const { signInWithDiscord, isRegistered, discordProfile, signOut } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // signInWithOAuth stores a fresh PKCE code verifier before redirecting to
  // Discord. A second concurrent click (e.g. an impatient double-click while
  // the redirect is still in flight) overwrites that verifier, so whichever
  // Discord tab/redirect completes may no longer match what's in storage.
  const handleSignIn = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    signInWithDiscord();
  };

  if (isRegistered && discordProfile) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20">
        {discordProfile.avatarUrl ? (
          <img
            src={discordProfile.avatarUrl}
            alt={discordProfile.displayName}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-sm font-bold">
            {discordProfile.displayName[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {discordProfile.displayName}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">Progress synced</p>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isRedirecting}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      <svg width="20" height="15" viewBox="0 0 71 55" fill="none">
        <path
          d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.7 40.7 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1 0A60.4 60.4 0 00.4 45.1a.3.3 0 000 .2A58.8 58.8 0 0018.1 55a.2.2 0 00.2-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.6.2.2 0 01 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.6 58.6 0 0070.6 45.3a.2.2 0 000-.2A60 60 0 0060.2 5a.2.2 0 00-.1 0zM23.7 37a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1zm23.6 0a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1z"
          fill="currentColor"
        />
      </svg>
      {isRedirecting ? "Redirecting to Discord…" : "Sign in with Discord"}
    </button>
  );
}
