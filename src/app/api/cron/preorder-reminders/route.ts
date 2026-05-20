import { NextResponse } from "next/server";
import { assertCronAuth } from "@/lib/cron-auth";
import { sendPreorderReminder } from "@/server/services/emails";

const USE_DB = !!process.env.DATABASE_URL;

/**
 * Cron diário — envia lembrete pra clientes com pedido AWAITING_RELEASE
 * cujo lançamento está próximo (7 dias, 3 dias, 1 dia).
 *
 * Vercel cron schedule: `0 12 * * *` (12h UTC = 9h Brasília)
 *
 * Idempotência: marca em `internalNotes` qual lembrete já foi enviado pra
 * cada pedido, pra não duplicar em runs consecutivos.
 */

const REMINDER_DAYS = [7, 3, 1];

export async function GET(req: Request) {
  const authError = assertCronAuth(req);
  if (authError) return authError;

  if (!USE_DB) {
    return NextResponse.json({ skipped: true, reason: "demo mode" });
  }

  const { prisma } = await import("@/lib/prisma");
  const now = new Date();

  let sent = 0;
  let skipped = 0;
  let errored = 0;

  for (const daysUntil of REMINDER_DAYS) {
    const target = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
    target.setHours(23, 59, 59, 999);
    const startOfTarget = new Date(target);
    startOfTarget.setHours(0, 0, 0, 0);

    // Pedidos AWAITING_RELEASE com items que lançam exatamente neste dia
    const orders = await prisma.order.findMany({
      where: {
        status: "AWAITING_RELEASE",
        items: {
          some: {
            isPreOrder: true,
            releaseDate: { gte: startOfTarget, lte: target },
          },
        },
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          where: {
            isPreOrder: true,
            releaseDate: { gte: startOfTarget, lte: target },
          },
          include: {
            productVariant: {
              select: { product: { select: { slug: true } } },
            },
          },
        },
      },
    });

    for (const order of orders) {
      const recipientEmail = order.user?.email ?? order.guestEmail;
      if (!recipientEmail) {
        skipped++;
        continue;
      }

      // Dedup — internalNotes guarda quais já foram enviados
      const sentKey = `preorder-reminder-${daysUntil}d-${order.items[0]?.productVariantId}`;
      const internalNotes = order.internalNotes ?? "";
      if (internalNotes.includes(sentKey)) {
        skipped++;
        continue;
      }

      for (const item of order.items) {
        if (!item.releaseDate) continue;
        try {
          await sendPreorderReminder({
            email: recipientEmail,
            name: order.user?.name ?? "Cliente",
            productName: item.productName,
            productSlug: item.productVariant.product.slug,
            releaseDate: item.releaseDate,
            daysUntil,
          });
          sent++;
        } catch (err) {
          console.error("[cron preorder-reminder] failed:", err);
          errored++;
        }
      }

      // Marca como enviado
      await prisma.order.update({
        where: { id: order.id },
        data: {
          internalNotes: internalNotes
            ? `${internalNotes}\n${sentKey} @ ${now.toISOString()}`
            : `${sentKey} @ ${now.toISOString()}`,
        },
      });
    }
  }

  return NextResponse.json({ sent, skipped, errored });
}
