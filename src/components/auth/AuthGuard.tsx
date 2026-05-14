"use client";

import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isRegistered, signInWithDiscord } = useAuth();

  return (
    <>
      {!isRegistered && (
        <div className="bg-[#5865F2]/10 border-b border-[#5865F2]/20 px-4 py-2.5 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Your progress is saved locally.{" "}
            <button
              onClick={signInWithDiscord}
              className="text-[#5865F2] font-medium hover:underline"
            >
              Sign in with Discord
            </button>
            {" "}to save it permanently.
          </p>
        </div>
      )}
      {children}
    </>
  );
}
