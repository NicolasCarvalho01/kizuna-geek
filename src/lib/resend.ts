import "server-only";
import { Resend } from "resend";

/**
 * Cliente Resend pra envio de e-mails transacionais.
 *
 * Graceful fallback: se `RESEND_API_KEY` não estiver setada, em vez de quebrar,
 * loga no console o que seria enviado. Útil em dev e CI antes de ter conta Resend.
 */

const apiKey = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Kizuna Geek <onboarding@resend.dev>";

export const resendConfigured = !!apiKey;

const resendClient = apiKey ? new Resend(apiKey) : null;

export interface SendEmailInput {
  to: string;
  subject: string;
  /** Template React Email (preferido) — renderizado em HTML pelo SDK */
  react?: React.ReactElement;
  /** HTML inline (alternativa) */
  html?: string;
  /** Texto puro (fallback pra clientes que não renderizam HTML) */
  text?: string;
  /** Reply-to opcional */
  replyTo?: string;
}

/**
 * Envia um e-mail. Retorna ok mesmo em modo stub — não bloqueia o fluxo do user.
 */
export async function sendEmail(
  input: SendEmailInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resendClient) {
    console.info(
      `[email-stub] → ${input.to}\n  subject: ${input.subject}\n  (RESEND_API_KEY not configured; would send via Resend)`,
    );
    return { ok: true, id: "stub" };
  }

  try {
    const res = await resendClient.emails.send({
      from: EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      ...(input.react ? { react: input.react } : {}),
      ...(input.html ? { html: input.html } : {}),
      ...(input.text ? { text: input.text } : {}),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    } as Parameters<typeof resendClient.emails.send>[0]);

    if (res.error) {
      console.error("[email] Resend error:", res.error);
      return { ok: false, error: res.error.message ?? "Erro Resend." };
    }

    return { ok: true, id: res.data?.id };
  } catch (err) {
    console.error("[email] send failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
