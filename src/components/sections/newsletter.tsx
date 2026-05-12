"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

/**
 * Captação de newsletter — visual editorial.
 * Form é client-side com estado local; o handler real entra na Fase 6.
 */
export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    // Placeholder — chama a API real na Fase 6
    await new Promise((r) => setTimeout(r, 700));
    setStatus("done");
  }

  return (
    <section className="wrap py-24 lg:py-32">
      <div className="grid grid-cols-12 gap-6 relative">
        {/* Kanji decorativo grande à direita, baixa opacidade */}
        <span
          aria-hidden
          className="hidden lg:block absolute right-0 -top-12 font-[var(--font-jp)] text-[18rem] leading-none font-black text-[color:var(--color-gold)]/8 select-none pointer-events-none"
        >
          手
        </span>

        <div className="col-span-12 lg:col-span-7 relative">
          <Eyebrow index="06">Newsletter · 絆</Eyebrow>
          <h2 className="display mt-5 text-[clamp(2.25rem,5vw,4rem)] max-w-2xl">
            Receba as <em className="display-italic text-[color:var(--color-gold)]">pré-vendas</em>{" "}
            antes do mundo.
          </h2>
          <p className="mt-6 max-w-md text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
            Um envio a cada quinze dias. Pré-vendas com prioridade, alertas
            de raros e bastidores da curadoria. Sem spam, sem ruído.
          </p>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className={cn(
              "mt-10 relative max-w-xl",
              "transition-opacity",
              status === "done" && "opacity-50 pointer-events-none",
            )}
            aria-live="polite"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Seu e-mail
            </label>
            <div className="flex items-center border-b border-[color:var(--color-border-strong)] pb-3 focus-within:border-[color:var(--color-gold)] transition-colors duration-[var(--motion-base)] ease-[var(--ease-out-3)]">
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@dominio.com"
                disabled={status !== "idle"}
                className={cn(
                  "flex-1 bg-transparent outline-none",
                  "text-[var(--text-lead)] font-[var(--font-display)] italic",
                  "placeholder:text-[color:var(--color-fg-mute)] placeholder:italic placeholder:font-light",
                  "py-2",
                )}
              />
              <button
                type="submit"
                disabled={status !== "idle"}
                className={cn(
                  "inline-flex items-center gap-2 px-1 py-2",
                  "font-[var(--font-mono)] text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-medium",
                  "text-[color:var(--color-gold)]",
                  "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
                  "hover:text-[color:var(--color-gold-soft)] hover:gap-3",
                  "disabled:cursor-not-allowed",
                )}
              >
                {status === "submitting" ? "Enviando…" : "Assinar"}
                {status !== "submitting" && (
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </form>

          {/* Confirmação */}
          {status === "done" && (
            <p
              className={cn(
                "mt-5 inline-flex items-center gap-2",
                "text-[var(--text-caption)] text-[color:var(--color-gold)]",
                "animate-[fade-up_var(--motion-slow)_var(--ease-out-5)_forwards]",
              )}
              role="status"
            >
              <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Confirmação enviada para <strong className="font-medium">{email}</strong>.
            </p>
          )}

          <p className="mt-6 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
            Double opt-in · LGPD compliant · cancele a qualquer momento
          </p>
        </div>

        {/* Cartão lateral com 3 benefícios */}
        <aside className="col-span-12 lg:col-span-4 lg:col-start-9 self-end">
          <div className="border-l-2 border-[color:var(--color-gold)] pl-6 lg:pl-8 flex flex-col gap-6">
            {[
              { jp: "予約", title: "Pré-venda prioritária", text: "Acesso 48h antes do público geral." },
              { jp: "限定", title: "Avisos de raridade", text: "Alerta quando uma peça da sua wishlist volta." },
              { jp: "舞台裏", title: "Bastidores", text: "Como cada peça chega até a curadoria." },
            ].map((perk) => (
              <div key={perk.title} className="flex gap-4">
                <span
                  aria-hidden
                  className="font-[var(--font-jp)] text-[1.5rem] leading-none font-black text-[color:var(--color-gold)]/60 shrink-0"
                >
                  {perk.jp}
                </span>
                <div>
                  <h3 className="text-[var(--text-body)] font-medium text-[color:var(--color-fg)]">
                    {perk.title}
                  </h3>
                  <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
                    {perk.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
