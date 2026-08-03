import { Resend } from "resend";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export interface EmailResult {
  sent: boolean;
  reason?: "no_api_key" | "error";
  message?: string;
}

let client: Resend | null = null;

function getClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!client) {
    client = new Resend(env.RESEND_API_KEY);
  }
  return client;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  const resend = getClient();

  if (!resend) {
    logger.info(
      { to: opts.to, subject: opts.subject },
      "email not sent: RESEND_API_KEY not configured",
    );
    return { sent: false, reason: "no_api_key" };
  }

  try {
    await resend.emails.send({
      from: "QuotaOS <no-reply@quotaos.dev>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    logger.info({ to: opts.to, subject: opts.subject }, "email sent");
    return { sent: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error({ to: opts.to, subject: opts.subject, error: message }, "email send failed");
    return { sent: false, reason: "error", message };
  }
}

export function buildInvitationEmail({
  workspaceName,
  inviterName,
  acceptUrl,
}: {
  workspaceName: string;
  inviterName: string;
  acceptUrl: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin-bottom: 16px;">You're invited to join ${workspaceName}</h2>
      <p style="color: #555; line-height: 1.6;">
        ${inviterName} invited you to join the <strong>${workspaceName}</strong> workspace on QuotaOS.
      </p>
      <p style="margin: 24px 0;">
        <a href="${acceptUrl}"
           style="background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Accept invitation
        </a>
      </p>
      <p style="color: #999; font-size: 13px;">
        This invitation expires in 7 days. If you weren't expecting this, you can ignore this email.
      </p>
    </div>
  `;
}
