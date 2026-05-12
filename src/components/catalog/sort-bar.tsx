"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, Rows3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "featured", label: "Destaques" },
  { value: "newest", label: "Mais recentes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "name-asc", label: "Nome A → Z" },
] as const;

interface SortBarProps {
  total: number;
  page: number;
  perPage: number;
}

export function SortBar({ total, page, perPage }: SortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "featured";
  const currentDensity = searchParams.get("view") ?? "grid";

  const setParam = React.useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      // Resetar página ao mudar sort
      if (key === "sort") next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
      <p className="font-[var(--font-mono)] text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-fg-soft)]">
        {total === 0
          ? "Nenhum item encontrado"
          : `Mostrando ${start}–${end} de ${total}`}
      </p>

      <div className="flex items-center gap-3">
        {/* Sort select */}
        <div className="flex items-center gap-2">
          <span className="eyebrow hidden sm:inline">Ordenar por</span>
          <Select
            value={currentSort}
            onValueChange={(v) => setParam("sort", v === "featured" ? null : v)}
          >
            <SelectTrigger className="h-9 w-44 text-[0.875rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Density toggle */}
        <div className="hidden md:inline-flex items-center rounded-[var(--radius-pill)] border border-[color:var(--color-border)] p-1">
          {[
            { key: "grid", Icon: LayoutGrid, label: "Grade" },
            { key: "rows", Icon: Rows3, label: "Lista" },
          ].map(({ key, Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setParam("view", key === "grid" ? null : key)}
              aria-label={`Visualização em ${label}`}
              aria-pressed={currentDensity === key}
              className={cn(
                "h-7 w-7 rounded-[var(--radius-pill)] inline-flex items-center justify-center",
                "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                currentDensity === key
                  ? "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]"
                  : "text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)]",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
