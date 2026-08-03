import { logger } from "@/lib/logger";
import crypto from "crypto";

const MAX_BODY_BYTES = 512 * 1024;

export interface WebhookResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export async function deliverWebhook(url: string, payload: unknown, secret?: string): Promise<WebhookResult> {
  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "user-agent": "quota-os-alerts/1.0",
    };

    if (secret) {
      headers["x-quotaos-signature"] = createHmacSignature(secret, payload);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        return { ok: false, status: response.status, error: `HTTP ${response.status}` };
      }

      return { ok: true, status: response.status };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn({ url, error: message }, "webhook delivery failed");
    return { ok: false, error: message };
  }
}

export function createWebhookPayload({
  alertId,
  alertName,
  projectName,
  metric,
  condition,
  threshold,
  actualValue,
  windowMs,
  triggeredAt,
}: {
  alertId: string;
  alertName: string;
  projectName: string;
  metric: string;
  condition: string;
  threshold: number;
  actualValue: number;
  windowMs: number;
  triggeredAt: string;
}) {
  const body = {
    event: "alert.triggered",
    alert_id: alertId,
    alert_name: alertName,
    project: projectName,
    metric,
    condition,
    threshold,
    actual_value: actualValue,
    window_ms: windowMs,
    triggered_at: triggeredAt,
  };

  return { version: "1.0", ...body };
}

function createHmacSignature(secret: string, payload: unknown): string {
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
}

export function truncatePayload(payload: Record<string, unknown>): Record<string, unknown> {
  return payload;
}

export { MAX_BODY_BYTES };
