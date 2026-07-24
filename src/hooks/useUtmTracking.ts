"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiPath } from "@/lib/base-path";

export function useUtmTracking(
  contentType: "module" | "learning_path",
  contentId: string
) {
  const { isRegistered } = useAuth();

  useEffect(() => {
    if (!isRegistered) return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    if (!utmSource) return;

    fetch(apiPath("/api/utm/track/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType,
        contentId,
        utm_source: utmSource,
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_term: params.get("utm_term"),
        utm_content: params.get("utm_content"),
      }),
    }).catch(() => {
      // Fire-and-forget; attribution errors don't affect UX
    });
  }, [contentType, contentId, isRegistered]);
}
