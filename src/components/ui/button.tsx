import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2",
    "whitespace-nowrap select-none",
    "font-[var(--font-body)] tracking-[var(--tracking-snug)]",
    "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        // CTA premium dourado
        primary: [
          "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]",
          "border border-[color:var(--color-gold-deep)]",
          "shadow-[var(--shadow-2)]",
          "hover:bg-[color:var(--color-gold-soft)] hover:shadow-[var(--shadow-gold)] hover:-translate-y-px",
          "active:translate-y-0 active:bg-[color:var(--color-gold-deep)] active:text-[color:var(--color-cream)]",
        ].join(" "),
        // Outline elegante (boutique vibe)
        outline: [
          "bg-transparent text-[color:var(--color-fg)]",
          "border border-[color:var(--color-border-strong)]",
          "hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
          "active:bg-[color:var(--color-gold)]/8",
        ].join(" "),
        // Ghost — quase invisível em repouso
        ghost: [
          "bg-transparent text-[color:var(--color-fg-soft)]",
          "hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-fg)]",
        ].join(" "),
        // Link textual — sublinhado decorativo
        link: [
          "bg-transparent text-[color:var(--color-fg)] px-0",
          "underline underline-offset-4 decoration-[color:var(--color-gold)] decoration-1",
          "hover:decoration-2 hover:text-[color:var(--color-gold)]",
        ].join(" "),
        // Inverso — pra fundos dourados
        invert: [
          "bg-[color:var(--color-fg)] text-[color:var(--color-bg)]",
          "border border-transparent",
          "hover:bg-[color:var(--color-gold)] hover:text-[color:var(--color-gold-ink)]",
        ].join(" "),
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem] rounded-[var(--radius-sm)]",
        md: "h-11 px-6 text-[0.9375rem] rounded-[var(--radius-md)]",
        lg: "h-14 px-9 text-base rounded-[var(--radius-md)]",
        icon: "h-10 w-10 rounded-[var(--radius-md)]",
        pill: "h-11 px-7 text-[0.875rem] rounded-[var(--radius-pill)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
