import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  // Reject cross-site requests so the victim's session can't be forcibly
  // signed out via CSRF.
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
