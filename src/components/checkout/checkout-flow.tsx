"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  Truck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useCart,
  cartSubtotal,
  cartHasPreOrder,
} from "@/stores/cart-store";
import {
  quoteShipping,
  type ShippingOption,
} from "@/server/actions/shipping-actions";
import { createCheckoutSession } from "@/server/actions/checkout-actions";
import { cn, formatBRL, formatDate } from "@/lib/utils";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface CheckoutFlowProps {
  addresses: Address[];
  demoMode: boolean;
}

export function CheckoutFlow({ addresses, demoMode }: CheckoutFlowProps) {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(cartSubtotal);
  const hasPreOrder = useCart(cartHasPreOrder);

  const [hydrated, setHydrated] = React.useState(false);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null,
  );
  const [shippingOptions, setShippingOptions] = React.useState<ShippingOption[]>([]);
  const [quotePending, startQuote] = React.useTransition();
  const [quoteError, setQuoteError] = React.useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] =
    React.useState<ShippingOption | null>(null);
  const [submitting, startSubmit] = React.useTransition();
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => setHydrated(true), []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const total = subtotal + (selectedShipping?.price ?? 0);

  // Quando muda endereço ou items do carrinho, recotar
  React.useEffect(() => {
    if (!hydrated) return;
    if (!selectedAddress) return;
    if (lines.length === 0) return;

    setSelectedShipping(null);
    setShippingOptions([]);
    setQuoteError(null);

    startQuote(async () => {
      // Construir items pra cotação a partir do carrinho — buscamos peso/dimensões
      // do servidor via uma API quick OR usamos defaults sensatos.
      // No nosso caso, o cart-store não tem peso/dimensões — vamos chamar API leve.
      const res = await fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationZip: selectedAddress.zipCode,
          variantIds: lines.map((l) => ({
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setQuoteError(
          body?.error ?? "Erro ao cotar frete. Verifique o endereço.",
        );
        return;
      }

      const data = (await res.json()) as {
        options: ShippingOption[];
      };
      setShippingOptions(data.options);
      // Auto-selecionar a mais barata válida
      const firstValid = data.options.find((o) => !o.error);
      if (firstValid) setSelectedShipping(firstValid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddressId, lines.map((l) => `${l.variantId}:${l.quantity}`).join("|"), hydrated]);

  function handleFinalize() {
    if (!selectedAddress || !selectedShipping || lines.length === 0) return;
    setSubmitError(null);

    startSubmit(async () => {
      const res = await createCheckoutSession({
        addressId: selectedAddress.id,
        shipping: {
          serviceId: selectedShipping.serviceId,
          serviceName: selectedShipping.serviceName,
          carrier: selectedShipping.carrier,
          price: selectedShipping.price,
          deliveryDays: selectedShipping.deliveryDays,
        },
        items: lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
        })),
      });

      if (res.ok && res.data) {
        // Redireciona pro Stripe Checkout
        window.location.href = res.data.url;
      } else {
        setSubmitError(res.error ?? "Erro ao iniciar pagamento.");
      }
    });
  }

  // ===== Estados especiais =====

  if (!hydrated) {
    return <CheckoutSkeleton />;
  }

  if (lines.length === 0) {
    return <EmptyCart />;
  }

  if (addresses.length === 0) {
    return <NoAddress />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-10 lg:gap-14">
      <div className="space-y-10">
        {/* Step 1 — Endereço */}
        <Step number="01" icon={MapPin} title="Endereço de entrega">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((addr) => (
              <li key={addr.id}>
                <button
                  type="button"
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-[var(--radius-md)] border",
                    "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                    selectedAddressId === addr.id
                      ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/8"
                      : "border-[color:var(--color-border)] hover:border-[color:var(--color-fg-soft)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="eyebrow">{addr.label}</p>
                    {addr.isDefault && (
                      <Badge variant="gold" size="sm">
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <p className="font-[var(--font-display)] text-[1rem] leading-tight mb-1">
                    {addr.recipientName}
                  </p>
                  <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-snug">
                    {addr.street}, {addr.number}
                    {addr.complement && ` · ${addr.complement}`}
                    <br />
                    {addr.neighborhood} · {addr.city}/{addr.state} ·{" "}
                    {formatCep(addr.zipCode)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/conta/enderecos"
            className="mt-3 inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)] transition-colors"
          >
            <Plus className="h-3 w-3" strokeWidth={1.5} />
            Adicionar novo endereço
          </Link>
        </Step>

        {/* Step 2 — Frete */}
        <Step number="02" icon={Truck} title="Frete">
          {!selectedAddress ? (
            <p className="text-[var(--text-caption)] text-[color:var(--color-fg-mute)]">
              Selecione um endereço acima.
            </p>
          ) : quotePending ? (
            <div className="flex items-center gap-3 text-[color:var(--color-fg-soft)]">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              Cotando frete para {formatCep(selectedAddress.zipCode)}…
            </div>
          ) : quoteError ? (
            <p
              role="alert"
              className="text-[var(--text-caption)] text-[color:var(--color-vermilion)] leading-snug"
            >
              {quoteError}
            </p>
          ) : shippingOptions.length === 0 ? (
            <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              Nenhuma transportadora disponível pra esse endereço.
            </p>
          ) : (
            <ul className="space-y-2">
              {shippingOptions.map((opt) => {
                const isActive = selectedShipping?.serviceId === opt.serviceId &&
                  selectedShipping?.carrier === opt.carrier;
                const isDisabled = !!opt.error;
                return (
                  <li key={`${opt.serviceId}-${opt.carrier}`}>
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedShipping(opt)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-[var(--radius-md)] border text-left",
                        "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                        isActive
                          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/8"
                          : "border-[color:var(--color-border)] hover:border-[color:var(--color-fg-soft)]",
                        isDisabled && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full border shrink-0",
                          isActive
                            ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]"
                            : "border-[color:var(--color-border-strong)]",
                        )}
                      >
                        {isActive && (
                          <Check
                            className="h-3 w-3 text-[color:var(--color-gold-ink)]"
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
                          {opt.serviceName}
                        </p>
                        <p className="eyebrow">
                          {opt.carrier}
                          {!opt.error &&
                            ` · ${opt.deliveryRange.min}–${opt.deliveryRange.max} dia(s) úteis`}
                          {opt.error && ` · ${opt.error}`}
                        </p>
                      </div>
                      <span className="font-[var(--font-mono)] text-[0.9375rem] font-medium text-[color:var(--color-fg)] shrink-0">
                        {opt.error ? "—" : formatBRL(opt.price)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Step>

        {/* Step 3 — Pagamento */}
        <Step number="03" icon={Lock} title="Pagamento">
          <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)] max-w-prose">
            Você vai ser redirecionado pro <strong>Stripe Checkout</strong>, ambiente
            seguro e certificado PCI. Aceitamos cartão de crédito (parcelável) e
            boleto. O pedido é confirmado automaticamente assim que o pagamento for
            aprovado.
          </p>
          {hasPreOrder && (
            <div className="mt-4 rounded-[var(--radius-md)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-4 flex gap-3">
              <span
                aria-hidden
                className="font-[var(--font-jp)] text-[1.5rem] leading-none font-black text-[color:var(--color-gold)] shrink-0"
              >
                予約
              </span>
              <p className="text-[0.875rem] text-[color:var(--color-fg)] leading-snug">
                <strong className="font-medium text-[color:var(--color-gold)]">
                  Atenção — pré-venda na sacola.
                </strong>{" "}
                Cobramos agora, mas o envio acontece apenas após a data de
                lançamento de cada item em pré-venda. A NF-e é emitida no momento
                do envio efetivo.
              </p>
            </div>
          )}
        </Step>
      </div>

      {/* Sidebar — Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 lg:p-7">
          <h2 className="eyebrow mb-5">Resumo do pedido</h2>
          <Separator className="mb-5" />

          <ul className="space-y-4 mb-5">
            {lines.map((line) => (
              <li key={line.variantId} className="flex gap-3">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]">
                  {line.imageUrl && (
                    <Image
                      src={line.imageUrl}
                      alt={line.productName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-caption)] font-medium text-[color:var(--color-fg)] truncate">
                    {line.productName}
                  </p>
                  <p className="text-[10px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-fg-mute)] truncate">
                    {line.variantName} · {line.quantity}x
                  </p>
                  {line.isPreOrder && line.releaseDate && (
                    <p className="text-[10px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-gold)]">
                      Lança {formatDate(new Date(line.releaseDate))}
                    </p>
                  )}
                </div>
                <span className="font-[var(--font-mono)] text-[0.8125rem] font-medium text-[color:var(--color-fg)]">
                  {formatBRL(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="mb-4" />

          <dl className="space-y-2 mb-4 text-[0.875rem]">
            <Row label="Subtotal" value={formatBRL(subtotal)} />
            <Row
              label="Frete"
              value={
                selectedShipping
                  ? formatBRL(selectedShipping.price)
                  : "A calcular"
              }
              mute={!selectedShipping}
            />
          </dl>

          <Separator className="mb-4" />

          <div className="flex items-baseline justify-between mb-5">
            <span className="eyebrow">Total</span>
            <span className="font-[var(--font-display)] text-[1.875rem] leading-none text-[color:var(--color-fg)]">
              {formatBRL(total)}
            </span>
          </div>

          {demoMode ? (
            <DemoNotice />
          ) : (
            <>
              {submitError && (
                <p
                  role="alert"
                  className="mb-3 rounded-[var(--radius-sm)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 px-3 py-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)] leading-snug"
                >
                  {submitError}
                </p>
              )}
              <Button
                size="lg"
                onClick={handleFinalize}
                disabled={!selectedShipping || submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    Redirecionando…
                  </>
                ) : (
                  <>
                    Pagar com Stripe
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </>
                )}
              </Button>
            </>
          )}

          <p className="mt-4 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] text-center">
            🔒 Pagamento seguro · Stripe PCI
          </p>
        </div>
      </aside>
    </div>
  );
}

// =====================================================================
// SUB-COMPONENTES
// =====================================================================

function Step({
  number,
  icon: Icon,
  title,
  children,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span className="font-[var(--font-display)] italic text-[1.875rem] leading-none text-[color:var(--color-gold)] tabular-nums">
          {number}
        </span>
        <span aria-hidden className="h-px w-6 bg-[color:var(--color-gold)]/40" />
        <Icon className="h-4 w-4 text-[color:var(--color-gold)]" strokeWidth={1.5} />
        <h2 className="font-[var(--font-display)] text-[1.5rem] leading-none text-[color:var(--color-fg)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  mute,
}: {
  label: string;
  value: string;
  mute?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[color:var(--color-fg-soft)]">{label}</dt>
      <dd
        className={cn(
          "font-[var(--font-mono)] tabular-nums",
          mute
            ? "text-[color:var(--color-fg-mute)]"
            : "text-[color:var(--color-fg)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function formatCep(cep: string): string {
  const d = cep.replace(/\D/g, "");
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep;
}

function EmptyCart() {
  return (
    <div className="py-20 text-center">
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[5rem] leading-none font-black text-[color:var(--color-gold)]/40"
      >
        空
      </span>
      <h2 className="display text-[1.875rem] mt-6">Sacola vazia</h2>
      <p className="mt-3 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
        Não tem como finalizar uma compra sem itens.
      </p>
      <Button asChild className="mt-6">
        <Link href="/catalogo">Voltar pro catálogo</Link>
      </Button>
    </div>
  );
}

function NoAddress() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
      <MapPin className="h-7 w-7 mx-auto text-[color:var(--color-gold)]/60" strokeWidth={1.5} />
      <h2 className="display text-[1.5rem] mt-4">Sem endereço cadastrado</h2>
      <p className="mt-2 max-w-md mx-auto text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
        Adicione um endereço de entrega antes de finalizar a compra.
      </p>
      <Button asChild className="mt-5">
        <Link href="/conta/enderecos">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Adicionar endereço
        </Link>
      </Button>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-10">
      <div className="space-y-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="h-6 w-1/3 bg-[color:var(--color-bg-sunken)] rounded" />
            <div className="h-24 bg-[color:var(--color-bg-sunken)] rounded-[var(--radius-md)]" />
          </div>
        ))}
      </div>
      <div className="h-96 rounded-[var(--radius-lg)] bg-[color:var(--color-bg-sunken)] animate-pulse" />
    </div>
  );
}

function DemoNotice() {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-4 text-[var(--text-caption)] text-[color:var(--color-fg)] leading-[var(--leading-relaxed)]">
      <strong className="text-[color:var(--color-gold)]">Modo demo:</strong>{" "}
      configure o Supabase + Stripe pra finalizar compras de verdade.
    </div>
  );
}

// Suppress unused warning for ChevronRight if not used elsewhere
void ChevronRight;
