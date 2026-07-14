import { createHmac } from "crypto";

export type LiftoffWebhookEvent =
  | {
      type: "module_completed";
      discordId: string | null;
      moduleId: string;
      moduleTitle: string;
      badgeUrl: string;
      occurredAt: string;
    }
  | {
      type: "learning_path_completed";
      discordId: string | null;
      learningPathId: string;
      learningPathTitle: string;
      badgeUrl: string;
      occurredAt: string;
    }
  | {
      type: "rank_up";
      discordId: string | null;
      rankId: string;
      rankTitle: string;
      badgeUrl: string;
      occurredAt: string;
    };

// Fire-and-forget: a webhook delivery failure must never affect the
// validation response the learner is waiting on.
export async function dispatchWebhook(event: LiftoffWebhookEvent): Promise<void> {
  const url = process.env.LIFTOFF_WEBHOOK_URL;
  if (!url) return;

  const body = JSON.stringify(event);
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const secret = process.env.LIFTOFF_WEBHOOK_SECRET;
  if (secret) {
    headers["X-Liftoff-Signature"] = createHmac("sha256", secret).update(body).digest("hex");
  }

  try {
    const res = await fetch(url, { method: "POST", headers, body });
    if (!res.ok) {
      console.error(`[webhook] delivery failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("[webhook] delivery error:", err);
  }
}
