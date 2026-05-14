"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const DISMISSED_KEY = "liftoff_discord_community_dismissed";

export default function DiscordCommunityModal() {
  const { isRegistered } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isRegistered) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) {
      setShow(true);
    }
  }, [isRegistered]);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5865F2]/15 mb-4">
            <svg width="32" height="24" viewBox="0 0 71 55" fill="#5865F2">
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.7 40.7 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1 0A60.4 60.4 0 00.4 45.1a.3.3 0 000 .2A58.8 58.8 0 0018.1 55a.2.2 0 00.2-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.6.2.2 0 01 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.6 58.6 0 0070.6 45.3a.2.2 0 000-.2A60 60 0 0060.2 5a.2.2 0 00-.1 0zM23.7 37a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1zm23.6 0a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Join the Postman Community
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Connect with a community of developers who can help you build and
            deploy agents, APIs, and leverage the Postman platform. Get help,
            share what you&apos;re building, and level up together.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="https://discord.com/invite/rKZgwpZqqV"
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] transition-colors"
          >
            <svg width="20" height="15" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.7 40.7 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1 0A60.4 60.4 0 00.4 45.1a.3.3 0 000 .2A58.8 58.8 0 0018.1 55a.2.2 0 00.2-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.6.2.2 0 01 0-.4c.4-.3.7-.6 1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.6 58.6 0 0070.6 45.3a.2.2 0 000-.2A60 60 0 0060.2 5a.2.2 0 00-.1 0zM23.7 37a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1zm23.6 0a6.9 6.9 0 01-6.4-7.1 6.8 6.8 0 016.4-7.1 6.8 6.8 0 016.4 7.1 6.9 6.9 0 01-6.4 7.1z" />
            </svg>
            Join the Discord
          </a>
          <button
            onClick={dismiss}
            className="w-full px-6 py-2.5 rounded-xl text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
