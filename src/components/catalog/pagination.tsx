"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Quantos números mostrar ao redor da página atual */
  siblings?: number;
}

export function Pagination({ page, totalPages, siblings = 1 }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (p: number): string => {
    const next = new URLSearchParams(searchParams.toString());
    if (p === 1) next.delete("page");
    else next.set("page", String(p));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pages = pageWindow(page, totalPages, siblings);

  return (
    <nav
      role="navigation"
      aria-label="Paginação"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      <PageLink
        href={buildHref(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
      </PageLink>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-2 text-[color:var(--color-fg-mute)] font-[var(--font-mono)] text-[0.875rem]"
          >
            ···
          </span>
        ) : (
          <PageLink
            key={p}
            href={buildHref(p)}
            active={p === page}
            aria-label={`Página ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </PageLink>
        ),
      )}

      <PageLink
        href={buildHref(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLAnchorElement>) {
  const baseClasses = cn(
    "inline-flex h-9 min-w-9 items-center justify-center px-3",
    "rounded-[var(--radius-pill)] text-[0.875rem] font-[var(--font-mono)]",
    "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
    active
      ? "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]"
      : "text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-elevated)]",
    disabled && "pointer-events-none opacity-30",
  );
  if (disabled) {
    return (
      <span className={baseClasses} aria-disabled {...rest}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={baseClasses} {...rest}>
      {children}
    </Link>
  );
}

function pageWindow(current: number, total: number, siblings: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const first = 1;
  const last = total;
  const left = Math.max(first + 1, current - siblings);
  const right = Math.min(last - 1, current + siblings);

  out.push(first);
  if (left > first + 1) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < last - 1) out.push("…");
  if (last > first) out.push(last);
  return out;
}
