"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn, formatBRL } from "@/lib/utils";
import type { Product, Variant } from "@/server/queries/products";
import type { TcgCondition, FigureBoxCondition } from "@prisma/client";

interface VariantSelectorProps {
  product: Product;
  selectedId: string;
  onSelect: (variantId: string) => void;
}

const LANG_LABEL: Record<string, string> = {
  PT: "Português", EN: "Inglês", JP: "Japonês", ES: "Espanhol",
  KR: "Coreano", CN: "Chinês", FR: "Francês", DE: "Alemão", IT: "Italiano",
};

const COND_LABEL: Record<TcgCondition, string> = {
  MINT: "Mint", NEAR_MINT: "Near Mint", LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Moderately Played", HEAVILY_PLAYED: "Heavily Played",
  DAMAGED: "Damaged",
};

const BOX_LABEL: Record<FigureBoxCondition, string> = {
  MINT: "Caixa Mint",
  GOOD: "Caixa Boa",
  FAIR: "Caixa Razoável",
  DAMAGED: "Caixa Danificada",
  NO_BOX: "Sem caixa (loose)",
};

/**
 * Seletor de variação inteligente — UI muda conforme `productType`.
 *
 * - TCG_SINGLE / TCG_SEALED → grupos de Idioma + Condição + Foil
 * - ACTION_FIGURE / COLLECTIBLE → grupos de "Com/sem caixa" + Escala
 * - Outros → lista simples por nome
 */
export function VariantSelector({ product, selectedId, onSelect }: VariantSelectorProps) {
  const isTcg = product.productType === "TCG_SINGLE" || product.productType === "TCG_SEALED";
  const isFigure = product.productType === "ACTION_FIGURE" || product.productType === "COLLECTIBLE";

  const active = product.variants.find((v) => v.id === selectedId) ?? product.variants[0];

  // Para produtos com 1 só variante "default", não renderizamos o seletor
  if (product.variants.length === 1) {
    const v = product.variants[0]!;
    return (
      <div className="rounded-[var(--radius-md)] border border-[color:var(--color-hairline)] p-4">
        <p className="eyebrow">Disponibilidade</p>
        <p className="mt-2 font-[var(--font-display)] text-[1.125rem]">{v.name}</p>
        <StockLine variant={v} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTcg ? (
        <TcgGroups product={product} selectedId={selectedId} onSelect={onSelect} />
      ) : isFigure ? (
        <FigureGroups product={product} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <PlainList product={product} selectedId={selectedId} onSelect={onSelect} />
      )}

      {active && (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-hairline)] bg-[color:var(--color-bg-elevated)] p-4">
          <p className="eyebrow">Variante selecionada</p>
          <p className="mt-2 font-[var(--font-display)] text-[1.125rem]">{active.name}</p>
          <StockLine variant={active} />
        </div>
      )}
    </div>
  );
}

// =====================================================================
// GRUPOS POR TIPO
// =====================================================================

function TcgGroups({ product, selectedId, onSelect }: VariantSelectorProps) {
  const langs = [...new Set(product.variants.map((v) => v.tcgLanguage).filter(Boolean))] as string[];
  const conditions = [...new Set(product.variants.map((v) => v.tcgCondition).filter(Boolean))] as TcgCondition[];
  const hasFoilVariants = product.variants.some((v) => v.tcgIsFoil !== null);

  const current = product.variants.find((v) => v.id === selectedId) ?? product.variants[0]!;

  function selectMatching(partial: Partial<Variant>) {
    const candidate = product.variants.find((v) =>
      Object.entries(partial).every(([k, val]) => (v as unknown as Record<string, unknown>)[k] === val),
    );
    if (candidate) onSelect(candidate.id);
  }

  return (
    <>
      {langs.length > 1 && (
        <Group label="Idioma">
          {langs.map((lang) => (
            <Chip
              key={lang}
              active={current.tcgLanguage === lang}
              onClick={() => selectMatching({ tcgLanguage: lang as Variant["tcgLanguage"] })}
            >
              {LANG_LABEL[lang] ?? lang}
            </Chip>
          ))}
        </Group>
      )}

      {conditions.length > 1 && (
        <Group label="Condição">
          {conditions.map((c) => (
            <Chip
              key={c}
              active={current.tcgCondition === c}
              onClick={() => selectMatching({ tcgLanguage: current.tcgLanguage, tcgCondition: c })}
            >
              {COND_LABEL[c]}
            </Chip>
          ))}
        </Group>
      )}

      {hasFoilVariants && (
        <Group label="Acabamento">
          {[true, false].map((foil) => {
            const exists = product.variants.some((v) => v.tcgIsFoil === foil);
            if (!exists) return null;
            return (
              <Chip
                key={String(foil)}
                active={current.tcgIsFoil === foil}
                onClick={() => selectMatching({
                  tcgLanguage: current.tcgLanguage,
                  tcgCondition: current.tcgCondition,
                  tcgIsFoil: foil,
                })}
              >
                {foil ? "Foil" : "Non-foil"}
              </Chip>
            );
          })}
        </Group>
      )}
    </>
  );
}

function FigureGroups({ product, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <Group label="Edição">
      {product.variants.map((v) => {
        const label =
          v.figureBoxCondition && BOX_LABEL[v.figureBoxCondition]
            ? BOX_LABEL[v.figureBoxCondition]
            : v.name;
        const price = v.priceOverride ?? product.basePrice;
        const active = v.id === selectedId;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v.id)}
            disabled={!v.isActive || v.stock === 0}
            className={cn(
              "group relative flex flex-col items-start gap-1 px-4 py-3 text-left",
              "rounded-[var(--radius-md)] border",
              "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
              active
                ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/8"
                : "border-[color:var(--color-border)] hover:border-[color:var(--color-fg-soft)]",
              (!v.isActive || v.stock === 0) && "opacity-40 cursor-not-allowed",
            )}
          >
            <span className="flex items-center gap-2 text-[0.9375rem] text-[color:var(--color-fg)]">
              {active && <Check className="h-3.5 w-3.5 text-[color:var(--color-gold)]" strokeWidth={2.5} />}
              {label}
            </span>
            <span className="font-[var(--font-mono)] text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              {formatBRL(price)}
            </span>
            {v.stock === 0 && (
              <span className="absolute top-2 right-2 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-vermilion)]">
                Esgotado
              </span>
            )}
          </button>
        );
      })}
    </Group>
  );
}

function PlainList({ product, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <Group label="Opções">
      {product.variants.map((v) => (
        <Chip key={v.id} active={v.id === selectedId} onClick={() => onSelect(v.id)} disabled={v.stock === 0}>
          {v.name}
        </Chip>
      ))}
    </Group>
  );
}

// =====================================================================
// PRIMITIVOS
// =====================================================================

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-3.5 py-2 rounded-[var(--radius-pill)] text-[0.875rem] border",
        "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
        active
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]"
          : "border-[color:var(--color-border)] text-[color:var(--color-fg)] hover:border-[color:var(--color-fg-soft)]",
        disabled && "opacity-40 cursor-not-allowed line-through",
      )}
    >
      {children}
    </button>
  );
}

function StockLine({ variant }: { variant: Variant }) {
  if (variant.stock === 0) {
    return (
      <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)]">
        Esgotado no momento — entre na lista de espera.
      </p>
    );
  }
  if (variant.stock <= variant.lowStockThreshold) {
    return (
      <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)]">
        Últimas {variant.stock} {variant.stock === 1 ? "unidade" : "unidades"} disponíveis.
      </p>
    );
  }
  return (
    <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
      {variant.stock} unidades disponíveis · SKU {variant.sku}
    </p>
  );
}
