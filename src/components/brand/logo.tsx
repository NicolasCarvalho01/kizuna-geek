import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /**
   * Tom do logo:
   * - `auto` (padrão): dourado no tema dark, navy no light
   * - `gold`: dourado fixo (uso em fundos escuros customizados)
   * - `navy`: navy fixo (uso em fundos claros customizados)
   * - `current`: usa `currentColor` (herda a cor do texto pai)
   */
  tone?: "auto" | "gold" | "navy" | "current";
  /** Tamanho relativo */
  size?: "sm" | "md" | "lg";
  /** Esconder ou mostrar o wordmark KIZUNA ao lado do kanji */
  showWordmark?: boolean;
  /** Não envolver em <Link> (uso decorativo / dentro de outro link) */
  asStatic?: boolean;
}

const toneClass: Record<NonNullable<LogoProps["tone"]>, string> = {
  auto: "bg-[color:var(--color-fg)] dark:bg-[color:var(--color-gold)]",
  gold: "bg-[color:var(--color-gold)]",
  navy: "bg-[color:var(--color-navy)]",
  current: "bg-current",
};

const sizeClass = {
  sm: "h-6",
  md: "h-9",
  lg: "h-12",
} as const;

const wordmarkSize = {
  sm: "text-[1rem] tracking-[0.28em]",
  md: "text-[1.375rem] tracking-[0.3em]",
  lg: "text-[1.875rem] tracking-[0.32em]",
} as const;

/**
 * Logo da Kizuna Geek.
 *
 * O SVG é monocromático — usamos `mask-image` para recolorir conforme o tema.
 * Por padrão (`tone="auto"`):
 *  - light theme → navy
 *  - dark theme  → dourado
 *
 * O componente é envolvido em `<Link href="/">` por padrão. Use `asStatic`
 * quando estiver dentro de outro link ou em contexto decorativo.
 */
export function Logo({
  tone = "auto",
  size = "md",
  showWordmark = true,
  asStatic = false,
  className,
  ...props
}: LogoProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-3 group",
        "transition-opacity duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
        "hover:opacity-85",
        sizeClass[size],
        className,
      )}
    >
      {/* Kanji 絆 — renderizado via mask sobre o SVG fornecido */}
      <span
        aria-hidden
        className={cn(
          "block aspect-square h-full shrink-0",
          "[mask-image:url('/kizuna-logo.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
          "[-webkit-mask-image:url('/kizuna-logo.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]",
          "transition-colors duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
          toneClass[tone],
        )}
      />

      {showWordmark && (
        <span
          className={cn(
            "font-[var(--font-display)] font-light uppercase",
            "leading-none whitespace-nowrap",
            "transition-colors duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
            // Cor do wordmark acompanha o tone do kanji
            tone === "gold" && "text-[color:var(--color-gold)]",
            tone === "navy" && "text-[color:var(--color-navy)]",
            tone === "current" && "text-current",
            tone === "auto" && "text-[color:var(--color-fg)]",
            wordmarkSize[size],
          )}
        >
          Kizuna
        </span>
      )}
    </span>
  );

  if (asStatic) {
    return <span {...(props as React.HTMLAttributes<HTMLSpanElement>)}>{content}</span>;
  }

  return (
    <Link
      href="/"
      aria-label="Kizuna Geek — página inicial"
      className="inline-flex"
      {...props}
    >
      {content}
    </Link>
  );
}
