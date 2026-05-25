"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Field } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/server/actions/contact-actions";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  if (state?.ok) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] mb-4">
          <Check className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h3 className="display text-[1.75rem] mb-3">Bem-vindo aos laços 絆</h3>
        <p className="text-[color:var(--color-fg-soft)] max-w-md mx-auto leading-[var(--leading-relaxed)]">
          Tá inscrito. Seu primeiro email chega em alguns minutos — confere
          inclusive na pasta de spam (e marca como &ldquo;Não é spam&rdquo;
          pra não perder os próximos).
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 lg:p-10"
    >
      <p className="eyebrow text-center mb-6">Inscrever-se</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Field
            label="Email"
            name="email"
            type="email"
            required
            error={state?.fields?.email}
            placeholder="seu@email.com"
            autoComplete="email"
          />
        </div>
        <div className="sm:self-end">
          <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                Inscrevendo…
              </>
            ) : (
              <>Receber emails</>
            )}
          </Button>
        </div>
      </div>

      {/* Honeypot — escondido visualmente */}
      <div
        aria-hidden
        className="absolute -left-[10000px] w-0 h-0 overflow-hidden"
        tabIndex={-1}
      >
        <label>
          Website (não preencha)
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state && !state.ok && state.error && (
        <p
          role="alert"
          className="mt-5 rounded-[var(--radius-sm)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 px-3 py-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)]"
        >
          {state.error}
        </p>
      )}

      <p className="mt-6 text-center text-[0.75rem] text-[color:var(--color-fg-mute)] max-w-sm mx-auto leading-[var(--leading-relaxed)]">
        Ao inscrever, você concorda em receber emails da Kizuna Geek. Pode
        cancelar quando quiser. Detalhes na{" "}
        <a
          href="/privacidade"
          className="text-[color:var(--color-fg-soft)] underline underline-offset-2 hover:text-[color:var(--color-gold)]"
        >
          Política de Privacidade
        </a>
        .
      </p>
    </form>
  );
}
