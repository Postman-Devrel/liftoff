"use client";

import { useState, useEffect } from "react";

const DISCORD_INVITE = "https://discord.gg/XJbdvQJQqU";
const DISCORD_CHANNEL = "https://discord.com/channels/831210428314157076/1506690554363121775";
const JOINED_KEY = "liftoff_discord_joined";

interface DiscordHelpButtonProps {
  stepId: string;
  stepTitle: string;
  stepUrl?: string;
}

export default function DiscordHelpButton({
  stepId,
  stepTitle,
  stepUrl,
}: DiscordHelpButtonProps) {
  const [toast, setToast] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    setHasJoined(localStorage.getItem(JOINED_KEY) === "1");
  }, []);

  function handleAskForHelp() {
    const url = stepUrl || window.location.href;
    const lines = [
      `**Step:** ${stepTitle}`,
      `**Step ID:** \`${stepId}\``,
      `**Link:** ${url}`,
      "",
      "**What I need help with:**",
      "_(describe your issue here)_",
    ];

    navigator.clipboard.writeText(lines.join("\n"));

    setToast(true);
    setTimeout(() => setToast(false), 3000);

    if (hasJoined) {
      window.open(DISCORD_CHANNEL, "_blank", "noopener,noreferrer");
    } else {
      localStorage.setItem(JOINED_KEY, "1");
      setHasJoined(true);
      window.open(DISCORD_INVITE, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleAskForHelp}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[#5865F2] transition-colors flex-shrink-0"
      >
        <svg width="14" height="11" viewBox="0 0 71 55" fill="currentColor">
          <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.7 40.7 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1 0A60.4 60.4 0 00.4 45.1a.3.3 0 000 .2A58.8 58.8 0 0018.1 55a.2.2 0 00.2-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.6.2.2 0 01 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.6 58.6 0 0070.6 45.3a.2.2 0 000-.2A60 60 0 0060.2 5a.2.2 0 00-.1 0zM23.7 37a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1zm23.6 0a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1z" />
        </svg>
        Ask for help
      </button>
      {toast && (
        <div className="absolute right-0 top-full mt-2 z-10 px-3 py-2 rounded-lg bg-[#5865F2] text-white text-xs font-medium whitespace-nowrap animate-fade-up shadow-lg">
          Copied to clipboard — paste in #liftoff-feedback
        </div>
      )}
    </div>
  );
}
