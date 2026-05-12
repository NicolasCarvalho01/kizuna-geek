import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "font-[var(--font-mono)] text-[var(--text-eyebrow)] font-medium uppercase",
    "tracking-[var(--tracking-eyebrow)]",
    "rounded-[var(--radius-pill)]",
    "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Padrão sutil — fundo papel/névoa
        soft: [
          "bg-[color:var(--color-bg-elevated)] text-[color:var(--color-fg-soft)]",
          "border border-[color:var(--color-border)]",
        ].join(" "),
        // Dourado premium — pra "Pré-venda", "Raro", "Exclusivo"
        gold: [
          "bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]",
          "border border-[color:var(--color-gold)]/30",
        ].join(" "),
        // Sólido dourado — destaque máximo
        goldSolid: [
          "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]",
          "border border-[color:var(--color-gold-deep)]",
        ].join(" "),
        // Outline ink — uso geral
        outline: [
          "bg-transparent text-[color:var(--color-fg-soft)]",
          "border border-[color:var(--color-border-strong)]",
        ].join(" "),
        // Vermilion — apenas estados críticos/erro
        vermilion: [
          "bg-[color:var(--color-vermilion)]/10 text-[color:var(--color-vermilion)]",
          "border border-[color:var(--color-vermilion)]/30",
        ].join(" "),
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1",
        lg: "px-3.5 py-1.5 text-[12px]",
      },
    },
    defaultVariants: { variant: "soft", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
