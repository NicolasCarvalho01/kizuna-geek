"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart, cartSubtotal, cartHasPreOrder, type CartLine } from "@/stores/cart-store";
import { cn, formatBRL, formatDate } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(cartSubtotal);
  const hasPreOrder = useCart(cartHasPreOrder);

  const totalItems = lines.reduce((acc, l) => acc + l.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader>
          <div className="flex items-center justify-between pr-10">
            <SheetTitle>Sua sacola</SheetTitle>
            {totalItems > 0 && (
              <Badge variant="gold" size="md">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </Badge>
            )}
          </div>
          <SheetDescription>
            {totalItems === 0
              ? "Ainda não há nada aqui. Volte ao catálogo e adicione peças."
              : "Revise os itens antes de finalizar a compra."}
          </SheetDescription>
        </SheetHeader>

        {/* Body */}
        {lines.length === 0 ? (
          <EmptyState onClose={close} />
        ) : (
          <ul className="flex-1 overflow-y-auto px-7 py-5 divide-y divide-[color:var(--color-hairline)]">
            {lines.map((line) => (
              <li key={line.variantId} className="py-5 first:pt-0">
                <CartLineRow line={line} />
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {lines.length > 0 && (
          <div className="border-t border-[color:var(--color-border)] px-7 py-6 space-y-4">
            {hasPreOrder && (
              <div className="rounded-[var(--radius-sm)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-3 text-[var(--text-caption)] text-[color:var(--color-fg)] leading-snug">
                <strong className="font-medium text-[color:var(--color-gold)]">Atenção:</strong>{" "}
                seu carrinho tem item(ns) em pré-venda. O envio ocorre após o lançamento.
              </div>
            )}

            <div className="flex items-baseline justify-between">
              <span className="text-[var(--text-caption)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-soft)]">
                Subtotal
              </span>
              <span className="font-[var(--font-display)] text-[1.5rem] leading-none text-[color:var(--color-fg)]">
                {formatBRL(subtotal)}
              </span>
            </div>

            <p className="text-[var(--text-caption)] text-[color:var(--color-fg-mute)]">
              Frete e cupons aplicados no checkout.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/carrinho">Ver sacola completa</Link>
              </Button>
              <Button asChild size="lg" variant="outline" onClick={close} className="w-full">
                <Link href="/checkout">Finalizar compra</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const updateQty = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.removeLine);

  return (
    <div className="flex gap-4">
      <Link
        href={`/produto/${line.productSlug}`}
        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]"
      >
        {line.imageUrl && (
          <Image
            src={line.imageUrl}
            alt={line.productName}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
        {line.isPreOrder && (
          <span className="absolute top-1 left-1 text-[9px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] px-1.5 py-0.5 rounded-sm">
            Pré
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/produto/${line.productSlug}`}
          className="font-[var(--font-display)] text-[1.0625rem] leading-tight text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors line-clamp-2"
        >
          {line.productName}
        </Link>
        <p className="mt-0.5 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] truncate">
          {line.variantName}
        </p>
        {line.isPreOrder && line.releaseDate && (
          <p className="mt-1 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-gold)]">
            Lança em {formatDate(new Date(line.releaseDate))}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center border border-[color:var(--color-border)] rounded-[var(--radius-sm)]">
            <button
              type="button"
              onClick={() => updateQty(line.variantId, line.quantity - 1)}
              aria-label="Diminuir quantidade"
              className="h-8 w-8 inline-flex items-center justify-center text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] transition-colors"
            >
              <Minus className="h-3 w-3" strokeWidth={1.5} />
            </button>
            <span className="w-7 text-center font-[var(--font-mono)] text-[0.8125rem] tabular-nums">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQty(line.variantId, line.quantity + 1)}
              disabled={line.quantity >= line.stockAtAdd}
              aria-label="Aumentar quantidade"
              className={cn(
                "h-8 w-8 inline-flex items-center justify-center text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] transition-colors",
                "disabled:opacity-30 disabled:cursor-not-allowed",
              )}
            >
              <Plus className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </div>
          <span className="font-[var(--font-mono)] text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
            {formatBRL(line.unitPrice * line.quantity)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => remove(line.variantId)}
        aria-label={`Remover ${line.productName}`}
        className="h-8 w-8 shrink-0 inline-flex items-center justify-center text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-vermilion)] transition-colors -mt-1"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-7 py-12 text-center">
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[5rem] leading-none font-black text-[color:var(--color-gold)]/40 mb-6"
      >
        空
      </span>
      <h3 className="display text-[1.5rem] mb-2">Sua sacola está vazia</h3>
      <p className="max-w-xs text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
        Explore o catálogo e adicione peças aqui. Itens em pré-venda ficam reservados assim que você fechar a compra.
      </p>
      <Button asChild size="lg" onClick={onClose} className="mt-6">
        <Link href="/catalogo">
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          Ir ao catálogo
        </Link>
      </Button>
    </div>
  );
}
