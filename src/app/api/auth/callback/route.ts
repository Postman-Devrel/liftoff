import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { absoluteBase } from "@/lib/base-path";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // The CDN in front of this deployment forwards to Vercel with the Host header
  // rewritten to the raw *.vercel.app domain, so request.url's origin doesn't
  // reflect the public-facing domain. Trust NEXT_PUBLIC_SITE_URL when set.
  const base = absoluteBase(process.env.NEXT_PUBLIC_SITE_URL || origin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/auth?error=oauth_failed`);
}
