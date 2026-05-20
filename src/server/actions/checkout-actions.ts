"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { stripe, stripeConfigured } from "@/lib/stripe";
import type { ActionResult } from "@/server/actions/auth-actions";

/** Tipo extraído da assinatura da função — robusto a mudanças de namespacing do Stripe SDK */
type StripeCreateParams = NonNullable<
  Parameters<typeof stripe.checkout.sessions.create>[0]
>;
type StripeLineItem = NonNullable<StripeCreateParams["line_items"]>[number];

const USE_DB = !!process.env.DATABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// =====================================================================
// SCHEMAS
// =====================================================================

const checkoutInputSchema = z.object({
  /** ID do endereço de entrega (existente, do usuário) */
  addressId: z.string().min(1, "Endereço obrigatório"),
  /** Frete escolhido */
  shipping: z.object({
    serviceId: z.number().int(),
    serviceName: z.string(),
    carrier: z.string(),
    price: z.number().nonnegative(),
    deliveryDays: z.number().int().nonnegative(),
  }),
  /** Items do carrinho — re-validados contra DB */
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Carrinho vazio"),
  /** Cupom opcional */
  couponCode: z.string().optional(),
  /** Notas do cliente */
  customerNotes: z.string().max(1000).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

// =====================================================================
// CRIAR SESSÃO DE CHECKOUT (Stripe Checkout hosted)
// =====================================================================

export async function createCheckoutSession(
  input: CheckoutInput,
): Promise<ActionResult<{ url: string; orderId: string }>> {
  if (!stripeConfigured) {
    return {
      ok: false,
      error: "Stripe não configurado. Configure STRIPE_SECRET_KEY.",
    };
  }
  if (!USE_DB) {
    return {
      ok: false,
      error: "Checkout exige Supabase configurado (modo demo não persiste).",
    };
  }

  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: "Faça login antes de finalizar a compra." };
  }

  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { prisma } = await import("@/lib/prisma");

  // ---- 1. Validar endereço ----
  const address = await prisma.address.findUnique({
    where: { id: parsed.data.addressId, userId: session.user.id },
  });
  if (!address) {
    return { ok: false, error: "Endereço não encontrado." };
  }

  // ---- 2. Buscar variantes + produtos atualizados (anti-tampering) ----
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: parsed.data.items.map((i) => i.variantId) },
      isActive: true,
    },
    include: {
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          basePrice: true,
          isPreOrder: true,
          releaseDate: true,
          status: true,
          weight: true,
          dimensions: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  });

  if (variants.length !== parsed.data.items.length) {
    return {
      ok: false,
      error: "Alguns itens do seu carrinho não estão mais disponíveis.",
    };
  }

  // Mapa pra montagem do pedido
  const itemMap = new Map(parsed.data.items.map((i) => [i.variantId, i.quantity]));
  const orderItems: Array<{
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    sku: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    isPreOrder: boolean;
    releaseDate: Date | null;
    attributesSnapshot: Record<string, unknown>;
  }> = [];

  let subtotal = 0;
  let hasPreOrderItems = false;
  let latestPreOrderDate: Date | null = null;

  for (const variant of variants) {
    const qty = itemMap.get(variant.id)!;
    if (variant.stock < qty) {
      return {
        ok: false,
        error: `Estoque insuficiente pra "${variant.product.name}".`,
      };
    }
    if (variant.product.status !== "ACTIVE") {
      return {
        ok: false,
        error: `O item "${variant.product.name}" não está mais ativo.`,
      };
    }

    const unitPrice = Number(variant.priceOverride ?? variant.product.basePrice);
    const totalPrice = unitPrice * qty;
    subtotal += totalPrice;

    if (variant.product.isPreOrder) {
      hasPreOrderItems = true;
      if (
        variant.product.releaseDate &&
        (!latestPreOrderDate || variant.product.releaseDate > latestPreOrderDate)
      ) {
        latestPreOrderDate = variant.product.releaseDate;
      }
    }

    orderItems.push({
      variantId: variant.id,
      productId: variant.product.id,
      productName: variant.product.name,
      variantName: variant.name,
      sku: variant.sku,
      imageUrl: variant.imageUrl ?? variant.product.images[0]?.url ?? null,
      unitPrice,
      quantity: qty,
      totalPrice,
      isPreOrder: variant.product.isPreOrder,
      releaseDate: variant.product.releaseDate,
      attributesSnapshot: {
        tcgLanguage: variant.tcgLanguage,
        tcgCondition: variant.tcgCondition,
        tcgEdition: variant.tcgEdition,
        tcgRarity: variant.tcgRarity,
        tcgIsFoil: variant.tcgIsFoil,
        tcgCardNumber: variant.tcgCardNumber,
        figureHasBox: variant.figureHasBox,
        figureBoxCondition: variant.figureBoxCondition,
        figureScale: variant.figureScale,
        figureManufacturer: variant.figureManufacturer,
      },
    });
  }

  const shippingCost = parsed.data.shipping.price;
  const total = subtotal + shippingCost;

  // ---- 3. Pré-criar Order em PENDING ----
  const orderNumber = generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.user.id,
      status: "PENDING",
      hasPreOrderItems,
      expectedShipDate: latestPreOrderDate,
      subtotal,
      shippingCost,
      discountAmount: 0,
      taxAmount: 0,
      total,
      shippingService: parsed.data.shipping.serviceName,
      shippingServiceId: parsed.data.shipping.serviceId,
      shippingCarrier: parsed.data.shipping.carrier,
      shippingRecipientName: address.recipientName,
      shippingZipCode: address.zipCode,
      shippingStreet: address.street,
      shippingNumber: address.number,
      shippingComplement: address.complement,
      shippingNeighborhood: address.neighborhood,
      shippingCity: address.city,
      shippingState: address.state,
      shippingCountry: address.country,
      customerNotes: parsed.data.customerNotes ?? null,
      items: {
        create: orderItems.map((i) => ({
          productVariantId: i.variantId,
          productName: i.productName,
          variantName: i.variantName,
          sku: i.sku,
          imageUrl: i.imageUrl,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
          isPreOrder: i.isPreOrder,
          releaseDate: i.releaseDate,
          attributesSnapshot: i.attributesSnapshot as never,
        })),
      },
      statusHistory: {
        create: { toStatus: "PENDING", notes: "Pedido criado, aguardando pagamento." },
      },
    },
  });

  // ---- 4. Criar Stripe Checkout Session ----
  const lineItems: StripeLineItem[] = orderItems.map(
    (i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "brl",
        unit_amount: Math.round(i.unitPrice * 100),
        product_data: {
          name: i.productName,
          description: i.variantName,
          images: i.imageUrl ? [i.imageUrl] : undefined,
          metadata: { variantId: i.variantId, sku: i.sku },
        },
      },
    }),
  );

  // Frete como line item separado (Stripe permite, é mais claro no extrato)
  if (shippingCost > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "brl",
        unit_amount: Math.round(shippingCost * 100),
        product_data: {
          name: `Frete · ${parsed.data.shipping.serviceName}`,
          description: `${parsed.data.shipping.carrier} · ${parsed.data.shipping.deliveryDays} dia(s) úteis`,
        },
      },
    });
  }

  try {
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "boleto"], // PIX requer config adicional no Stripe BR
      line_items: lineItems,
      customer_email: session.user.email ?? undefined,
      locale: "pt-BR",
      success_url: `${APP_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/carrinho?canceled=1`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
        hasPreOrder: hasPreOrderItems ? "true" : "false",
      },
      // Expira em 30 minutos — Order PENDING pode ser limpo depois disso
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    if (!stripeSession.url) {
      throw new Error("Stripe não retornou URL de checkout.");
    }

    // Pré-cria Payment record já com session id
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "STRIPE",
        providerSessionId: stripeSession.id,
        method: "CREDIT_CARD", // será atualizado pelo webhook conforme método escolhido
        status: "PENDING",
        amount: total,
      },
    });

    return {
      ok: true,
      data: { url: stripeSession.url, orderId: order.id },
    };
  } catch (err) {
    // Se Stripe falhou, marca pedido como CANCELLED
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    console.error("[checkout] stripe error:", err);
    return {
      ok: false,
      error: "Erro ao iniciar pagamento no Stripe. Tente novamente.",
    };
  }
}

// =====================================================================
// HELPERS
// =====================================================================

/** KZN-AAAAMMDD-XXXXX — 5 dígitos aleatórios */
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `KZN-${date}-${rand}`;
}
