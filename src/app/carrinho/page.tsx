"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart, cartSubtotal, cartHasPreOrder, type CartLine } from "@/stores/cart-store";
import { cn, formatBRL, formatDate } from "@/lib/utils";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(cartSubtotal);
  const hasPreOrder = useCart(cartHasPreOrder);
  const clear = useCart((s) => s.clear);

  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const totalItems = lines.reduce((acc, l) => acc + l.quantity, 0);

  return (
    <>
      <section className="wrap pt-16 lg:pt-24 pb-10">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow index="—">Sua sacola</Eyebrow>
            <h1 className="display mt-5 text-[clamp(2.5rem,6vw,5rem)]">
              {!hydrated || totalItems === 0 ? (
                <>
                  Sacola{" "}
                  <em className="display-italic text-[color:var(--color-gold)]">vazia</em>
                </>
              ) : (
                <>
                  <em className="display-italic text-[color:var(--color-gold)]">{totalItems}</em>{" "}
                  {totalItems === 1 ? "peça reservada" : "peças reservadas"}
                </>
              )}
            </h1>
          </div>
        </div>
      </section>

      <section className="wrap pb-24 lg:pb-32">
        {!hydrated ? (
          <CartSkeleton />
        ) : lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-10 lg:gap-12">
            <div>
              {hasPreOrder && <PreOrderNotice />}

              <ul className="divide-y divide-[color:var(--color-hairline)] border-t border-[color:var(--color-hairline)]">
                {lines.map((line) => (
                  <li key={line.variantId} className="py-7">
                    <CartLineFull line={line} />
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-vermilion)] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Esvaziar sacola
                </button>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 text-[var(--text-body)] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
                >
                  Continuar comprando
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            <OrderSummary subtotal={subtotal} hasPreOrder={hasPreOrder} />
          </div>
        )}
      </section>
    </>
  );
}

function CartLineFull({ line }: { line: CartLine }) {
  const updateQty = useCart((s) => s.updateQuantity);
  const remove = useCart((s) => s.removeLine);

  return (
    <div className="grid grid-cols-[7rem_1fr_auto] gap-5 lg:grid-cols-[8rem_1fr_8rem_auto]">
      <Link
        href={`/produto/${line.productSlug}`}
        className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-bg-sunken)]"
      >
        {line.imageUrl && (
          <Image
            src={line.imageUrl}
            alt={line.productName}
            fill
            sizes="128px"
            className="object-cover"
          />
        )}
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {line.isPreOrder && (
            <Badge variant="gold" size="sm">
              Pré-venda
            </Badge>
          )}
        </div>
        <Link
          href={`/produto/${line.productSlug}`}
          className="font-[var(--font-display)] text-[1.25rem] lg:text-[1.375rem] leading-tight text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
        >
          {line.productName}
        </Link>
        <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
          {line.variantName}
        </p>
        {line.isPreOrder && line.releaseDate && (
          <p className="mt-2 eyebrow">
            Lança em {formatDate(new Date(line.releaseDate))}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3 lg:hidden">
          <QtyStepper
            value={line.quantity}
            onChange={(v) => updateQty(line.variantId, v)}
            max={line.stockAtAdd}
          />
          <span className="font-[var(--font-mono)] text-[1rem] font-medium text-[color:var(--color-fg)]">
            {formatBRL(line.unitPrice * line.quantity)}
          </span>
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center">
        <QtyStepper
          value={line.quantity}
          onChange={(v) => updateQty(line.variantId, v)}
          max={line.stockAtAdd}
        />
      </div>

      <div className="flex flex-col items-end justify-between text-right">
        <button
          type="button"
          onClick={() => remove(line.variantId)}
          aria-label={`Remover ${line.productName}`}
          className="text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-vermilion)] transition-colors"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span className="hidden lg:block font-[var(--font-mono)] text-[1.0625rem] font-medium text-[color:var(--color-fg)]">
          {formatBRL(line.unitPrice * line.quantity)}
        </span>
      </div>
    </div>
  );
}

function QtyStepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  return (
    <div className="inline-flex items-center border border-[color:var(--color-border)] rounded-[var(--radius-sm)]">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Diminuir"
        className="h-9 w-9 inline-flex items-center justify-center text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] transition-colors"
      >
        <Minus className="h-3 w-3" strokeWidth={1.5} />
      </button>
      <span className="w-8 text-center font-[var(--font-mono)] text-[0.875rem] tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar"
        className={cn(
          "h-9 w-9 inline-flex items-center justify-center text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] transition-colors",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        )}
      >
        <Plus className="h-3 w-3" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function OrderSummary({ subtotal, hasPreOrder }: { subtotal: number; hasPreOrder: boolean }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 lg:p-7">
        <h2 className="eyebrow mb-5">Resumo</h2>
        <Separator className="mb-5" />

        <dl className="space-y-3 text-[0.9375rem]">
          <Row label="Subtotal" value={formatBRL(subtotal)} />
          <Row
            label="Frete"
            value="Calculado no checkout"
            mute
          />
          <Row label="Descontos" value="—" mute />
        </dl>

        <Separator className="my-5" />

        <div className="flex items-baseline justify-between mb-5">
          <span className="eyebrow">Total</span>
          <span className="font-[var(--font-display)] text-[1.875rem] leading-none text-[color:var(--color-fg)]">
            {formatBRL(subtotal)}
          </span>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">Finalizar compra</Link>
        </Button>

        <p className="mt-4 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
          Pagamento via Stripe (cartão, PIX ou boleto). Envio via Melhor Envio.
        </p>

        {hasPreOrder && (
          <p className="mt-3 eyebrow">
            Contém itens em pré-venda
          </p>
        )}
      </div>
    </aside>
  );
}

function Row({ label, value, mute }: { label: string; value: string; mute?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[color:var(--color-fg-soft)]">{label}</dt>
      <dd
        className={cn(
          "font-[var(--font-mono)] tabular-nums",
          mute ? "text-[color:var(--color-fg-mute)]" : "text-[color:var(--color-fg)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function PreOrderNotice() {
  return (
    <div className="mb-7 rounded-[var(--radius-md)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-4 lg:p-5 flex gap-4">
      <span aria-hidden className="font-[var(--font-jp)] text-[1.875rem] leading-none font-black text-[color:var(--color-gold)]">
        予約
      </span>
      <div className="text-[0.9375rem] leading-[var(--leading-relaxed)]">
        <strong className="font-medium text-[color:var(--color-gold)]">
          Você tem itens em pré-venda na sacola.
        </strong>{" "}
        O pagamento é feito agora, mas o envio ocorre apenas após o lançamento de cada item.
        A NF-e é emitida no momento do envio efetivo.
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="py-16 text-center">
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[7rem] leading-none font-black text-[color:var(--color-gold)]/40"
      >
        空
      </span>
      <h2 className="display text-[2.25rem] mt-6">Sem peças por aqui</h2>
      <p className="mt-3 max-w-md mx-auto text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
        Comece pelo catálogo — os destaques e pré-vendas estão lá.
      </p>
      <Button asChild size="lg" className="mt-7">
        <Link href="/catalogo">
          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          Ir ao catálogo
        </Link>
      </Button>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-10">
      <div className="space-y-7">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-5 py-7 border-b border-[color:var(--color-hairline)]">
            <div className="aspect-[4/5] w-32 rounded-[var(--radius-md)] bg-[color:var(--color-bg-sunken)] animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 bg-[color:var(--color-bg-sunken)] rounded animate-pulse" />
              <div className="h-6 w-2/3 bg-[color:var(--color-bg-sunken)] rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-[color:var(--color-bg-sunken)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 rounded-[var(--radius-lg)] bg-[color:var(--color-bg-sunken)] animate-pulse" />
    </div>
  );
}
