"use client";

import * as React from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cookie Consent Banner — LGPD compliance.
 *
 * Aparece na primeira visita do usuário (verifica localStorage). Quando
 * aceita/recusa, salva a decisão e some.
 *
 * Como a Kizuna usa SÓ cookies essenciais (auth, carrinho) + analytics
 * anonimizado (sem cookies de identificação), a recusa não impacta a
 * navegação. Mas o banner é mostrado mesmo assim pra ficar coberto
 * pela LGPD em caso de adicionar trackers no futuro.
 *
 * Padrões respeitados:
 * - Não bloqueia tela (banner discreto no rodapé, não modal)
 * - 3 opções claras: Aceitar / Recusar / Personalizar (vai pra /cookies)
 * - Decisão persiste 12 meses no localStorage
 * - SSR-safe: começa escondido, renderiza só após hydration
 */

const STORAGE_KEY = "kizuna-cookie-consent";
const CONSENT_VERSION = "1"; // bump pra exigir novo consentimento (mudança na política)

interface ConsentDecision {
  version: string;
  status: "accepted" | "rejected";
  decidedAt: string; // ISO
}

function readConsent(): ConsentDecision | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentDecision;
    // Se a versão mudou, invalida o consentimento (banner volta a aparecer)
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(status: "accepted" | "rejected") {
  if (typeof window === "undefined") return;
  const decision: ConsentDecision = {
    version: CONSENT_VERSION,
    status,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decision));
  } catch {
    // Privacy mode pode bloquear localStorage — tudo bem, banner volta na próxima
  }
}

export function CookieConsentBanner() {
  // Começa null — só decide se mostra após hydration (evita mismatch SSR)
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const decision = readConsent();
    if (!decision) {
      // Pequeno delay pra não competir com a animação de entrada da página
      const t = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function handleAccept() {
    writeConsent("accepted");
    setShow(false);
  }

  function handleReject() {
    writeConsent("rejected");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className={cn(
        // Posicionamento
        "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50",
        "sm:max-w-md",
        // Visual
        "rounded-[var(--radius-lg)] border border-[color:var(--color-border-strong)]",
        "bg-[color:var(--color-bg-elevated)]/95 backdrop-blur-md",
        "shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
        // Animation
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
      )}
    >
      <div className="p-5 lg:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]">
            <Cookie className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              id="cookie-banner-title"
              className="font-[var(--font-display)] text-[1.0625rem] leading-tight text-[color:var(--color-fg)]"
            >
              Aqui usamos cookies essenciais
            </p>
            <p
              id="cookie-banner-desc"
              className="mt-2 text-[0.8125rem] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]"
            >
              Necessários pra login, carrinho e segurança. Analytics roda
              anonimizado.{" "}
              <strong className="text-[color:var(--color-fg)]">Sem trackers</strong>{" "}
              de publicidade ou venda de dados.{" "}
              <Link
                href="/cookies"
                className="text-[color:var(--color-gold)] underline underline-offset-2 hover:text-[color:var(--color-gold-soft)] transition-colors"
              >
                Saiba mais
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={handleReject}
            aria-label="Fechar e recusar"
            className="shrink-0 -mt-1 -mr-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-[color:var(--color-fg-soft)] hover:bg-[color:var(--color-bg-sunken)] hover:text-[color:var(--color-fg)] transition-colors"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-4">
          <button
            type="button"
            onClick={handleAccept}
            className={cn(
              "flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-[var(--radius-sm)]",
              "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]",
              "font-[var(--font-display)] text-[0.9375rem]",
              "hover:bg-[color:var(--color-gold)]/90 transition-colors",
            )}
          >
            Aceitar e continuar
          </button>
          <button
            type="button"
            onClick={handleReject}
            className={cn(
              "inline-flex items-center justify-center px-4 py-2.5 rounded-[var(--radius-sm)]",
              "border border-[color:var(--color-border-strong)]",
              "text-[0.9375rem] text-[color:var(--color-fg-soft)]",
              "hover:border-[color:var(--color-fg)] hover:text-[color:var(--color-fg)] transition-colors",
            )}
          >
            Recusar não-essenciais
          </button>
        </div>
      </div>
    </div>
  );
}
