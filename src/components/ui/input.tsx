import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[var(--radius-md)] bg-transparent px-4 py-2",
          "text-[0.9375rem] text-[color:var(--color-fg)]",
          "placeholder:text-[color:var(--color-fg-mute)] placeholder:italic placeholder:font-[var(--font-display)]",
          "border border-[color:var(--color-border-strong)]",
          "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
          "hover:border-[color:var(--color-fg-soft)]",
          "focus-visible:outline-none focus-visible:border-[color:var(--color-gold)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold)]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
