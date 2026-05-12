"use client";

import * as React from "react";
import { useActionState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signUpWithCredentials } from "@/server/actions/auth-actions";
import { Field } from "@/components/auth/login-form";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signUpWithCredentials,
    null,
  );
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Nome completo"
        name="name"
        type="text"
        autoComplete="name"
        required
        error={state?.fields?.name}
        placeholder="Como devemos te chamar?"
      />

      <Field
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state?.fields?.email}
        placeholder="seu.email@dominio.com"
      />

      <Field
        label="Senha"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        required
        error={state?.fields?.password}
        rightAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            className="text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)] transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        }
      />

      <Field
        label="Confirme a senha"
        name="confirmPassword"
        type={showConfirm ? "text" : "password"}
        autoComplete="new-password"
        required
        error={state?.fields?.confirmPassword}
        rightAdornment={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Esconder confirmação" : "Mostrar confirmação"}
            className="text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)] transition-colors"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        }
      />

      <ul className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] space-y-1 -mt-1">
        <li>· Mín. 8 caracteres</li>
        <li>· 1 maiúscula, 1 minúscula, 1 número</li>
      </ul>

      <label className="inline-flex items-start gap-3 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] cursor-pointer leading-snug">
        <input
          type="checkbox"
          name="marketingOptIn"
          className="h-3.5 w-3.5 mt-0.5 accent-[color:var(--color-gold)] shrink-0"
        />
        Quero receber a newsletter — pré-vendas com prioridade, alertas de raridade
        e bastidores. Cancelo a qualquer momento.
      </label>

      {state && !state.ok && state.error && (
        <p
          role="alert"
          className="rounded-[var(--radius-sm)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 px-3 py-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)] leading-snug"
        >
          {state.error}
        </p>
      )}

      <Button size="lg" type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Criando conta…
          </>
        ) : (
          "Criar conta"
        )}
      </Button>

      <p className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] text-center">
        Ao criar conta você aceita os{" "}
        <a href="/termos" className="text-[color:var(--color-gold)] hover:underline">
          Termos
        </a>{" "}
        e a{" "}
        <a href="/privacidade" className="text-[color:var(--color-gold)] hover:underline">
          Política de Privacidade
        </a>
        .
      </p>
    </form>
  );
}
