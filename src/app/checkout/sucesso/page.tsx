import Link from "next/link";
import { ArrowUpRight, Check, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { formatBRL, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Pedido confirmado",
};

const USE_DB = !!process.env.DATABASE_URL;

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  if (!stripeConfigured) {
    return <FallbackSuccess />;
  }

  // Buscar a session no Stripe pra confirmar
  let stripeSession;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    redirect("/");
  }

  const orderId = stripeSession.metadata?.orderId;
  if (!orderId || !USE_DB) {
    return <FallbackSuccess sessionId={session_id} />;
  }

  const { prisma } = await import("@/lib/prisma");
  let order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
  });

  if (!order) return <FallbackSuccess sessionId={session_id} />;

  // RECONCILIAÇÃO — se Stripe diz que pagou mas nosso webhook ainda não atualizou,
  // promovemos pedido pra PAID/AWAITING_RELEASE aqui mesmo (síncrono).
  // Cobre 2 cenários: (1) race condition entre redirect e webhook async,
  // (2) webhook caiu/Stripe CLI desligado em dev.
  if (
    order.status === "PENDING" &&
    stripeSession.payment_status === "paid"
  ) {
    const newStatus = order.hasPreOrderItems ? "AWAITING_RELEASE" : "PAID";
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order!.id },
        data: {
          status: newStatus,
          statusHistory: {
            create: {
              fromStatus: "PENDING",
              toStatus: newStatus,
              notes: "Pagamento aprovado · reconciliado via /checkout/sucesso.",
            },
          },
        },
      });
      await tx.payment.updateMany({
        where: { orderId: order!.id, providerSessionId: session_id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          providerPaymentId:
            typeof stripeSession.payment_intent === "string"
              ? stripeSession.payment_intent
              : stripeSession.payment_intent?.id,
        },
      });
      // Baixa estoque das variantes
      for (const item of order!.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });
    // Re-fetch pra UI mostrar o estado atualizado
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { orderBy: { createdAt: "asc" } },
        payment: true,
      },
    });
    if (!order) return <FallbackSuccess sessionId={session_id} />;
  }

  const isPaid = order.status === "PAID" || order.status === "AWAITING_RELEASE";

  return (
    <div className="wrap pt-16 lg:pt-24 pb-24 lg:pb-32 max-w-3xl">
      {isPaid && <ClearCartOnSuccess orderId={order.id} />}
      {/* Cabeçalho de confirmação */}
      <div className="text-center mb-12 lg:mb-16">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-gold)]/15 mb-6">
          <Check className="h-7 w-7 text-[color:var(--color-gold)]" strokeWidth={1.5} />
        </div>
        <Eyebrow index="—">{isPaid ? "Pedido confirmado" : "Pedido recebido"}</Eyebrow>
        <h1 className="display mt-4 text-[clamp(2.25rem,5vw,3.75rem)]">
          {!isPaid ? (
            <>
              Processando seu{" "}
              <em className="display-italic text-[color:var(--color-gold)]">
                pagamento
              </em>
              .
            </>
          ) : order.hasPreOrderItems ? (
            <>
              Reservamos sua{" "}
              <em className="display-italic text-[color:var(--color-gold)]">
                pré-venda
              </em>
              .
            </>
          ) : (
            <>
              Compra{" "}
              <em className="display-italic text-[color:var(--color-gold)]">
                confirmada
              </em>
              .
            </>
          )}
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-[var(--text-body)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
          {isPaid
            ? order.hasPreOrderItems
              ? "Seu pagamento foi aprovado. Os itens em pré-venda serão enviados após a data de lançamento — você receberá email com código de rastreio quando postarmos."
              : "Pagamento aprovado, agora vamos preparar seu pedido. Você recebe email com o código de rastreio assim que postarmos."
            : "Estamos processando seu pagamento. Você vai receber email assim que for confirmado."}
        </p>
      </div>

      {/* Card do pedido */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 lg:p-8 mb-8">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="eyebrow">Pedido</p>
            <p className="mt-1 font-[var(--font-mono)] text-[1.125rem] text-[color:var(--color-fg)]">
              {order.orderNumber}
            </p>
          </div>
          <Badge
            variant={order.hasPreOrderItems ? "gold" : "soft"}
            size="lg"
          >
            {order.status === "AWAITING_RELEASE"
              ? "Aguardando lançamento"
              : order.status === "PAID"
                ? "Pago · Em preparação"
                : "Aguardando pagamento"}
          </Badge>
        </div>

        <ul className="divide-y divide-[color:var(--color-hairline)] mb-6">
          {order.items.map((item) => (
            <li key={item.id} className="py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-display)] text-[1.0625rem] leading-snug">
                  {item.productName}
                </p>
                <p className="eyebrow">
                  {item.variantName} · {item.quantity}x
                  {item.isPreOrder && item.releaseDate && (
                    <span className="text-[color:var(--color-gold)] ml-2">
                      Lança {formatDate(item.releaseDate)}
                    </span>
                  )}
                </p>
              </div>
              <span className="font-[var(--font-mono)] text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
                {formatBRL(Number(item.totalPrice))}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 text-[0.9375rem]">
          <div className="flex justify-between text-[color:var(--color-fg-soft)]">
            <span>Subtotal</span>
            <span className="font-[var(--font-mono)]">
              {formatBRL(Number(order.subtotal))}
            </span>
          </div>
          <div className="flex justify-between text-[color:var(--color-fg-soft)]">
            <span>
              Frete · {order.shippingService} ({order.shippingCarrier})
            </span>
            <span className="font-[var(--font-mono)]">
              {formatBRL(Number(order.shippingCost))}
            </span>
          </div>
          <div className="flex justify-between items-baseline pt-3 mt-3 border-t border-[color:var(--color-hairline)]">
            <span className="eyebrow">Total</span>
            <span className="font-[var(--font-display)] text-[1.5rem] leading-none text-[color:var(--color-fg)]">
              {formatBRL(Number(order.total))}
            </span>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-6 lg:p-8 mb-8">
        <p className="eyebrow mb-3">Entregar para</p>
        <p className="font-[var(--font-display)] text-[1.125rem] leading-snug mb-1">
          {order.shippingRecipientName}
        </p>
        <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
          {order.shippingStreet}, {order.shippingNumber}
          {order.shippingComplement && ` · ${order.shippingComplement}`}
          <br />
          {order.shippingNeighborhood} · {order.shippingCity}/{order.shippingState}
          <br />
          CEP {order.shippingZipCode.slice(0, 5)}-{order.shippingZipCode.slice(5)}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="flex-1">
          <Link href="/conta/pedidos">
            Ver meus pedidos
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href="/catalogo">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            Continuar comprando
          </Link>
        </Button>
      </div>

      <p className="mt-8 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] text-center">
        Email de confirmação enviado · NF-e disponível no momento do envio
      </p>
    </div>
  );
}

function FallbackSuccess({ sessionId }: { sessionId?: string } = {}) {
  return (
    <div className="wrap pt-16 lg:pt-24 pb-24 lg:pb-32 max-w-2xl text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-gold)]/15 mb-6">
        <Check className="h-7 w-7 text-[color:var(--color-gold)]" strokeWidth={1.5} />
      </div>
      <Eyebrow index="—">Pedido recebido</Eyebrow>
      <h1 className="display mt-4 text-[clamp(2.25rem,5vw,3.75rem)]">
        Tudo certo.
      </h1>
      <p className="mt-5 text-[var(--text-body)] text-[color:var(--color-fg-soft)]">
        Estamos processando seu pagamento. Confira o status em{" "}
        <Link href="/conta/pedidos" className="text-[color:var(--color-gold)] underline">
          Meus pedidos
        </Link>{" "}
        em instantes.
      </p>
      {sessionId && (
        <p className="mt-3 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
          Referência: {sessionId.slice(0, 20)}…
        </p>
      )}
      <Button asChild className="mt-8">
        <Link href="/catalogo">Continuar comprando</Link>
      </Button>
    </div>
  );
}
