import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, FileText, MapPin, Package, Printer, User } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageBack } from "@/components/shared/page-back";
import { OrderTimeline } from "@/components/account/order-timeline";
import { AdminOrderActions } from "@/components/admin/admin-order-actions";
import { AdminNfeActions } from "@/components/admin/admin-nfe-actions";
import { formatBRL, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

const USE_DB = !!process.env.DATABASE_URL;

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Em preparação",
  AWAITING_RELEASE: "Aguardando lançamento",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Estornado",
};

const STATUS_TONE: Record<OrderStatus, "soft" | "gold" | "vermilion" | "goldSolid"> = {
  PENDING: "soft",
  PAID: "gold",
  PROCESSING: "gold",
  AWAITING_RELEASE: "gold",
  SHIPPED: "goldSolid",
  DELIVERED: "goldSolid",
  CANCELLED: "vermilion",
  REFUNDED: "vermilion",
};

export async function generateMetadata({ params }: PageProps) {
  const { orderNumber } = await params;
  return { title: `Pedido ${orderNumber} · Admin` };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;
  if (!USE_DB) return null;

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      payment: true,
      invoice: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true, email: true, phone: true, cpf: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-8">
      <header>
        <PageBack fallback="/admin/pedidos" label="Voltar pra pedidos" className="mb-5" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Eyebrow index="—">Pedido</Eyebrow>
            <h1 className="display mt-3 text-[clamp(1.875rem,3.5vw,2.5rem)] font-[var(--font-mono)] not-italic tracking-normal">
              {order.orderNumber}
            </h1>
            <p className="mt-2 eyebrow">
              {formatDate(order.createdAt)} · {formatBRL(Number(order.total))}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={STATUS_TONE[order.status]} size="lg">
              {STATUS_LABEL[order.status]}
            </Badge>
            {order.hasPreOrderItems && (
              <Badge variant="gold" size="sm">
                Contém pré-venda
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Admin actions bar */}
      <AdminOrderActions
        orderId={order.id}
        orderNumber={order.orderNumber}
        currentStatus={order.status}
        meOrderId={order.meOrderId}
        meLabelUrl={order.meLabelUrl}
        hasPreOrder={order.hasPreOrderItems}
      />

      {/* NF-e actions */}
      <AdminNfeActions
        orderId={order.id}
        canEmit={
          order.status === "SHIPPED" ||
          order.status === "DELIVERED" ||
          order.status === "PROCESSING"
        }
        invoice={
          order.invoice
            ? {
                id: order.invoice.id,
                status: order.invoice.status,
                nfeNumber: order.invoice.nfeNumber,
                pdfUrl: order.invoice.pdfUrl,
                xmlUrl: order.invoice.xmlUrl,
                issuedAt: order.invoice.issuedAt,
                rejectionReason: order.invoice.rejectionReason,
              }
            : null
        }
      />

      {/* Recibo de venda (não-fiscal) — pra MEI ou complemento à NF-e */}
      {order.status !== "PENDING" && order.status !== "CANCELLED" && (
        <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <FileText
                className="h-4 w-4 mt-1 text-[color:var(--color-gold)] shrink-0"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-[var(--font-display)] text-[1.0625rem] leading-snug">
                  Recibo de venda
                </p>
                <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                  Documento não-fiscal — útil pra imprimir junto com a etiqueta
                  ou enviar pro cliente que pedir.
                </p>
              </div>
            </div>
            <a
              href={`/api/recibo/${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)] text-[0.875rem] text-[color:var(--color-fg)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
              Abrir / Imprimir
            </a>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section>
        <h3 className="eyebrow mb-5">Andamento</h3>
        <OrderTimeline
          status={order.status}
          hasPreOrder={order.hasPreOrderItems}
          history={order.statusHistory.map((h) => ({
            toStatus: h.toStatus,
            createdAt: h.createdAt.toISOString(),
            notes: h.notes,
          }))}
          expectedShipDate={order.expectedShipDate?.toISOString() ?? null}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cliente */}
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:col-span-1">
          <p className="eyebrow mb-3">
            <User className="inline h-3 w-3 mr-1.5 -mt-px" strokeWidth={1.5} />
            Cliente
          </p>
          <p className="font-[var(--font-display)] text-[1.0625rem]">
            {order.user?.name ?? "Guest"}
          </p>
          <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] break-all">
            {order.user?.email ?? order.guestEmail ?? "—"}
          </p>
          {order.user?.phone && (
            <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              {order.user.phone}
            </p>
          )}
          {order.user?.cpf && (
            <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-mute)] font-[var(--font-mono)]">
              CPF: {order.user.cpf}
            </p>
          )}
        </div>

        {/* Endereço */}
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:col-span-1">
          <p className="eyebrow mb-3">
            <MapPin className="inline h-3 w-3 mr-1.5 -mt-px" strokeWidth={1.5} />
            Entrega
          </p>
          <p className="font-[var(--font-display)] text-[1rem] leading-snug">
            {order.shippingRecipientName}
          </p>
          <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-relaxed">
            {order.shippingStreet}, {order.shippingNumber}
            {order.shippingComplement && ` · ${order.shippingComplement}`}
            <br />
            {order.shippingNeighborhood} · {order.shippingCity}/{order.shippingState}
            <br />
            CEP {order.shippingZipCode.slice(0, 5)}-{order.shippingZipCode.slice(5)}
          </p>
        </div>

        {/* Envio + Pagamento */}
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:col-span-1 space-y-4">
          <div>
            <p className="eyebrow mb-2">Envio</p>
            <p className="text-[0.9375rem]">
              {order.shippingService} · {order.shippingCarrier}
            </p>
            {order.trackingCode && (
              <p className="mt-1 font-[var(--font-mono)] text-[0.75rem] text-[color:var(--color-gold)]">
                {order.trackingCode}
              </p>
            )}
          </div>
          {order.payment && (
            <div>
              <p className="eyebrow mb-2">Pagamento</p>
              <p className="text-[0.9375rem]">
                {paymentMethodLabel(order.payment.method)}
              </p>
              <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                Status: <strong className="font-medium">{order.payment.status}</strong>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Items */}
      <section>
        <h3 className="eyebrow mb-4">
          <Package className="inline h-3 w-3 mr-1.5 -mt-px" strokeWidth={1.5} />
          {order.items.length} {order.items.length === 1 ? "item" : "itens"}
        </h3>
        <ul className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] overflow-hidden divide-y divide-[color:var(--color-hairline)]">
          {order.items.map((item) => (
            <li key={item.id} className="p-4 flex gap-4">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
                  {item.productName}
                </p>
                <p className="eyebrow">{item.variantName}</p>
                <p className="text-[var(--text-caption)] text-[color:var(--color-fg-mute)] mt-1">
                  SKU {item.sku} · {item.quantity}× · {formatBRL(Number(item.unitPrice))}
                </p>
              </div>
              <p className="font-[var(--font-mono)] text-[0.9375rem] font-medium shrink-0">
                {formatBRL(Number(item.totalPrice))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Internal notes (admin only) */}
      {order.internalNotes && (
        <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/5 p-4">
          <p className="eyebrow mb-2 text-[color:var(--color-vermilion)]">
            Notas internas
          </p>
          <p className="text-[var(--text-caption)] text-[color:var(--color-fg)] whitespace-pre-line">
            {order.internalNotes}
          </p>
        </section>
      )}

      {/* Totals */}
      <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5">
        <p className="eyebrow mb-4">Resumo financeiro</p>
        <dl className="space-y-2 text-[0.9375rem]">
          <Row label="Subtotal" value={formatBRL(Number(order.subtotal))} />
          <Row label={`Frete · ${order.shippingService}`} value={formatBRL(Number(order.shippingCost))} />
          {Number(order.discountAmount) > 0 && (
            <Row
              label="Desconto"
              value={`- ${formatBRL(Number(order.discountAmount))}`}
              accent
            />
          )}
        </dl>
        <Separator className="my-4" />
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Total</span>
          <span className="font-[var(--font-display)] text-[1.5rem] leading-none">
            {formatBRL(Number(order.total))}
          </span>
        </div>
      </section>

      {/* Link pra ver como cliente */}
      <div className="pt-2">
        <Link
          href={`/conta/pedidos/${order.orderNumber}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-gold)] transition-colors"
        >
          Ver como o cliente vê
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}

function paymentMethodLabel(m: string): string {
  switch (m) {
    case "CREDIT_CARD":
      return "Cartão de crédito";
    case "PIX":
      return "PIX";
    case "BOLETO":
      return "Boleto";
    default:
      return m;
  }
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[color:var(--color-fg-soft)]">{label}</dt>
      <dd
        className={cn(
          "font-[var(--font-mono)] tabular-nums",
          accent ? "text-[color:var(--color-gold)]" : "text-[color:var(--color-fg)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
