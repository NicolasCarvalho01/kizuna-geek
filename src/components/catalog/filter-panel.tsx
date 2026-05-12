"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FilterFacets } from "@/server/queries/products";
import type { CategoryType, TcgLanguage, TcgCondition } from "@prisma/client";

interface FilterPanelProps {
  facets: FilterFacets;
  /** Tipo de categoria atual — define quais filtros específicos mostrar */
  categoryType?: CategoryType;
}

const TCG_LANGUAGE_LABELS: Record<TcgLanguage, string> = {
  PT: "Português",
  EN: "Inglês",
  JP: "Japonês",
  ES: "Espanhol",
  KR: "Coreano",
  CN: "Chinês",
  FR: "Francês",
  DE: "Alemão",
  IT: "Italiano",
};

const TCG_CONDITION_LABELS: Record<TcgCondition, string> = {
  MINT: "Mint (M)",
  NEAR_MINT: "Near Mint (NM)",
  LIGHTLY_PLAYED: "Lightly Played (LP)",
  MODERATELY_PLAYED: "Moderately Played (MP)",
  HEAVILY_PLAYED: "Heavily Played (HP)",
  DAMAGED: "Danificada (DMG)",
};

export function FilterPanel({ facets, categoryType }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = (key: string) => searchParams.get(key) ?? "";
  const getMulti = (key: string) =>
    (searchParams.get(key) ?? "").split(",").filter(Boolean);

  const set = React.useCallback(
    (params: Record<string, string | string[] | null | boolean>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (
          value === null ||
          value === false ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          next.delete(key);
        } else if (Array.isArray(value)) {
          next.set(key, value.join(","));
        } else if (typeof value === "boolean") {
          next.set(key, "true");
        } else {
          next.set(key, value);
        }
      });
      // Sempre resetar página ao filtrar
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const toggleMulti = (key: string, value: string) => {
    const current = getMulti(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    set({ [key]: next });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  // Conta filtros ativos (excluindo paginação/sort/view)
  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (k) => !["page", "sort", "view"].includes(k),
  ).length;

  const isTcg = categoryType === "TCG";
  const isFigure = categoryType === "ACTION_FIGURE" || categoryType === "COLLECTIBLE";

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto -mx-2 px-2 pb-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="eyebrow">Filtros</h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-gold)] transition-colors"
          >
            <X className="h-3 w-3" strokeWidth={1.5} />
            Limpar ({activeFilterCount})
          </button>
        )}
      </div>

      <Separator className="mb-5" />

      {/* Busca dentro do catálogo */}
      <FilterGroup title="Buscar nesta categoria">
        <Input
          type="search"
          inputMode="search"
          defaultValue={get("q")}
          onBlur={(e) => set({ q: e.currentTarget.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              set({ q: e.currentTarget.value });
            }
          }}
          placeholder="Personagem, edição…"
          className="h-10"
        />
      </FilterGroup>

      {/* Disponibilidade */}
      <FilterGroup title="Disponibilidade">
        <CheckboxRow
          checked={get("inStock") === "true"}
          onChange={() => set({ inStock: get("inStock") === "true" ? null : true })}
          label="Em estoque"
        />
        <CheckboxRow
          checked={get("preorder") === "true"}
          onChange={() => set({ preorder: get("preorder") === "true" ? null : true })}
          label="Apenas pré-vendas"
        />
      </FilterGroup>

      {/* Franquia */}
      {facets.franchises.length > 0 && (
        <FilterGroup title="Franquia">
          <Pills
            options={facets.franchises}
            selected={getMulti("franchise")}
            onToggle={(v) => toggleMulti("franchise", v)}
          />
        </FilterGroup>
      )}

      {/* Marca */}
      {facets.brands.length > 0 && (
        <FilterGroup title="Marca / Fabricante">
          <Pills
            options={facets.brands}
            selected={getMulti("brand")}
            onToggle={(v) => toggleMulti("brand", v)}
          />
        </FilterGroup>
      )}

      {/* Filtros TCG */}
      {isTcg && facets.tcgLanguages.length > 0 && (
        <FilterGroup title="Idioma (TCG)">
          <CheckboxList>
            {facets.tcgLanguages.map((lang) => (
              <CheckboxRow
                key={lang}
                checked={getMulti("tcgLang").includes(lang)}
                onChange={() => toggleMulti("tcgLang", lang)}
                label={TCG_LANGUAGE_LABELS[lang]}
              />
            ))}
          </CheckboxList>
        </FilterGroup>
      )}

      {isTcg && facets.tcgConditions.length > 0 && (
        <FilterGroup title="Condição (TCG)">
          <CheckboxList>
            {facets.tcgConditions.map((c) => (
              <CheckboxRow
                key={c}
                checked={getMulti("tcgCond").includes(c)}
                onChange={() => toggleMulti("tcgCond", c)}
                label={TCG_CONDITION_LABELS[c]}
              />
            ))}
          </CheckboxList>
          <div className="mt-3">
            <CheckboxRow
              checked={get("tcgFoil") === "true"}
              onChange={() => set({ tcgFoil: get("tcgFoil") === "true" ? null : true })}
              label="Apenas Foil"
            />
          </div>
        </FilterGroup>
      )}

      {/* Filtros Figure / Colecionável */}
      {isFigure && (
        <FilterGroup title="Caixa">
          <CheckboxRow
            checked={get("hasBox") === "true"}
            onChange={() =>
              set({ hasBox: get("hasBox") === "true" ? null : true, noBox: null })
            }
            label="Com caixa original"
          />
          <CheckboxRow
            checked={get("noBox") === "true"}
            onChange={() =>
              set({ noBox: get("noBox") === "true" ? null : true, hasBox: null })
            }
            label="Sem caixa (loose)"
          />
        </FilterGroup>
      )}

      {/* Faixa de preço */}
      <FilterGroup title="Faixa de preço">
        <PriceRange
          rangeMin={facets.priceRange.min}
          rangeMax={facets.priceRange.max}
          valueMin={Number(get("minPrice")) || undefined}
          valueMax={Number(get("maxPrice")) || undefined}
          onChange={(min, max) =>
            set({
              minPrice: min !== undefined ? String(min) : null,
              maxPrice: max !== undefined ? String(max) : null,
            })
          }
        />
      </FilterGroup>
    </aside>
  );
}

