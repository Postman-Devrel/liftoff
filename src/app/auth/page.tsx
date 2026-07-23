"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import DiscordSignInButton from "@/components/auth/DiscordSignInButton";
import Link from "next/link";

const RETURN_TO_KEY = "liftoff_return_to";

export default function AuthPage() {
  const router = useRouter();
  const { isRegistered } = useAuth();
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("code");
  });

  function redirectAfterSignIn() {
    const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    if (returnTo) {
      window.location.replace(returnTo);
    } else {
      router.replace("/");
    }
  }

  useEffect(() => {
    if (isRegistered && !isExchanging) {
      redirectAfterSignIn();
    }
  }, [isRegistered, isExchanging]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    setIsExchanging(true);
    createClient()
      .auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          console.error("Discord sign-in code exchange failed:", error);
          setExchangeError(error.message);
        }
      })
      .catch((err) => {
        console.error("Discord sign-in failed:", err);
        setExchangeError(err.message ?? "Unknown error");
      })
      .finally(() => {
        setIsExchanging(false);
        window.history.replaceState(null, "", window.location.pathname);
      });
  }, []);

  if (isExchanging) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-white mb-2">Signing you in…</h1>
          <p className="text-[var(--text-secondary)]">
            Completing Discord authentication
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-8 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-sm transition-colors">
          ← Back
        </Link>

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Join LiftOff
          </h1>
          <p className="text-[var(--text-secondary)]">
            Sign in with Discord to save your progress, earn ranks, and track
            your learning across sessions and devices.
          </p>
        </div>

        <div className="glass-card p-6 mb-6">
          <DiscordSignInButton />
          {exchangeError && (
            <p className="mt-4 text-sm text-red-400">
              Sign-in failed: {exchangeError}. Please try again.
            </p>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
            How it works
          </h3>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-3">
              <span className="text-[#5865F2] flex-shrink-0">1.</span>
              <span>Sign in with your Discord account to create your profile</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--orange)] flex-shrink-0">2.</span>
              <span>Connect your Postman API key when you start a module</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--green)] flex-shrink-0">3.</span>
              <span>Complete exercises, earn points, and rank up</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            You can switch Postman orgs anytime without losing your progress.
            Your Postman API key is never stored — it&apos;s only kept for the current session.
          </p>
        </div>
      </div>
    </div>
  );
}
