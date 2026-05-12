import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/product/wishlist-button";
import { cn, formatBRL, formatDate } from "@/lib/utils";
import type { Product } from "@/server/queries/products";

interface ProductCardProps {
  product: Product;
  /** Compacto = card menor (catálogo); editorial = card maior (homepage picks) */
  variant?: "compact" | "editorial";
  /** Lazy load — false só para acima da dobra */
  priority?: boolean;
  className?: string;
}

function fromPrice(product: Product): { price: number; compareAt: number | null } {
  const minVariantPrice = Math.min(
    ...product.variants.map((v) => v.priceOverride ?? product.basePrice),
  );
  return {
    price: minVariantPrice,
    compareAt: product.compareAtPrice,
  };
}

function pickBadge(p: Product): { label: string; tone: "gold" | "soft" | "vermilion" } | null {
  if (p.isPreOrder) return { label: "Pré-venda", tone: "gold" };
  if (p.tags.some((t) => t.slug === "raro")) return { label: "Raro", tone: "vermilion" };
  if (p.tags.some((t) => t.slug === "lancamento")) return { label: "Lançamento", tone: "soft" };
  if (p.tags.some((t) => t.slug === "promocao")) return { label: "Promoção", tone: "soft" };
  return null;
}

export function ProductCard({
  product,
  variant = "compact",
  priority = false,
  className,
}: ProductCardProps) {
  const { price, compareAt } = fromPrice(product);
  const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];
  const badge = pickBadge(product);
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const lowStock = totalStock > 0 && totalStock <= 3;
  const isEditorial = variant === "editorial";

  return (
    <Link
      href={`/produto/${product.slug}`}
      className={cn(
        "group block isolate",
        "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-out-5)]",
        "hover:-translate-y-1",
        className,
      )}
    >
      {/* Image frame */}
      <div
        className={cn(
          "relative overflow-hidden bg-[color:var(--color-bg-sunken)]",
          isEditorial
            ? "aspect-[4/5] rounded-[var(--radius-lg)]"
            : "aspect-[4/5] rounded-[var(--radius-md)]",
        )}
      >
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes={isEditorial ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-[var(--motion-slowest)] ease-[var(--ease-out-5)] group-hover:scale-[1.04]"
            priority={priority}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {badge && (
            <Badge variant={badge.tone} size={isEditorial ? "lg" : "md"}>
              {badge.label}
            </Badge>
          )}
          {compareAt && compareAt > price && (
            <Badge variant="goldSolid" size="sm">
              {`-${Math.round((1 - price / compareAt) * 100)}%`}
            </Badge>
          )}
        </div>

        {/* Wishlist toggle (canto direito top) */}
        <WishlistButton productId={product.id} productSlug={product.slug} />

        {/* Stock indicator (canto direito bottom) */}
        {lowStock && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--color-bg)]/90 backdrop-blur px-2 py-1 text-[10px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-vermilion)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-vermilion)]" />
            Últimas {totalStock} {totalStock === 1 ? "unidade" : "unidades"}
          </span>
        )}

        {/* Hover ring dourada */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-[inherit] pointer-events-none ring-1 ring-inset ring-transparent",
            "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
            "group-hover:ring-[color:var(--color-gold)]/60",
          )}
        />
      </div>

      {/* Meta */}
      <div className={cn("mt-4", isEditorial && "mt-6")}>
        {product.franchise && (
          <p className="eyebrow truncate">{product.franchise}</p>
        )}
        <h3
          className={cn(
            "mt-2 font-[var(--font-display)] leading-snug",
            isEditorial
              ? "text-[clamp(1.25rem,2vw,1.75rem)]"
              : "text-[1.0625rem]",
            "text-[color:var(--color-fg)] group-hover:text-[color:var(--color-gold)] transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
          )}
        >
          {product.name}
        </h3>

        {/* Pre-order release date */}
        {product.isPreOrder && product.releaseDate && (
          <p className="mt-2 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-gold)]">
            Lança em {formatDate(product.releaseDate)}
          </p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-[var(--font-mono)] text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
            {formatBRL(price)}
          </span>
          {compareAt && compareAt > price && (
            <span className="font-[var(--font-mono)] text-[var(--text-eyebrow)] text-[color:var(--color-fg-mute)] line-through">
              {formatBRL(compareAt)}
            </span>
          )}
        </div>

        {isEditorial && (
          <span
            className={cn(
              "mt-4 inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-gold)]",
              "transition-transform duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
              "group-hover:translate-x-1",
            )}
          >
            Ver peça
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
        )}
      </div>
    </Link>
  );
}
