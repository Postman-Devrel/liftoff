"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { apiPath } from "@/lib/base-path";
import type { User } from "@supabase/supabase-js";

export interface PostmanProfile {
  username: string;
  fullName: string;
  email: string;
  avatar: string;
}

export interface DiscordProfile {
  username: string;
  avatarUrl: string;
  displayName: string;
}

interface AuthState {
  profile: PostmanProfile | null;
  isAuthenticated: boolean;

  supabaseUser: User | null;
  isRegistered: boolean;
  discordProfile: DiscordProfile | null;

  setAuth: (profile: PostmanProfile) => void;
  clearApiKey: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) _supabase = createClient();
  return _supabase;
}

function extractDiscordProfile(user: User): DiscordProfile {
  const meta = user.user_metadata ?? {};
  return {
    username: meta.full_name ?? meta.name ?? "Unknown",
    avatarUrl: meta.avatar_url ?? "",
    displayName:
      meta.custom_claims?.global_name ??
      meta.full_name ??
      meta.name ??
      "Unknown",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PostmanProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem("postman_profile");
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch {
        // ignore
      }
    }

    // Clean up legacy apiKey from localStorage if present
    localStorage.removeItem("postman_api_key");
  }, []);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data: { user } }) => {
      setSupabaseUser(user);
    });

    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setAuth = useCallback((prof: PostmanProfile) => {
    localStorage.setItem("postman_profile", JSON.stringify(prof));
    setProfile(prof);
  }, []);

  const clearApiKey = useCallback(async () => {
    localStorage.removeItem("postman_profile");
    setProfile(null);
    await fetch(apiPath("/api/postman/validate-key"), { method: "DELETE" });
  }, []);

  const signInWithDiscord = useCallback(async () => {
    await getSupabase().auth.signInWithOAuth({
      provider: "discord",
      options: {
        // Redirect straight to a page, not the API route: the CDN in front of
        // this app drops the ?code= query string before it reaches any server
        // route, but the browser's own address bar still has it. The browser
        // Supabase client auto-detects and exchanges it from window.location.
        redirectTo: `${window.location.origin}${apiPath("/auth/")}`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setSupabaseUser(null);
  }, []);

  const isRegistered = !!supabaseUser;
  const discordProfile = supabaseUser
    ? extractDiscordProfile(supabaseUser)
    : null;

  const value = useMemo(
    () => ({
      profile,
      isAuthenticated: !!profile,
      supabaseUser,
      isRegistered,
      discordProfile,
      setAuth,
      clearApiKey,
      signInWithDiscord,
      signOut,
    }),
    [
      profile,
      supabaseUser,
      isRegistered,
      discordProfile,
      setAuth,
      clearApiKey,
      signInWithDiscord,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
