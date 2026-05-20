"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VariantSelector } from "@/components/product/variant-selector";
import { WishlistButton } from "@/components/product/wishlist-button";
import { CepCalculator } from "@/components/product/cep-calculator";
import { useCart } from "@/stores/cart-store";
import { cn, formatBRL, formatDate } from "@/lib/utils";
import type { Product } from "@/server/queries/products";

interface ProductActionsProps {
  product: Product;
}

/**
 * Bloco direito da página de produto:
 *  - Cabeçalho (eyebrow, nome, preço, pré-venda)
 *  - Seletor de variação
 *  - Quantity stepper
 *  - Botões: Adicionar / Favoritar
 *  - Cooldown visual após adicionar
 */
export function ProductActions({ product }: ProductActionsProps) {
  const firstVariant = product.variants[0]!;
  const [selectedId, setSelectedId] = React.useState(firstVariant.id);
  const [qty, setQty] = React.useState(1);
  const [justAdded, setJustAdded] = React.useState(false);

  const variant = product.variants.find((v) => v.id === selectedId) ?? firstVariant;
  const unitPrice = variant.priceOverride ?? product.basePrice;
  const totalPrice = unitPrice * qty;
  const outOfStock = variant.stock === 0;

  const addLine = useCart((s) => s.addLine);

  React.useEffect(() => {
    setQty(1);
  }, [selectedId]);

  const handleAdd = () => {
    if (outOfStock) return;
    const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
    addLine({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      imageUrl: variant.imageUrl ?? primaryImage?.url ?? null,
      unitPrice,
      quantity: qty,
      isPreOrder: product.isPreOrder,
      releaseDate: product.releaseDate ? product.releaseDate.toISOString() : null,
      stockAtAdd: variant.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Cabeçalho */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {product.franchise && (
            <span className="eyebrow">{product.franchise}</span>
          )}
          {product.brand && (
            <>
              <span aria-hidden className="text-[color:var(--color-fg-mute)]">·</span>
              <span className="eyebrow">{product.brand}</span>
            </>
          )}
        </div>

        <h1 className="display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05]">
          {product.name}
        </h1>

        {product.shortDescription && (
          <p className="mt-4 text-[var(--text-lead)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
            {product.shortDescription}
          </p>
        )}

        {/* Preço */}
        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="font-[var(--font-display)] text-[clamp(1.875rem,4vw,2.5rem)] font-light leading-none text-[color:var(--color-fg)]">
            {formatBRL(unitPrice)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > unitPrice && (
            <>
              <span className="font-[var(--font-mono)] text-[0.9375rem] text-[color:var(--color-fg-mute)] line-through">
                {formatBRL(product.compareAtPrice)}
              </span>
              <Badge variant="goldSolid" size="md">
                {`-${Math.round((1 - unitPrice / product.compareAtPrice) * 100)}%`}
              </Badge>
            </>
          )}
        </div>

        <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
          ou 12x de <strong className="font-medium text-[color:var(--color-fg)]">{formatBRL(unitPrice / 12)}</strong> sem juros
        </p>
      </div>

      {/* Pré-venda info */}
      {product.isPreOrder && product.releaseDate && (
        <div
          className={cn(
            "relative rounded-[var(--radius-md)] border border-[color:var(--color-gold)]/40",
            "bg-[color:var(--color-gold)]/8 px-5 py-4",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="font-[var(--font-jp)] text-[1.5rem] leading-none font-black text-[color:var(--color-gold)] mt-0.5"
            >
              予約
            </span>
            <div>
              <p className="eyebrow text-[color:var(--color-gold)]">Pré-venda</p>
              <p className="mt-1.5 text-[0.9375rem] text-[color:var(--color-fg)] leading-snug">
                Lançamento previsto para{" "}
                <strong className="font-medium">{formatDate(product.releaseDate)}</strong>.
                Pagamento agora, envio assim que o produto chegar ao Brasil.
              </p>
              {product.preOrderEndsAt && (
                <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                  Reservas até {formatDate(product.preOrderEndsAt)}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seletor de variação */}
      <VariantSelector
        product={product}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Quantity + Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={qty}
            onChange={setQty}
            min={1}
            max={Math.max(1, variant.stock)}
            disabled={outOfStock}
          />
          <Button
            size="lg"
            onClick={handleAdd}
            disabled={outOfStock || justAdded}
            className="flex-1"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" strokeWidth={2} />
                Adicionado · {formatBRL(totalPrice)}
              </>
            ) : outOfStock ? (
              "Esgotado"
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                Adicionar · {formatBRL(totalPrice)}
              </>
            )}
          </Button>
        </div>

        <WishlistButton
          productId={product.id}
          productSlug={product.slug}
          variant="inline"
          className="w-full"
        />
      </div>

      {/* Cotação de frete */}
      <CepCalculator
        productId={product.id}
        weightGrams={product.weight}
        dimensions={product.dimensions}
        unitPrice={unitPrice}
      />

      {/* Trust strip */}
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-7 border-t border-[color:var(--color-hairline)] text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
        <li>
          <p className="eyebrow text-[color:var(--color-fg-soft)] mb-1">Envio</p>
          Itapetininga/SP via Melhor Envio
        </li>
        <li>
          <p className="eyebrow text-[color:var(--color-fg-soft)] mb-1">NF-e</p>
          Emitida no envio
        </li>
        <li>
          <p className="eyebrow text-[color:var(--color-fg-soft)] mb-1">Trocas</p>
          7 dias após receber
        </li>
      </ul>
    </div>
  );
}

function QuantityStepper({
  value,
  onChange,
  min,
  max,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center h-14",
        "border border-[color:var(--color-border-strong)] rounded-[var(--radius-md)]",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Diminuir quantidade"
        className="h-full w-12 inline-flex items-center justify-center text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <span className="w-10 text-center font-[var(--font-mono)] text-[0.9375rem] tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Aumentar quantidade"
        className="h-full w-12 inline-flex items-center justify-center text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
