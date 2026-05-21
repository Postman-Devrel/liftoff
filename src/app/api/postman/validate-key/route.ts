import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "postman_api_key";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  const { apiKey } = await request.json();

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json(
      { valid: false, message: "API key is required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("https://api.getpostman.com/me", {
      headers: { "x-api-key": apiKey },
    });

    if (res.ok) {
      const data = await res.json();
      const user = data.user || {};
      const postmanUserId = String(user.id);

      let isNewOrg = false;

      try {
        const supabase = await createClient();
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();

        if (supabaseUser) {
          const { data: contextRows } = await supabase
            .from("validation_contexts")
            .select("*")
            .eq("user_id", supabaseUser.id)
            .eq("is_active", true)
            .limit(1);

          const activeCtx = contextRows?.[0];

          if (activeCtx && activeCtx.postman_user_id !== postmanUserId) {
            await supabase.rpc("switch_postman_org", {
              p_user_id: supabaseUser.id,
              p_postman_user_id: postmanUserId,
              p_initial_context: {},
            });
            isNewOrg = true;
          } else if (!activeCtx) {
            await supabase.from("validation_contexts").insert({
              user_id: supabaseUser.id,
              postman_user_id: postmanUserId,
              context: {},
              is_active: true,
            });
          }
        }
      } catch {
        // Don't fail key validation if Supabase ops fail
      }

      const profile = {
        username: user.username || "Unknown",
        fullName: user.fullName || user.username || "Unknown",
        email: user.email || "",
        avatar: user.avatar || "",
      };

      const response = NextResponse.json({ valid: true, isNewOrg, profile });

      response.cookies.set(COOKIE_NAME, apiKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });

      return response;
    }

    return NextResponse.json(
      { valid: false, message: "Invalid API key. Please check and try again." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { valid: false, message: "Failed to reach Postman API" },
      { status: 502 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ cleared: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
