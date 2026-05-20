"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  addShipmentToCart,
  checkoutShipments,
  generateLabels,
  printLabels,
  MeApiError,
  type AddToCartInput,
} from "@/lib/melhor-envio";
import type { ActionResult } from "@/server/actions/auth-actions";
import type { OrderStatus } from "@prisma/client";

const USE_DB = !!process.env.DATABASE_URL;

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Não autenticado." };
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return { ok: false as const, error: "Acesso negado." };
  }
  return { ok: true as const, userId: session.user.id };
}

// =====================================================================
// COMPRAR ETIQUETA (3 etapas: cart → checkout → generate)
// =====================================================================

export async function buyShippingLabel(
  orderId: string,
): Promise<ActionResult<{ meOrderId: string; labelUrl?: string }>> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { name: true, email: true, phone: true, cpf: true } },
    },
  });

  if (!order) return { ok: false, error: "Pedido não encontrado." };
  if (order.meOrderId) {
    return { ok: false, error: "Etiqueta já comprada pra este pedido." };
  }
  if (order.status !== "PAID" && order.status !== "PROCESSING") {
    return {
      ok: false,
      error: `Pedido em status ${order.status} — só compra etiqueta após pagamento.`,
    };
  }

  const originZip = process.env.MELHOR_ENVIO_ORIGIN_ZIPCODE ?? "18200000";

  // Calcula dimensões totais — soma de todos os items (simplificado)
  // Em produção real, considerar empacotamento mais sofisticado
  const itemsAggregate = await prisma.productVariant.findMany({
    where: { id: { in: order.items.map((i) => i.productVariantId) } },
    select: {
      id: true,
      product: { select: { weight: true, dimensions: true } },
    },
  });
  const dimsById = new Map(
    itemsAggregate.map((v) => [
      v.id,
      {
        weight: v.product.weight,
        dimensions: v.product.dimensions as {
          length?: number;
          width?: number;
          height?: number;
        } | null,
      },
    ]),
  );

  const volumes = order.items.flatMap((item) => {
    const phys = dimsById.get(item.productVariantId);
    const dims = phys?.dimensions ?? { length: 15, width: 15, height: 10 };
    const weight = (phys?.weight ?? 300) / 1000; // ME espera kg
    return Array.from({ length: item.quantity }, () => ({
      height: Number(dims.height ?? 10),
      width: Number(dims.width ?? 15),
      length: Number(dims.length ?? 15),
      weight,
    }));
  });

  const totalValue = Number(order.subtotal);

  const cartInput: AddToCartInput = {
    service: order.shippingServiceId,
    from: {
      name: "Kizuna Geek",
      phone: process.env.MELHOR_ENVIO_FROM_PHONE ?? "1530000000",
      email: process.env.EMAIL_FROM?.replace(/.*<(.*)>/, "$1") ?? "contato@kizunageek.com.br",
      document: process.env.MELHOR_ENVIO_FROM_DOCUMENT ?? "00000000000",
      postal_code: originZip,
      address: process.env.MELHOR_ENVIO_FROM_ADDRESS ?? "Rua principal",
      number: process.env.MELHOR_ENVIO_FROM_NUMBER ?? "100",
      district: process.env.MELHOR_ENVIO_FROM_DISTRICT ?? "Centro",
      city: process.env.MELHOR_ENVIO_FROM_CITY ?? "Itapetininga",
      state_abbr: process.env.MELHOR_ENVIO_FROM_STATE ?? "SP",
      country_id: "BR",
    },
    to: {
      name: order.shippingRecipientName,
      email: order.user?.email ?? order.guestEmail ?? undefined,
      phone: order.user?.phone ?? undefined,
      document: order.user?.cpf ?? undefined,
      postal_code: order.shippingZipCode,
      address: order.shippingStreet,
      number: order.shippingNumber,
      complement: order.shippingComplement ?? undefined,
      district: order.shippingNeighborhood,
      city: order.shippingCity,
      state_abbr: order.shippingState,
      country_id: order.shippingCountry,
    },
    products: order.items.map((i) => ({
      name: i.productName,
      quantity: String(i.quantity),
      unitary_value: String(Number(i.unitPrice)),
    })),
    volumes,
    options: {
      insurance_value: totalValue,
      receipt: false,
      own_hand: false,
    },
  };

  try {
    // Etapa 1 — adiciona ao carrinho ME
    const shipment = await addShipmentToCart(cartInput);

    // Etapa 2 — finaliza compra (debita saldo)
    await checkoutShipments([shipment.id]);

    // Etapa 3 — gera etiqueta (PDF)
    const labels = await generateLabels([shipment.id]);
    const labelUrl = labels[shipment.id]?.url;

    // Persistir no Order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        meShipmentId: shipment.id,
        meOrderId: shipment.id,
        meStatus: "RELEASED",
        meLabelUrl: labelUrl ?? null,
        status: "PROCESSING",
        statusHistory: {
          create: {
            fromStatus: order.status,
            toStatus: "PROCESSING",
            notes: "Etiqueta do Melhor Envio comprada.",
          },
        },
      },
    });

    revalidatePath(`/admin/pedidos/${order.orderNumber}`);
    revalidatePath("/admin/pedidos");
    revalidatePath(`/conta/pedidos/${order.orderNumber}`);

    return { ok: true, data: { meOrderId: shipment.id, labelUrl } };
  } catch (err) {
    if (err instanceof MeApiError) {
      console.error("[admin] ME buy failed:", err.status, err.body);
      return {
        ok: false,
        error:
          err.status === 401
            ? "Token Melhor Envio expirado. Renove com `npm run me:auth`."
            : `Erro ME (${err.status}). Verifique saldo e dados de remetente.`,
      };
    }
    console.error("[admin] buy label unexpected:", err);
    return { ok: false, error: "Erro inesperado ao comprar etiqueta." };
  }
}

