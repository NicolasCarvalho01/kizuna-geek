import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron-auth";
import { sendPreorderReleased } from "@/server/services/emails";

const USE_DB = !!process.env.DATABASE_URL;

/**
 * Cron diário — quando a `releaseDate` chega, manda email "chegou" e dispara
 * preparação dos pedidos.
 *
 * NÃO muda status do Order automaticamente — o admin precisa confirmar manualmente
 * que o estoque físico chegou antes de comprar etiqueta (regra do projeto).
 */

export async function GET(req: Request) {
  const authError = assertCronAuth(req);
  if (authError) return authError;

  if (!USE_DB) {
    return NextResponse.json({ skipped: true, reason: "demo mode" });
  }

  const { prisma } = await import("@/lib/prisma");

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Pedidos AWAITING_RELEASE com items que lançam HOJE
  const orders = await prisma.order.findMany({
    where: {
      status: "AWAITING_RELEASE",
      items: {
        some: {
          isPreOrder: true,
          releaseDate: { gte: startOfToday, lte: endOfToday },
        },
      },
    },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        where: {
          isPreOrder: true,
          releaseDate: { gte: startOfToday, lte: endOfToday },
        },
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

    const sentKey = "preorder-released";
    const internalNotes = order.internalNotes ?? "";
    if (internalNotes.includes(sentKey)) {
      skipped++;
      continue;
    }

    for (const item of order.items) {
      try {
        await sendPreorderReleased({
          email: recipientEmail,
          name: order.user?.name ?? "Cliente",
          productName: item.productName,
          orderNumber: order.orderNumber,
        });
        sent++;
      } catch (err) {
        console.error("[cron preorder-released] failed:", err);
        errored++;
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        internalNotes: internalNotes
          ? `${internalNotes}\n${sentKey} @ ${now.toISOString()}`
          : `${sentKey} @ ${now.toISOString()}`,
      },
    });
  }

  return NextResponse.json({ sent, skipped, errored });
}
