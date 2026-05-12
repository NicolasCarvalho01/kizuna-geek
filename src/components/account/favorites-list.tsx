"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, BellOff, Heart, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/stores/wishlist-store";
import { cn, formatBRL, formatDate } from "@/lib/utils";

interface FavoriteProduct {
  id: string;
  slug: string;
  name: string;
  franchise: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  isPreOrder: boolean;
  releaseDate: string | null;
  image: string | null;
  stock: number;
}

interface FavoritesListProps {
  products: FavoriteProduct[];
}

export function FavoritesList({ products }: FavoritesListProps) {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const toggleNotify = useWishlist((s) => s.toggleNotify);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <FavoritesSkeleton />;
  }

  const productsById = new Map(products.map((p) => [p.id, p]));
  const favorites = items
    .map((item) => ({ item, product: productsById.get(item.productId) }))
    .filter((x): x is { item: typeof items[number]; product: FavoriteProduct } =>
      Boolean(x.product),
    );

  if (favorites.length === 0) {
    return <EmptyFavorites />;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
      {favorites.map(({ item, product }) => (
        <li key={product.id} className="relative group">
          <Link href={`/produto/${product.slug}`} className="block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-bg-sunken)]">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[var(--motion-slowest)] ease-[var(--ease-out-5)] group-hover:scale-[1.04]"
                />
              )}

              {product.isPreOrder && (
                <div className="absolute top-3 left-3">
                  <Badge variant="gold" size="md">
                    Pré-venda
                  </Badge>
                </div>
              )}
              {product.stock === 0 && !product.isPreOrder && (
                <div className="absolute top-3 left-3">
                  <Badge variant="vermilion" size="md">
                    Esgotado
                  </Badge>
                </div>
              )}
            </div>

            <div className="mt-4">
              {product.franchise && (
                <p className="eyebrow truncate">{product.franchise}</p>
              )}
              <h3 className="mt-2 font-[var(--font-display)] text-[1.0625rem] leading-snug text-[color:var(--color-fg)] group-hover:text-[color:var(--color-gold)] transition-colors">
                {product.name}
              </h3>
              <p className="mt-2 font-[var(--font-mono)] text-[0.875rem] text-[color:var(--color-fg)]">
                {formatBRL(product.basePrice)}
              </p>
              {product.isPreOrder && product.releaseDate && (
                <p className="mt-1 eyebrow text-[color:var(--color-gold)]">
                  Lança em {formatDate(new Date(product.releaseDate))}
                </p>
              )}
            </div>
          </Link>

          {/* Ações flutuantes */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleNotify(product.id)}
              aria-pressed={item.notifyOnRestock}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] border",
                "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                item.notifyOnRestock
                  ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]"
                  : "border-[color:var(--color-border)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)]",
              )}
              title={
                item.notifyOnRestock
                  ? "Você será notificado quando voltar ao estoque"
                  : "Ativar notificação"
              }
            >
              {item.notifyOnRestock ? (
                <Bell className="h-3 w-3" strokeWidth={1.5} />
              ) : (
                <BellOff className="h-3 w-3" strokeWidth={1.5} />
              )}
              {item.notifyOnRestock ? "Alertar" : "Alerta off"}
            </button>

            <button
              type="button"
              onClick={() => remove(product.id)}
              aria-label="Remover dos favoritos"
              className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded-[var(--radius-pill)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-vermilion)] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FavoritesSkeleton() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <div className="aspect-[4/5] rounded-[var(--radius-md)] bg-[color:var(--color-bg-sunken)] animate-pulse" />
          <div className="mt-4 h-4 w-1/3 bg-[color:var(--color-bg-sunken)] rounded animate-pulse" />
          <div className="mt-2 h-5 w-2/3 bg-[color:var(--color-bg-sunken)] rounded animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function EmptyFavorites() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 lg:p-14 text-center">
      <Heart className="h-9 w-9 mx-auto text-[color:var(--color-gold)]/60" strokeWidth={1.5} />
      <h3 className="display text-[1.5rem] mt-5">Sem favoritos ainda</h3>
      <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] max-w-md mx-auto leading-[var(--leading-relaxed)]">
        Toque no coração de qualquer peça pra adicionar aqui. Ative o sino e te
        avisamos quando voltar ao estoque ou sair da pré-venda.
      </p>
      <Button asChild className="mt-6">
        <Link href="/catalogo">Explorar o catálogo</Link>
      </Button>
    </div>
  );
}
