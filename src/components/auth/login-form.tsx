"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithCredentials } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") ?? "/conta";

  const [state, formAction, pending] = useActionState(
    signInWithCredentials,
    null,
  );
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="from" value={from} />

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
        autoComplete="current-password"
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

      <div className="flex items-center justify-between -mt-2">
        <label className="inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] cursor-pointer">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="h-3.5 w-3.5 accent-[color:var(--color-gold)]"
          />
          Lembrar-me
        </label>
        <Link
          href="/recuperar"
          className="text-[var(--text-caption)] text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)] transition-colors"
        >
          Esqueceu a senha?
        </Link>
      </div>

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
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightAdornment?: React.ReactNode;
}

export function Field({
  label,
  name,
  error,
  rightAdornment,
  className,
  ...rest
}: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <div className="relative">
        <Input
          name={name}
          className={cn(rightAdornment && "pr-11", error && "border-[color:var(--color-vermilion)]", className)}
          {...rest}
        />
        {rightAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightAdornment}
          </div>
        )}
      </div>
      {error && (
        <span
          role="alert"
          className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-vermilion)] mt-0.5"
        >
          {error}
        </span>
      )}
    </label>
  );
}
