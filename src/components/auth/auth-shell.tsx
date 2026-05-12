import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  /** Texto da eyebrow (ex: "Entrar", "Criar conta") */
  eyebrow: string;
  /** Título display */
  title: React.ReactNode;
  /** Subtítulo opcional */
  subtitle?: React.ReactNode;
  /** Linha lateral kana decorativa */
  kana?: string;
  /** Conteúdo do form */
  children: React.ReactNode;
  /** Linha de "ou X" no rodapé do card */
  footer?: React.ReactNode;
}

/**
 * Layout boutique pra páginas de autenticação.
 * Two-column: brand statement esquerda + form direita.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  kana = "認証",
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="grid min-h-[calc(100svh-5rem)] grid-cols-1 lg:grid-cols-2">
      {/* Coluna brand — visível apenas desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between p-12 xl:p-16",
          "bg-[color:var(--color-bg-sunken)] relative overflow-hidden",
        )}
      >
        <Logo size="lg" asStatic />

        <div className="relative max-w-md">
          <span
            aria-hidden
            className="absolute -top-20 -left-2 font-[var(--font-jp)] text-[14rem] leading-none font-black text-[color:var(--color-gold)]/8 select-none pointer-events-none"
          >
            {kana}
          </span>
          <p className="relative font-[var(--font-display)] italic text-[1.5rem] xl:text-[1.875rem] leading-snug text-[color:var(--color-fg)]">
            “Toda peça é um <span className="text-[color:var(--color-gold)]">laço</span> entre uma
            história e quem decide guardá-la.”
          </p>
          <p className="relative mt-5 eyebrow">Equipe Kizuna · Itapetininga, SP</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="eyebrow">絆 · Kizuna</p>
          <p className="eyebrow">Curadoria 2026</p>
        </div>
      </aside>

      {/* Coluna form */}
      <main className="flex items-center justify-center px-6 py-16 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <Logo size="md" />
          </div>

          <Eyebrow index="—">{eyebrow}</Eyebrow>
          <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)]">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-[var(--text-body)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
              {subtitle}
            </p>
          )}

          <div className="mt-10">{children}</div>

          {footer && (
            <div className="mt-8 pt-8 border-t border-[color:var(--color-hairline)] text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Botão Google OAuth — só renderiza se as env vars estiverem setadas.
 * Quando ausentes, retorna null (o button silenciosamente some).
 */
export function GoogleButton({ from }: { from?: string }) {
  const googleEnabled =
    typeof process !== "undefined" &&
    !!process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED;

  if (!googleEnabled) return null;

  return (
    <form action="/api/auth/signin/google" method="POST" className="contents">
      {from && <input type="hidden" name="callbackUrl" value={from} />}
      <button
        type="submit"
        className={cn(
          "inline-flex items-center justify-center gap-3 w-full h-11 px-5",
          "rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-transparent",
          "text-[0.9375rem] text-[color:var(--color-fg)]",
          "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
          "hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
        )}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
          />
        </svg>
        Continuar com Google
      </button>
    </form>
  );
}
