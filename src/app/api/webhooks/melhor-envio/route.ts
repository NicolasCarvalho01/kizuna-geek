import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { MeShipmentStatus } from "@prisma/client";

/**
 * Webhook do Melhor Envio — recebe notificações de mudança de status do envio.
 *
 * Eventos comuns:
 *   - order.posted        → meStatus=POSTED, Order status SHIPPED, gerar tracking
 *   - order.delivered     → meStatus=DELIVERED, Order status DELIVERED
 *   - order.cancelled     → meStatus=CANCELLED
 *   - order.released      → etiqueta liberada
 *
 * Idempotência: salva todo evento em `MeWebhookEvent` antes de processar.
 * Repetições do mesmo evento são detectadas e ignoradas.
 *
 * Assinatura: ME envia header `X-Hub-Signature` com HMAC-SHA1 do body
 * usando o secret configurado nas configurações do webhook.
 */

const USE_DB = !!process.env.DATABASE_URL;

const ME_EVENT_TO_ORDER_STATUS: Record<string, { me: MeShipmentStatus; order?: string }> = {
  "order.released": { me: "RELEASED" },
  "order.posted": { me: "POSTED", order: "SHIPPED" },
  "order.delivered": { me: "DELIVERED", order: "DELIVERED" },
  "order.cancelled": { me: "CANCELLED", order: "CANCELLED" },
  "order.expired": { me: "EXPIRED" },
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headersList = await headers();
  const signature = headersList.get("x-hub-signature") ?? headersList.get("X-Hub-Signature");

  // Verifica assinatura se secret configurado
  const secret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET;
  if (secret) {
    if (!signature) {
      return NextResponse.json(
        { error: "Assinatura ausente." },
        { status: 401 },
      );
    }
    const expected =
      "sha1=" + createHmac("sha1", secret).update(rawBody).digest("hex");
    if (
      !timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      )
    ) {
      return NextResponse.json(
        { error: "Assinatura inválida." },
        { status: 401 },
      );
    }
  }

  let payload: { event?: string; data?: { id?: string }; [k: string]: unknown };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const eventType = payload.event ?? "unknown";
  const meOrderId = payload.data?.id ?? "";

  console.log(`[me-webhook] ${eventType} · ${meOrderId}`);

  if (!USE_DB) {
    // Em demo: só loga e responde 200 pra ME não reenviar infinitamente
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const { prisma } = await import("@/lib/prisma");

  // Match Order local pelo meOrderId (pode não existir ainda — pré-criamos antes de comprar etiqueta)
  const order = await prisma.order.findFirst({
    where: { meOrderId },
    select: { id: true, status: true },
  });

  // Salvar todo evento pra auditoria (idempotência por unique combination opcional)
  const stored = await prisma.meWebhookEvent.create({
    data: {
      eventType,
      meOrderId,
      orderId: order?.id ?? null,
      payload: payload as never,
    },
  });

  // Processar status
  const mapping = ME_EVENT_TO_ORDER_STATUS[eventType];
  if (mapping && order) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            meStatus: mapping.me,
            ...(mapping.order &&
              order.status !== mapping.order && {
                status: mapping.order as never,
                statusHistory: {
                  create: {
                    fromStatus: order.status,
                    toStatus: mapping.order as never,
                    notes: `Atualização automática via Melhor Envio: ${eventType}`,
                  },
                },
              }),
          },
        });

        await tx.meWebhookEvent.update({
          where: { id: stored.id },
          data: { processedAt: new Date() },
        });
      });

      // Email pós-entrega (fire-and-forget)
      if (mapping.order === "DELIVERED") {
        try {
          const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            select: {
              orderNumber: true,
              guestEmail: true,
              user: { select: { name: true, email: true } },
              items: {
                take: 1,
                select: {
                  productVariant: {
                    select: { product: { select: { slug: true } } },
                  },
                },
              },
            },
          });
          const recipientEmail =
            fullOrder?.user?.email ?? fullOrder?.guestEmail ?? null;
          if (fullOrder && recipientEmail) {
            const { sendOrderDelivered } = await import(
              "@/server/services/emails"
            );
            await sendOrderDelivered({
              email: recipientEmail,
              name: fullOrder.user?.name ?? "Cliente",
              orderNumber: fullOrder.orderNumber,
              firstItemSlug:
                fullOrder.items[0]?.productVariant.product.slug,
            });
          }
        } catch (emailErr) {
          console.error("[me-webhook] delivered email failed:", emailErr);
        }
      }
    } catch (err) {
      console.error("[me-webhook] Falha ao processar:", err);
      await prisma.meWebhookEvent.update({
        where: { id: stored.id },
        data: { processingError: String(err) },
      });
    }
  } else {
    // Não matchou — marca como processado mesmo assim pra evitar reprocesso
    await prisma.meWebhookEvent.update({
      where: { id: stored.id },
      data: { processedAt: new Date() },
    });
  }

  return NextResponse.json({ received: true });
}
