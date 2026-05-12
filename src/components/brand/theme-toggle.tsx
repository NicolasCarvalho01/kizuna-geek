"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual */
  variant?: "icon" | "pill";
}

/**
 * Toggle de tema claro/escuro. Default `system` na primeira visita.
 *
 * - `variant="icon"` (padrão): botão circular com ícone que gira/troca
 * - `variant="pill"`: chip dual com "Claro / Escuro" estilo segmented control
 */
export function ThemeToggle({ variant = "icon", className, ...props }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const handleToggle = () => setTheme(isDark ? "light" : "dark");

  if (variant === "pill") {
    return (
      <div
        role="radiogroup"
        aria-label="Trocar tema"
        className={cn(
          "inline-flex items-center p-1 rounded-[var(--radius-pill)]",
          "border border-[color:var(--color-border)]",
          "bg-[color:var(--color-bg-elevated)]",
          className,
        )}
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isDark}
          onClick={() => setTheme("light")}
          className={cn(
            "inline-flex items-center justify-center h-8 w-8 rounded-[var(--radius-pill)]",
            "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
            !isDark
              ? "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] shadow-[var(--shadow-1)]"
              : "text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)]",
          )}
        >
          <Sun className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          <span className="sr-only">Tema claro</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isDark}
          onClick={() => setTheme("dark")}
          className={cn(
            "inline-flex items-center justify-center h-8 w-8 rounded-[var(--radius-pill)]",
            "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
            isDark
              ? "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] shadow-[var(--shadow-1)]"
              : "text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)]",
          )}
        >
          <Moon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          <span className="sr-only">Tema escuro</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={cn(
        "relative inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius-pill)]",
        "border border-[color:var(--color-border)]",
        "bg-[color:var(--color-bg-elevated)]",
        "text-[color:var(--color-fg)]",
        "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
        "hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
        className,
      )}
      {...props}
    >
      <Sun
        className={cn(
          "h-4 w-4 absolute transition-all duration-[var(--motion-slow)] ease-[var(--ease-out-5)]",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100",
        )}
        strokeWidth={1.5}
        aria-hidden
      />
      <Moon
        className={cn(
          "h-4 w-4 absolute transition-all duration-[var(--motion-slow)] ease-[var(--ease-out-5)]",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50",
        )}
        strokeWidth={1.5}
        aria-hidden
      />
    </button>
  );
}
