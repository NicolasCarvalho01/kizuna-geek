import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe, stripeConfigured } from "@/lib/stripe";

/**
 * Webhook Stripe — entrega eventos críticos de pagamento.
 *
 * Eventos tratados:
 *   - checkout.session.completed → marca Order como PAID (ou AWAITING_RELEASE se tem pré-venda),
 *     atualiza Payment, baixa estoque das variantes
 *   - charge.refunded → marca Order como REFUNDED, repõe estoque
 *   - payment_intent.payment_failed → marca Payment como FAILED
 *
 * Idempotência: usa `event.id` no log e checa status atual do Order antes de mutar.
 *
 * Pra desenvolvimento local:
 *   - Instale stripe CLI: https://stripe.com/docs/stripe-cli
 *   - Rode: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 *   - Copie o `whsec_...` impresso e cole em STRIPE_WEBHOOK_SECRET no .env.local
 */

const USE_DB = !!process.env.DATABASE_URL;

export async function POST(req: Request) {
  if (!stripeConfigured) {
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET não configurado." },
      { status: 503 },
    );
  }

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "stripe-signature header ausente" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] Signature inválida:", err);
    return NextResponse.json({ error: "signature inválida" }, { status: 400 });
  }

  console.log(`[stripe-webhook] ${event.type} · ${event.id}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        // Ignorar silenciosamente eventos não tratados (Stripe envia muitos)
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[stripe-webhook] Erro processando ${event.type}:`, err);
    // Retornar 500 faz o Stripe retry — bom pra erros transitórios
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// =====================================================================
// HANDLERS
// =====================================================================

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.warn("[stripe-webhook] session sem orderId em metadata");
    return;
  }

  if (!USE_DB) {
    console.warn("[stripe-webhook] sem DATABASE_URL — pulando persistência");
    return;
  }

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { productVariantId: true, quantity: true } } },
  });

  if (!order) {
    console.error(`[stripe-webhook] Order ${orderId} não encontrado`);
    return;
  }

  // Idempotência — já processado, ignorar
  if (order.status === "PAID" || order.status === "AWAITING_RELEASE") {
    console.log(`[stripe-webhook] Order ${orderId} já processado, skip.`);
    return;
  }

  const newStatus = order.hasPreOrderItems ? "AWAITING_RELEASE" : "PAID";

  // Detectar método de pagamento
  const paymentMethod = inferPaymentMethod(session);

  // Atualizar Order + Payment + baixa estoque numa transação
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: newStatus,
            notes: order.hasPreOrderItems
              ? "Pagamento aprovado. Aguardando lançamento dos itens em pré-venda."
              : "Pagamento aprovado. Pedido em preparação.",
          },
        },
      },
    });

    await tx.payment.updateMany({
      where: { orderId, providerSessionId: session.id },
      data: {
        status: "PAID",
        method: paymentMethod,
        providerPaymentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id,
        paidAt: new Date(),
        metadata: session as never,
      },
    });

    // Baixa estoque (apenas pra itens não-pré-venda — pré-venda mantém pra controle)
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Limpar carrinho do usuário, se houver
    if (order.userId) {
      const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }
  });

  console.log(`[stripe-webhook] Order ${orderId} marcado como ${newStatus}.`);

  // Dispara email de pagamento aprovado (fire-and-forget — não bloqueia o webhook)
  try {
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });
    if (fullOrder) {
      const recipientEmail =
        fullOrder.user?.email ?? fullOrder.guestEmail ?? null;
      const recipientName = fullOrder.user?.name ?? "Cliente";

      if (recipientEmail) {
        const { sendPaymentApproved } = await import("@/server/services/emails");
        await sendPaymentApproved({
          email: recipientEmail,
          name: recipientName,
          orderNumber: fullOrder.orderNumber,
          totalCents: Math.round(Number(fullOrder.total) * 100),
          items: fullOrder.items.map((i) => ({
            productName: i.productName,
            variantName: i.variantName,
            quantity: i.quantity,
            totalPriceCents: Math.round(Number(i.totalPrice) * 100),
          })),
          hasPreOrder: fullOrder.hasPreOrderItems,
          expectedShipDate: fullOrder.expectedShipDate,
          shippingAddress: {
            recipientName: fullOrder.shippingRecipientName,
            street: fullOrder.shippingStreet,
            number: fullOrder.shippingNumber,
            complement: fullOrder.shippingComplement,
            neighborhood: fullOrder.shippingNeighborhood,
            city: fullOrder.shippingCity,
            state: fullOrder.shippingState,
            zipCode: fullOrder.shippingZipCode,
          },
          paymentMethod: paymentMethodLabel(paymentMethod),
          invoiceUrl: null, // só temos URL após emissão NF-e (markAsPosted)
        });
      }
    }
  } catch (emailErr) {
    console.error("[stripe-webhook] email failed (non-blocking):", emailErr);
  }
}

function paymentMethodLabel(m: "CREDIT_CARD" | "PIX" | "BOLETO"): string {
  switch (m) {
    case "CREDIT_CARD":
      return "cartão de crédito";
    case "PIX":
      return "PIX";
    case "BOLETO":
      return "boleto";
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!USE_DB) return;
  const paymentIntent = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent?.id;
  if (!paymentIntent) return;

  const { prisma } = await import("@/lib/prisma");
  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId: paymentIntent },
    include: {
      order: { include: { items: { select: { productVariantId: true, quantity: true } } } },
    },
  });

  if (!payment) {
    console.warn(`[stripe-webhook] Refund sem Payment local: ${paymentIntent}`);
    return;
  }

  const refundedAmount = (charge.amount_refunded ?? 0) / 100;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        refundedAmount,
        refundedAt: new Date(),
        status: refundedAmount >= Number(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED",
      },
    });

    if (refundedAmount >= Number(payment.amount)) {
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: "REFUNDED",
          statusHistory: {
            create: {
              fromStatus: payment.order.status,
              toStatus: "REFUNDED",
              notes: "Estorno total via Stripe.",
            },
          },
        },
      });

      // Repõe estoque
      for (const item of payment.order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  console.log(`[stripe-webhook] Refund processado: ${payment.id}`);
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent) {
  if (!USE_DB) return;
  const { prisma } = await import("@/lib/prisma");
  await prisma.payment.updateMany({
    where: { providerPaymentId: intent.id },
    data: {
      status: "FAILED",
      failedAt: new Date(),
      failureReason: intent.last_payment_error?.message ?? "Pagamento recusado.",
    },
  });
  console.log(`[stripe-webhook] payment_intent failed: ${intent.id}`);
}

function inferPaymentMethod(
  session: Stripe.Checkout.Session,
): "CREDIT_CARD" | "PIX" | "BOLETO" {
  const types = session.payment_method_types ?? [];
  if (types.includes("boleto")) return "BOLETO";
  // Stripe BR PIX is a separate method ("pix" in payment_method_types — quando habilitado)
  if (types.some((t) => t.toLowerCase().includes("pix"))) return "PIX";
  return "CREDIT_CARD";
}
