"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { Field } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/server/actions/contact-actions";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, null);

  // Reset form após sucesso
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  if (state?.ok) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] mb-4">
          <Check className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <h3 className="display text-[1.5rem] mb-3">Mensagem enviada</h3>
        <p className="text-[color:var(--color-fg-soft)] max-w-md mx-auto">
          A gente responde por email em até <strong>1 dia útil</strong>. Costume
          é ser mais rápido — fica de olho na caixa de entrada (e no spam,
          eventualmente).
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 text-[var(--text-caption)] text-[color:var(--color-gold)] underline underline-offset-2 hover:text-[color:var(--color-gold-soft)]"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 lg:p-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Nome"
          name="name"
          required
          error={state?.fields?.name}
          autoComplete="name"
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          error={state?.fields?.email}
          autoComplete="email"
        />
      </div>

      <Field
        label="Assunto"
        name="subject"
        required
        error={state?.fields?.subject}
        placeholder="Sobre o que você quer falar?"
        className="mt-4"
        maxLength={200}
      />

      <label className="mt-4 flex flex-col gap-1.5">
        <span className="eyebrow">Mensagem</span>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-transparent text-[0.9375rem] resize-y focus:outline-none focus:border-[color:var(--color-gold)] transition-colors"
          placeholder="Conta pra gente — quanto mais contexto, melhor a resposta."
        />
        {state?.fields?.message && (
          <span
            role="alert"
            className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-vermilion)] mt-0.5"
          >
            {state.fields.message}
          </span>
        )}
      </label>

      {/* Honeypot — escondido visualmente, bots preenchem, humanos não */}
      <div
        aria-hidden
        className="absolute -left-[10000px] w-0 h-0 overflow-hidden"
        tabIndex={-1}
      >
        <label>
          Website (não preencha)
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
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

      <div className="mt-7 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[0.75rem] text-[color:var(--color-fg-mute)] max-w-md">
          Ao enviar, você concorda com nossa{" "}
          <a
            href="/privacidade"
            className="text-[color:var(--color-fg-soft)] underline underline-offset-2 hover:text-[color:var(--color-gold)]"
          >
            Política de Privacidade
          </a>
          .
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              Enviando…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" strokeWidth={1.5} />
              Enviar mensagem
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
