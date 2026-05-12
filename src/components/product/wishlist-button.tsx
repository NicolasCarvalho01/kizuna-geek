"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  productSlug: string;
  /** Compact = ícone redondo (cards); inline = ícone + texto (página do produto) */
  variant?: "compact" | "inline";
  className?: string;
}

export function WishlistButton({
  productId,
  productSlug,
  variant = "compact",
  className,
}: WishlistButtonProps) {
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.items.some((i) => i.productId === productId));
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId, productSlug);
  };

  // SSR-safe: durante hidratação assume "não favoritado"
  const active = mounted && has;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center justify-center gap-2 h-14 px-9 rounded-[var(--radius-md)]",
          "border text-[0.9375rem]",
          "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
          active
            ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/8 text-[color:var(--color-gold)]"
            : "border-[color:var(--color-border-strong)] text-[color:var(--color-fg)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
          className,
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-transform duration-[var(--motion-base)] ease-[var(--ease-out-5)]",
            active && "fill-current scale-110",
          )}
          strokeWidth={1.5}
        />
        {active ? "Salvo nos favoritos" : "Salvar nos favoritos"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "absolute top-3 right-3 z-10",
        "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-pill)]",
        "transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
        active
          ? "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] shadow-[var(--shadow-2)]"
          : "bg-[color:var(--color-bg)]/85 backdrop-blur text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-gold)] hover:bg-[color:var(--color-bg)]",
        "border border-[color:var(--color-border)]",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-[var(--motion-base)] ease-[var(--ease-out-5)]",
          active && "fill-current scale-110",
        )}
        strokeWidth={1.5}
      />
    </button>
  );
}
