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
  // Postman (ephemeral, localStorage)
  apiKey: string | null;
  profile: PostmanProfile | null;
  isAuthenticated: boolean;

  // Discord/Supabase (persistent)
  supabaseUser: User | null;
  isRegistered: boolean;
  discordProfile: DiscordProfile | null;

  // Actions
  setAuth: (key: string, profile: PostmanProfile) => void;
  clearApiKey: () => void;
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
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [profile, setProfile] = useState<PostmanProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);

  // Load Postman auth from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("postman_api_key");
    const storedProfile = localStorage.getItem("postman_profile");
    if (stored) setApiKeyState(stored);
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch {
        // ignore
      }
    }
  }, []);

  // Listen for Supabase auth state changes
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

  const setAuth = useCallback((key: string, prof: PostmanProfile) => {
    localStorage.setItem("postman_api_key", key);
    localStorage.setItem("postman_profile", JSON.stringify(prof));
    setApiKeyState(key);
    setProfile(prof);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem("postman_api_key");
    localStorage.removeItem("postman_profile");
    setApiKeyState(null);
    setProfile(null);
  }, []);

  const signInWithDiscord = useCallback(async () => {
    await getSupabase().auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
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
      apiKey,
      profile,
      isAuthenticated: !!apiKey,
      supabaseUser,
      isRegistered,
      discordProfile,
      setAuth,
      clearApiKey,
      signInWithDiscord,
      signOut,
    }),
    [
      apiKey,
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
