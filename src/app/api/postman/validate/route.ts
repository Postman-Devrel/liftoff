import { NextRequest, NextResponse } from "next/server";
import { validatorRegistry } from "@/lib/validators";
import { ValidationContext } from "@/types/validation";
import { getMe } from "@/lib/postman-api";
import { createClient } from "@/lib/supabase/server";
import { detectCompletionEvents } from "@/lib/completion-events";
import { dispatchWebhook } from "@/lib/webhooks";
import { absoluteBase } from "@/lib/base-path";
import { isSameOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  // Reject cross-site requests: this route persists progress/points under the
  // caller's session and fires webhooks, so it must not be driveable via CSRF.
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Forbidden", pointsAwarded: 0 },
      { status: 403 }
    );
  }

  const { stepId, validatorId, context, apiKey: bodyKey } = (await request.json()) as {
    stepId: string;
    validatorId?: string;
    context?: ValidationContext;
    apiKey?: string;
  };

  const apiKey = bodyKey || request.cookies.get("postman_api_key")?.value;

  const lookupId = validatorId ?? stepId;

  if (!apiKey || !stepId) {
    return NextResponse.json(
      { success: false, message: "Missing stepId or Postman connection", pointsAwarded: 0 },
      { status: 400 }
    );
  }

  const validator = validatorRegistry[lookupId];
  if (!validator) {
    return NextResponse.json(
      { success: false, message: `Unknown validator: ${lookupId}`, pointsAwarded: 0 },
      { status: 400 }
    );
  }

  try {
    const user = await getMe(apiKey);
    const enrichedContext: ValidationContext = {
      ...context,
      userId: String(user.id),
    };

    const result = await validator(apiKey, enrichedContext);
    console.log(`[validate] stepId=${stepId} success=${result.success} points=${result.pointsAwarded}`);

    if (result.success) {
      try {
        const supabase = await createClient();
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();

        console.log("[validate] supabaseUser:", supabaseUser?.id ?? "NOT AUTHENTICATED");
        if (supabaseUser) {
          const { data: priorProgress } = await supabase
            .from("progress")
            .select("step_id, points_awarded")
            .eq("user_id", supabaseUser.id);

          const completedBefore = new Set((priorProgress ?? []).map((r) => r.step_id));
          const isNewCompletion = !completedBefore.has(stepId);
          const pointsBefore = (priorProgress ?? []).reduce((sum, r) => sum + r.points_awarded, 0);

          const { error: upsertErr } = await supabase.from("progress").upsert(
            {
              user_id: supabaseUser.id,
              step_id: stepId,
              points_awarded: result.pointsAwarded,
              postman_user_id: enrichedContext.userId,
            },
            { onConflict: "user_id,step_id" }
          );
          if (upsertErr) console.error("[validate] upsert error:", upsertErr);

          if (!upsertErr && isNewCompletion) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("discord_id")
              .eq("id", supabaseUser.id)
              .single();

            const events = detectCompletionEvents({
              completedBefore,
              completedAfter: new Set([...completedBefore, stepId]),
              pointsBefore,
              pointsAfter: pointsBefore + result.pointsAwarded,
              discordId: profile?.discord_id ?? null,
              baseUrl: absoluteBase(request.nextUrl.origin),
              occurredAt: new Date().toISOString(),
            });
            await Promise.all(events.map(dispatchWebhook));
          }

          if (result.context) {
            const { data: activeCtx } = await supabase
              .from("validation_contexts")
              .select("context")
              .eq("user_id", supabaseUser.id)
              .eq("is_active", true)
              .limit(1)
              .single();

            const merged = {
              ...(activeCtx?.context as Record<string, unknown> ?? {}),
              ...result.context,
            };

            await supabase
              .from("validation_contexts")
              .update({
                context: merged,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", supabaseUser.id)
              .eq("is_active", true);
          }
        }
      } catch (persistErr) {
        console.error("[validate] persistence failed:", persistErr);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Validation failed";
    return NextResponse.json(
      { success: false, message, pointsAwarded: 0 },
      { status: 500 }
    );
  }
}
