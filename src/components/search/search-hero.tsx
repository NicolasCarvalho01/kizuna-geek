"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchHeroProps {
  defaultValue?: string;
  /** Auto-focus quando renderizado na página de busca */
  autoFocus?: boolean;
}

/**
 * Input de busca grande, editorial — usado na página /buscar.
 * Submit via Enter; clear via X.
 */
export function SearchHero({ defaultValue = "", autoFocus = true }: SearchHeroProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState(defaultValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar");
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative">
      <Search
        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--color-fg-mute)] pointer-events-none"
        strokeWidth={1.5}
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Charizard, Nendoroid, Saitama…"
        aria-label="Buscar produtos"
        className={cn(
          "w-full bg-transparent",
          "font-[var(--font-display)] italic text-[clamp(1.5rem,3vw,2.25rem)] font-light",
          "py-3 pl-9 pr-12",
          "border-b border-[color:var(--color-border-strong)]",
          "placeholder:text-[color:var(--color-fg-mute)] placeholder:italic placeholder:font-light",
          "focus:outline-none focus:border-[color:var(--color-gold)]",
          "transition-colors duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Limpar busca"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center rounded-[var(--radius-pill)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)] transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      )}
    </form>
  );
}