// =====================================================================
// IMPRIMIR (gera URL nova)
// =====================================================================

export async function getPrintLabelUrl(
  orderId: string,
): Promise<ActionResult<{ url: string }>> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { meOrderId: true, meLabelUrl: true },
  });

  if (!order?.meOrderId) {
    return { ok: false, error: "Etiqueta ainda não foi comprada." };
  }

  // Se já temos URL guardada e é recente, devolve direto
  if (order.meLabelUrl) {
    return { ok: true, data: { url: order.meLabelUrl } };
  }

  try {
    const res = await printLabels([order.meOrderId]);
    return { ok: true, data: { url: res.url } };
  } catch (err) {
    if (err instanceof MeApiError) {
      return { ok: false, error: `Erro ME (${err.status}).` };
    }
    return { ok: false, error: "Erro ao gerar URL de impressão." };
  }
}

// =====================================================================
// MARCAR COMO POSTADO
// =====================================================================

export async function markAsPosted(
  orderId: string,
  trackingCode?: string,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, meOrderId: true, hasPreOrderItems: true },
  });

  if (!order) return { ok: false, error: "Pedido não encontrado." };
  if (order.status === "SHIPPED" || order.status === "DELIVERED") {
    return { ok: false, error: "Pedido já marcado como enviado." };
  }
  if (order.hasPreOrderItems) {
    return {
      ok: false,
      error: "Pedido em pré-venda — confirme que TODOS os itens já saíram em estoque antes de postar.",
    };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "SHIPPED",
      meStatus: "POSTED",
      trackingCode: trackingCode ?? undefined,
      meTrackingUrl: order.meOrderId
        ? `https://melhorrastreio.com.br/rastreio/${order.meOrderId}`
        : undefined,
      statusHistory: {
        create: {
          fromStatus: order.status,
          toStatus: "SHIPPED",
          notes: trackingCode
            ? `Postado · rastreio ${trackingCode}`
            : "Marcado como postado.",
        },
      },
    },
  });

  // Emite NF-e — regra de pré-venda: SÓ aqui, não no pagamento.
  // Fire-and-forget: erro de emissão não bloqueia o despacho.
  try {
    const { emitInvoiceForOrder } = await import("@/server/services/nfe");
    await emitInvoiceForOrder(orderId);
  } catch (err) {
    console.error("[admin] NF-e emission failed (non-blocking):", err);
  }

  // Email "saiu pra entrega"
  try {
    const fullOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        guestEmail: true,
        shippingCarrier: true,
        shippingService: true,
        meTrackingUrl: true,
        trackingCode: true,
        estimatedDeliveryDate: true,
        user: { select: { name: true, email: true } },
      },
    });

    const recipientEmail =
      fullOrder?.user?.email ?? fullOrder?.guestEmail ?? null;
    if (fullOrder && recipientEmail) {
      const { sendOrderShipped } = await import("@/server/services/emails");
      await sendOrderShipped({
        email: recipientEmail,
        name: fullOrder.user?.name ?? "Cliente",
        orderNumber: fullOrder.orderNumber,
        carrier: `${fullOrder.shippingCarrier} (${fullOrder.shippingService})`,
        trackingCode: fullOrder.trackingCode,
        trackingUrl: fullOrder.meTrackingUrl,
        estimatedDays: fullOrder.estimatedDeliveryDate
          ? fullOrder.estimatedDeliveryDate.toISOString().slice(0, 10)
          : null,
      });
    }
  } catch (err) {
    console.error("[admin] shipped email failed (non-blocking):", err);
  }

  revalidatePath(`/admin/pedidos`);
  revalidatePath(`/conta/pedidos`);
  return { ok: true };
}

// =====================================================================
// MUDAR STATUS GENÉRICO
// =====================================================================

export async function changeOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!order) return { ok: false, error: "Pedido não encontrado." };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      statusHistory: {
        create: {
          fromStatus: order.status,
          toStatus: newStatus,
          notes: notes ?? `Status alterado manualmente para ${newStatus}.`,
        },
      },
    },
  });

  revalidatePath("/admin/pedidos");
  return { ok: true };
}
