"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut, auth } from "@/auth";
import { loginSchema, signupSchema, passwordResetRequestSchema } from "@/lib/validators/auth";
import { findDemoUserByEmail } from "@/server/demo-users";

const USE_DEMO = !process.env.DATABASE_URL;

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  fields?: Record<string, string>;
}

// =====================================================================
// SIGN IN (credentials)
// =====================================================================

export async function signInWithCredentials(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fields: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "",
        ]),
      ),
    };
  }

  const fromParam = (formData.get("from") as string | null)?.trim() || null;

  try {
    // Autentica sem redirect automático — vamos decidir manualmente onde mandar
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return { ok: false, error: "E-mail ou senha incorretos." };
      }
      return { ok: false, error: "Erro ao entrar. Tente novamente." };
    }
    throw err;
  }

  // Decide destino baseado no `from` (se veio de página protegida) ou no role
  let target = fromParam;
  if (!target) {
    // Sem `from` específico — manda admin pro painel, cliente pra /conta
    const session = await auth();
    const role = session?.user?.role;
    target = role === "ADMIN" || role === "STAFF" ? "/admin" : "/conta";
  }

  // `redirect()` joga uma exception especial do Next que faz o redirect (never)
  redirect(target);
}

// =====================================================================
// SIGN UP
// =====================================================================

export async function signUpWithCredentials(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    marketingOptIn: formData.get("marketingOptIn") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os campos.",
      fields: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "",
        ]),
      ),
    };
  }

  const { name, email, password, marketingOptIn } = parsed.data;

  if (USE_DEMO) {
    if (findDemoUserByEmail(email)) {
      return {
        ok: false,
        error: "E-mail já cadastrado (usuário de demonstração).",
      };
    }
    return {
      ok: false,
      error:
        "Cadastro em modo demo está desabilitado. Configure o Supabase para criar contas — ou entre com um usuário de teste do seed.",
    };
  }

  // Caminho com DB
  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Este e-mail já está cadastrado." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "CUSTOMER",
      marketingOptIn,
      // emailVerified fica null — gera token e envia verificação (TODO: usar PasswordResetToken-like)
    },
  });

  // Email de boas-vindas (fire-and-forget — não bloqueia cadastro)
  try {
    const { sendWelcomeEmail } = await import("@/server/services/emails");
    await sendWelcomeEmail({ email, name });
  } catch (err) {
    console.error("[signup] welcome email failed:", err);
  }

  // Auto-login após cadastro
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/conta",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: true }; // criou mas não logou — manda pro /entrar
    }
    throw err;
  }

  return { ok: true };
}

// =====================================================================
// SIGN OUT
// =====================================================================

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// =====================================================================
// PASSWORD RESET (request — envio real fica na Fase 6 com Resend)
// =====================================================================

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, error: "E-mail inválido." };
  }

  // Sempre retorna ok pra evitar enumeração de e-mails
  // (boa prática — não confirmar se o e-mail existe)
  if (USE_DEMO) {
    console.info("[demo] Password reset request for:", parsed.data.email);
  } else {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      // TODO Fase 6: gerar token + salvar em PasswordResetToken + enviar via Resend
      console.info("[stub] Would send password reset email to:", user.email);
    }
  }

  return { ok: true };
}
