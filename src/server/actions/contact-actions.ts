"use server";

import { z } from "zod";
import type { ActionResult } from "@/server/actions/auth-actions";

/**
 * Server Action de formulário de contato.
 *
 * Recebe nome/email/assunto/mensagem, valida com Zod, envia email pra
 * caixa do lojista via Resend (ou stub se RESEND_API_KEY não estiver setada).
 *
 * Anti-spam:
 *  - Campo honeypot (`website`) — bots preenchem, humanos não
 *  - Validação de email
 *  - Limite de tamanho da mensagem
 */

const contactSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(120),
  email: z.string().email("Email inválido"),
  subject: z.string().min(3, "Assunto muito curto").max(200),
  message: z.string().min(10, "Mensagem muito curta").max(2000),
  // Honeypot — campo escondido. Se preenchido = bot
  website: z.string().max(0, "spam_detected").optional(),
});

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "contato@kizunageek.com.br";

export async function sendContactMessage(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    // Honeypot disparou — finge sucesso pra não dar pista pro bot
    if (fieldErrors.website?.includes("spam_detected")) {
      return { ok: true };
    }
    return {
      ok: false,
      error: "Confira os campos.",
      fields: Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const { name, email, subject, message } = parsed.data;

  try {
    const { sendEmail } = await import("@/lib/resend");
    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `[Contato kizunageek.com.br] ${subject}`,
      replyTo: email,
      text: [
        `Nome: ${name}`,
        `Email: ${email}`,
        `Assunto: ${subject}`,
        "",
        "Mensagem:",
        message,
        "",
        "---",
        `Enviado via formulário de /contato em ${new Date().toLocaleString("pt-BR")}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[contact] failed to send:", err);
    return {
      ok: false,
      error: "Erro ao enviar mensagem. Tente novamente em alguns minutos.",
    };
  }

  return { ok: true };
}

/**
 * Inscrição em newsletter — captura email + opt-in marketing.
 *
 * Em modo demo (sem DATABASE_URL), só loga. Com DB, cria/atualiza
 * o usuário com marketingOptIn=true.
 */
const newsletterSchema = z.object({
  email: z.string().email("Email inválido"),
  // Honeypot
  website: z.string().max(0, "spam_detected").optional(),
});

const USE_DB = !!process.env.DATABASE_URL;

export async function subscribeNewsletter(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    if (fieldErrors.website?.includes("spam_detected")) {
      return { ok: true }; // honeypot
    }
    return {
      ok: false,
      error: "Email inválido.",
      fields: Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const { email } = parsed.data;

  // Persiste a inscrição (ou loga em modo demo)
  if (USE_DB) {
    try {
      const { prisma } = await import("@/lib/prisma");
      // Cria ou atualiza usuário marcando opt-in. Não cria conta com senha
      // — o usuário pode fazer signup completo depois se quiser.
      await prisma.user.upsert({
        where: { email },
        update: { marketingOptIn: true },
        create: {
          email,
          marketingOptIn: true,
          role: "CUSTOMER",
          name: email.split("@")[0], // placeholder
        },
      });
    } catch (err) {
      console.error("[newsletter] DB upsert failed:", err);
      // Não bloqueia — usuário verá "ok" mesmo assim (já que email é o essencial)
    }
  } else {
    console.info(`[newsletter-stub] subscribe: ${email}`);
  }

  // Envia welcome (best-effort, não bloqueia se falhar)
  try {
    const { sendEmail } = await import("@/lib/resend");
    await sendEmail({
      to: email,
      subject: "Bem-vindo aos laços 絆",
      text: [
        "Oi,",
        "",
        "Você acabou de assinar a newsletter da Kizuna Geek.",
        "",
        "A partir de agora você recebe:",
        "· Lançamentos selecionados (sem spam)",
        "· Acesso prioritário a pré-vendas (48h antes do público geral)",
        "· Bastidores da curadoria",
        "",
        "Pra cancelar, é só responder este email com 'sair'.",
        "",
        "絆 — Equipe Kizuna",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[newsletter] welcome email failed (non-blocking):", err);
  }

  return { ok: true };
}
