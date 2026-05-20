import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Package } from "lucide-react";
import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

export const metadata = {
  title: "Meus pedidos",
};

const USE_DB = !!process.env.DATABASE_URL;

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago · Em preparação",
  PROCESSING: "Processando envio",
  AWAITING_RELEASE: "Aguardando lançamento",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Estornado",
};

const STATUS_TONE: Record<OrderStatus, "soft" | "gold" | "vermilion"> = {
  PENDING: "soft",
  PAID: "gold",
  PROCESSING: "gold",
  AWAITING_RELEASE: "gold",
  SHIPPED: "gold",
  DELIVERED: "gold",
  CANCELLED: "vermilion",
  REFUNDED: "vermilion",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;

  let orders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    hasPreOrderItems: boolean;
    total: number;
    createdAt: Date;
    trackingCode: string | null;
    meTrackingUrl: string | null;
    expectedShipDate: Date | null;
    items: Array<{
      id: string;
      productName: string;
      variantName: string;
      quantity: number;
      imageUrl: string | null;
    }>;
  }> = [];

  if (USE_DB) {
    const { prisma } = await import("@/lib/prisma");
    const dbOrders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 3,
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            productName: true,
            variantName: true,
            quantity: true,
            imageUrl: true,
          },
        },
      },
    });
    orders = dbOrders.map((o) => ({
      ...o,
      total: Number(o.total),
    }));
  }

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow index="—">Pedidos</Eyebrow>
        <h2 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">
          Histórico de compras
        </h2>
      </div>

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({
  order,
}: {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    hasPreOrderItems: boolean;
    total: number;
    createdAt: Date;
    trackingCode: string | null;
    meTrackingUrl: string | null;
    expectedShipDate: Date | null;
    items: Array<{
      id: string;
      productName: string;
      variantName: string;
      quantity: number;
      imageUrl: string | null;
    }>;
  };
}) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5 lg:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className="font-[var(--font-mono)] text-[0.875rem] text-[color:var(--color-fg)]">
            {order.orderNumber}
          </p>
          <p className="mt-1 eyebrow">
            {formatDate(order.createdAt)} · {formatBRL(order.total)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.hasPreOrderItems && (
            <Badge variant="gold" size="sm">
              Pré-venda
            </Badge>
          )}
          <Badge variant={STATUS_TONE[order.status]} size="md">
            {STATUS_LABEL[order.status]}
          </Badge>
        </div>
      </header>

      <ul className="flex items-center gap-2 mb-5 -mx-1">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]"
            title={item.productName}
          >
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.productName}
                fill
                sizes="56px"
                className="object-cover"
              />
            )}
            {item.quantity > 1 && (
              <span className="absolute bottom-0.5 right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-bg)]/90 backdrop-blur px-1 text-[9px] font-[var(--font-mono)] tabular-nums text-[color:var(--color-fg)]">
                ×{item.quantity}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Mensagem contextual por status */}
      <StatusContext order={order} />

      <div className="mt-5 pt-5 border-t border-[color:var(--color-hairline)] flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/conta/pedidos/${order.orderNumber}`}
          className="inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
        >
          Ver detalhes
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
        {order.meTrackingUrl && (
          <a
            href={order.meTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)] transition-colors"
          >
            Rastrear envio
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </article>
  );
}

function StatusContext({
  order,
}: {
  order: {
    status: OrderStatus;
    hasPreOrderItems: boolean;
    trackingCode: string | null;
    expectedShipDate: Date | null;
  };
}) {
  let message: string | null = null;
  if (order.status === "AWAITING_RELEASE" && order.expectedShipDate) {
    message = `Envio previsto a partir de ${formatDate(order.expectedShipDate)} (lançamento da pré-venda).`;
  } else if (order.status === "PAID") {
    message = "Pagamento confirmado. Você recebe email assim que postarmos.";
  } else if (order.status === "PROCESSING") {
    message = "Etiqueta gerada. Aguardando coleta/postagem.";
  } else if (order.status === "SHIPPED" && order.trackingCode) {
    message = `Postado · Rastreio ${order.trackingCode}`;
  } else if (order.status === "DELIVERED") {
    message = "Pedido entregue — esperamos que goste! Considere deixar uma review.";
  } else if (order.status === "CANCELLED") {
    message = "Pedido cancelado.";
  } else if (order.status === "REFUNDED") {
    message = "Pedido estornado.";
  } else if (order.status === "PENDING") {
    message = "Aguardando confirmação de pagamento.";
  }

  if (!message) return null;
  return (
    <p
      className={cn(
        "text-[var(--text-caption)] leading-snug",
        order.status === "CANCELLED" || order.status === "REFUNDED"
          ? "text-[color:var(--color-vermilion)]"
          : "text-[color:var(--color-fg-soft)]",
      )}
    >
      {message}
    </p>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 lg:p-14 text-center">
      <Package className="h-7 w-7 mx-auto text-[color:var(--color-gold)]/60" strokeWidth={1.5} />
      <h3 className="display text-[1.5rem] mt-4">Nenhum pedido ainda</h3>
      <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] max-w-md mx-auto leading-[var(--leading-relaxed)]">
        Quando você fechar a primeira compra, ela vai aparecer aqui com timeline de
        status, link de rastreio e NF-e pra download.
      </p>
      <Button asChild className="mt-6">
        <Link href="/catalogo">Explorar o catálogo</Link>
      </Button>
    </div>
  );
}
