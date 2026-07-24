import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  // Reject cross-site requests so UTM attribution can't be forged for a
  // victim's account via CSRF.
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { contentType, contentId, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = body;

  if (!contentType || !contentId || !utm_source) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (contentType !== "module" && contentType !== "learning_path") {
    return NextResponse.json({ error: "Invalid contentType" }, { status: 400 });
  }

  // ignoreDuplicates: true preserves the first attribution (first-wins semantics)
  const { error } = await supabase
    .from("utm_attribution")
    .upsert(
      {
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        utm_source,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
      },
      { onConflict: "user_id,content_type,content_id", ignoreDuplicates: true }
    );

  if (error) {
    console.error("[utm/track] error:", error.message);
    return NextResponse.json({ error: "Failed to record" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
