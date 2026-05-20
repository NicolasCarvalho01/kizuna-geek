import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron-auth";
import { sendAbandonedCart } from "@/server/services/emails";

const USE_DB = !!process.env.DATABASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kizunageek.com.br";

/**
 * Cron diário — pedidos em PENDING há mais de 24h e menos de 48h recebem
 * email de "deixou peças na sacola".
 *
 * Janela controlada: 24h-48h pra não mandar imediatamente (cliente pode estar
 * pensando) nem em pedido muito antigo (pode ter desistido de vez).
 */

export async function GET(req: Request) {
  const authError = assertCronAuth(req);
  if (authError) return authError;

  if (!USE_DB) {
    return NextResponse.json({ skipped: true, reason: "demo mode" });
  }

  const { prisma } = await import("@/lib/prisma");

  const now = new Date();
  const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { gte: cutoff48h, lte: cutoff24h },
    },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        take: 3,
        select: { productName: true },
      },
    },
  });

  let sent = 0;
  let skipped = 0;
  let errored = 0;

  for (const order of orders) {
    const recipientEmail = order.user?.email ?? order.guestEmail;
    if (!recipientEmail) {
      skipped++;
      continue;
    }

    // Dedup
    const sentKey = "abandoned-cart-reminder";
    if ((order.internalNotes ?? "").includes(sentKey)) {
      skipped++;
      continue;
    }

    const itemPreview =
      order.items.length === 0
        ? "seus itens"
        : order.items.length === 1
          ? order.items[0]!.productName
          : `${order.items[0]!.productName} + ${order.items.length - 1} outros`;

    try {
      await sendAbandonedCart({
        email: recipientEmail,
        name: order.user?.name ?? "Cliente",
        itemPreview,
        resumeUrl: `${APP_URL}/carrinho`,
      });
      sent++;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          internalNotes:
            (order.internalNotes ?? "") +
            `\n${sentKey} @ ${now.toISOString()}`,
        },
      });
    } catch (err) {
      console.error("[cron abandoned-cart] failed:", err);
      errored++;
    }
  }

  return NextResponse.json({ sent, skipped, errored });
}
