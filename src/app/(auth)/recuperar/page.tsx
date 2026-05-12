"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/server/actions/auth-actions";

export default function PasswordResetPage() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    null,
  );

  return (
    <AuthShell
      eyebrow="Recuperar senha"
      title={
        <>
          Esqueceu a{" "}
          <em className="display-italic text-[color:var(--color-gold)]">senha</em>?
        </>
      }
      subtitle="Sem stress. Envie seu e-mail e te mandamos um link pra criar uma nova."
      kana="再発行"
      footer={
        <p>
          Lembrou?{" "}
          <Link
            href="/entrar"
            className="text-[color:var(--color-gold)] underline-offset-4 hover:underline"
          >
            Voltar pra entrada
          </Link>
        </p>
      }
    >
      {state?.ok ? (
        <div className="flex flex-col items-start gap-4 rounded-[var(--radius-md)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]">
            <Check className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3 className="font-[var(--font-display)] text-[1.25rem] leading-snug">
            Tudo certo
          </h3>
          <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
            Se o e-mail estiver cadastrado, você vai receber um link em até alguns
            minutos. Confira a caixa de entrada e a pasta de spam.
          </p>
          <Link
            href="/entrar"
            className="eyebrow text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)] transition-colors"
          >
            Voltar pra entrada →
          </Link>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-5">
          <Field
            label="E-mail cadastrado"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="seu.email@dominio.com"
          />

          {state && !state.ok && state.error && (
            <p
              role="alert"
              className="rounded-[var(--radius-sm)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 px-3 py-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)]"
            >
              {state.error}
            </p>
          )}

          <Button size="lg" type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                Enviando…
              </>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>

          <p className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
            * Por segurança, não confirmamos se o e-mail existe na base.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