// =====================================================================
// SUB-COMPONENTES
// =====================================================================

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={cn(
        "group flex w-full items-center gap-3 py-1.5 text-left text-[0.875rem]",
        "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
        checked
          ? "text-[color:var(--color-fg)]"
          : "text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]",
      )}
    >
      <span
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px]",
          "border transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
          checked
            ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]"
            : "border-[color:var(--color-border-strong)] group-hover:border-[color:var(--color-fg-soft)]",
        )}
      >
        {checked && <Check className="h-3 w-3 text-[color:var(--color-gold-ink)]" strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </button>
  );
}

function Pills({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "px-3 py-1.5 text-[0.8125rem] rounded-[var(--radius-pill)] border",
              "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
              active
                ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]"
                : "border-[color:var(--color-border)] text-[color:var(--color-fg-soft)] hover:border-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function PriceRange({
  rangeMin,
  rangeMax,
  valueMin,
  valueMax,
  onChange,
}: {
  rangeMin: number;
  rangeMax: number;
  valueMin?: number;
  valueMax?: number;
  onChange: (min?: number, max?: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          min={rangeMin}
          max={rangeMax}
          placeholder={`R$ ${rangeMin.toFixed(0)}`}
          defaultValue={valueMin}
          onBlur={(e) => onChange(Number(e.currentTarget.value) || undefined, valueMax)}
          className="h-10"
        />
        <Input
          type="number"
          min={rangeMin}
          max={rangeMax}
          placeholder={`R$ ${rangeMax.toFixed(0)}`}
          defaultValue={valueMax}
          onBlur={(e) => onChange(valueMin, Number(e.currentTarget.value) || undefined)}
          className="h-10"
        />
      </div>
      <p className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
        Faixa do catálogo: R$ {rangeMin.toFixed(0)} – R$ {rangeMax.toFixed(0)}
      </p>
    </div>
  );
}

/**
 * Lista de filtros ativos como pills — mostrada acima do grid.
 */
export function ActiveFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active: Array<{ key: string; label: string; remove: () => void }> = [];

  searchParams.forEach((value, key) => {
    if (["page", "sort", "view"].includes(key)) return;
    const remove = () => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete(key);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    };
    if (key === "q") active.push({ key, label: `Busca: "${value}"`, remove });
    else if (key === "inStock") active.push({ key, label: "Em estoque", remove });
    else if (key === "preorder") active.push({ key, label: "Pré-venda", remove });
    else if (key === "tcgFoil") active.push({ key, label: "Foil", remove });
    else if (key === "hasBox") active.push({ key, label: "Com caixa", remove });
    else if (key === "noBox") active.push({ key, label: "Sem caixa", remove });
    else if (key === "minPrice") active.push({ key, label: `≥ R$ ${value}`, remove });
    else if (key === "maxPrice") active.push({ key, label: `≤ R$ ${value}`, remove });
    else active.push({ key, label: value, remove });
  });

  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="eyebrow mr-1">Filtros ativos</span>
      {active.map((f, i) => (
        <Badge key={`${f.key}-${i}`} variant="gold" size="md" className="gap-1.5">
          {f.label}
          <button
            type="button"
            onClick={f.remove}
            className="inline-flex items-center justify-center rounded-full hover:bg-[color:var(--color-gold)]/20 p-0.5"
            aria-label={`Remover filtro ${f.label}`}
          >
            <X className="h-3 w-3" strokeWidth={1.5} />
          </button>
        </Badge>
      ))}
    </div>
  );
}
