import { NextRequest, NextResponse } from "next/server";
import { validatorRegistry } from "@/lib/validators";
import { ValidationContext } from "@/types/validation";
import { getMe } from "@/lib/postman-api";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { stepId, apiKey, context } = (await request.json()) as {
    stepId: string;
    apiKey: string;
    context?: ValidationContext;
  };

  if (!apiKey || !stepId) {
    return NextResponse.json(
      { success: false, message: "Missing stepId or apiKey", pointsAwarded: 0 },
      { status: 400 }
    );
  }

  const validator = validatorRegistry[stepId];
  if (!validator) {
    return NextResponse.json(
      { success: false, message: `Unknown validator: ${stepId}`, pointsAwarded: 0 },
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

    // Persist for registered users on success
    if (result.success) {
      try {
        const supabase = await createClient();
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser();

        console.log("[validate] supabaseUser:", supabaseUser?.id ?? "NOT AUTHENTICATED");
        if (supabaseUser) {
          await supabase.from("progress").upsert(
            {
              user_id: supabaseUser.id,
              step_id: stepId,
              points_awarded: result.pointsAwarded,
              postman_user_id: enrichedContext.userId,
            },
            { onConflict: "user_id,step_id" }
          );

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
