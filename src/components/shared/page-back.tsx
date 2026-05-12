"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageBackProps {
  /** URL pra qual ir se não houver histórico (ex: deep-link direto) */
  fallback?: string;
  /** Rótulo do link */
  label?: string;
  className?: string;
}

/**
 * Botão de "Voltar" que usa o histórico do navegador.
 * Em deep-links sem histórico anterior, navega para `fallback` (default `/`).
 */
export function PageBack({
  fallback = "/",
  label = "Voltar",
  className,
}: PageBackProps) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-2",
        "text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)]",
        "text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-gold)]",
        "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
        className,
      )}
    >
      <ArrowLeft
        className="h-3.5 w-3.5 transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out-3)] group-hover:-translate-x-0.5"
        strokeWidth={1.5}
      />
      {label}
    </button>
  );
}
