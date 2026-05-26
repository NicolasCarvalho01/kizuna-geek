import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Download,
  FileText,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageBack } from "@/components/shared/page-back";
import { OrderTimeline } from "@/components/account/order-timeline";
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
  return { title: `Pedido ${orderNumber}` };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/entrar?from=/conta/pedidos/${orderNumber}`);

  if (!USE_DB) {
    return <NoDbMessage />;
  }

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findFirst({
    where: { orderNumber, userId: session.user.id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      payment: true,
      invoice: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-10">
      <header>
        <PageBack fallback="/conta/pedidos" label="Voltar pra pedidos" className="mb-6" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow index="—">Pedido</Eyebrow>
            <h2 className="display mt-3 text-[clamp(1.875rem,3.5vw,2.75rem)] font-[var(--font-mono)] not-italic tracking-normal">
              {order.orderNumber}
            </h2>
            <p className="mt-2 eyebrow">
              Feito em {formatDate(order.createdAt)} · {formatBRL(Number(order.total))}
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

      {/* TIMELINE */}
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

      {/* TRACKING (Melhor Envio) */}
      {order.meTrackingUrl && (
        <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-5 lg:p-6">
          <div className="flex items-start gap-4">
            <Truck className="h-5 w-5 text-[color:var(--color-gold)] mt-0.5" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="eyebrow text-[color:var(--color-gold)]">Rastreio em tempo real</p>
              <p className="mt-1 font-[var(--font-display)] text-[1.125rem] leading-snug">
                {order.shippingCarrier} · {order.shippingService}
              </p>
              {order.trackingCode && (
                <CopyableCode code={order.trackingCode} />
              )}
              {order.estimatedDeliveryDate && (
                <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                  Previsão de entrega: {formatDate(order.estimatedDeliveryDate)}
                </p>
              )}
            </div>
            <Button asChild size="md" variant="outline">
              <a
                href={order.meTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                Ver detalhes
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </Button>
          </div>
        </section>
      )}

      {/* ITEMS */}
      <section>
        <h3 className="eyebrow mb-5">
          <Package className="inline h-3 w-3 mr-1.5 -mt-px" strokeWidth={1.5} />
          {order.items.length} {order.items.length === 1 ? "item" : "itens"}
        </h3>
        <ul className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] divide-y divide-[color:var(--color-hairline)] overflow-hidden">
          {order.items.map((item) => (
            <li key={item.id} className="p-4 lg:p-5 flex gap-4">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-display)] text-[1.0625rem] leading-snug">
                  {item.productName}
                </p>
                <p className="mt-1 eyebrow">{item.variantName}</p>
                <p className="mt-1.5 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                  SKU {item.sku} · {item.quantity}× · {formatBRL(Number(item.unitPrice))}
                </p>
                {item.isPreOrder && item.releaseDate && (
                  <p className="mt-1 text-[10px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-gold)]">
                    Pré-venda · lança {formatDate(item.releaseDate)}
                  </p>
                )}
              </div>
              <p className="font-[var(--font-mono)] text-[0.9375rem] font-medium text-[color:var(--color-fg)] shrink-0">
                {formatBRL(Number(item.totalPrice))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SHIPPING ADDRESS */}
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:p-6">
          <p className="eyebrow mb-3">
            <MapPin className="inline h-3 w-3 mr-1.5 -mt-px" strokeWidth={1.5} />
            Entrega
          </p>
          <p className="font-[var(--font-display)] text-[1.0625rem] leading-snug mb-1">
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

        {/* PAYMENT */}
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:p-6">
          <p className="eyebrow mb-3">
            <FileText className="inline h-3 w-3 mr-1.5 -mt-px" strokeWidth={1.5} />
            Pagamento
          </p>
          {order.payment ? (
            <>
              <p className="font-[var(--font-display)] text-[1.0625rem] leading-snug mb-1">
                {paymentMethodLabel(order.payment.method)}
              </p>
              <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                Status: <span className="font-medium">{order.payment.status}</span>
                {order.payment.paidAt && (
                  <>
                    <br />
                    Aprovado em {formatDate(order.payment.paidAt)}
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              Aguardando confirmação.
            </p>
          )}
        </div>
      </section>

      {/* INVOICE (NF-e) — só aparece quando a loja virar ME e Focus NFe estiver ativo */}
      {order.invoice && (
        <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:p-6">
          <p className="eyebrow mb-3">Nota Fiscal Eletrônica</p>
          <div className="flex flex-wrap items-center gap-3">
            {order.invoice.nfeNumber && (
              <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                NF-e <strong className="font-mono text-[color:var(--color-fg)]">{order.invoice.nfeNumber}</strong>
                {order.invoice.issuedAt && ` · ${formatDate(order.invoice.issuedAt)}`}
              </p>
            )}
            {order.invoice.pdfUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={order.invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Baixar PDF
                </a>
              </Button>
            )}
            {order.invoice.xmlUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={order.invoice.xmlUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Baixar XML
                </a>
              </Button>
            )}
          </div>
        </section>
      )}

      {/* RECIBO DE VENDA (não-fiscal) — sempre disponível pra pedidos pagos */}
      {!order.invoice &&
        order.status !== "PENDING" &&
        order.status !== "CANCELLED" && (
          <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:p-6">
            <p className="eyebrow mb-3">
              <FileText className="inline h-3 w-3 mr-1.5 -mt-px" strokeWidth={1.5} />
              Recibo de venda
            </p>
            <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] mb-4 leading-[var(--leading-relaxed)]">
              Documento não-fiscal comprovando sua compra. Salve em PDF pelo
              menu do navegador.
            </p>
            <Button asChild size="sm" variant="outline">
              <a
                href={`/api/recibo/${order.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                Abrir recibo
              </a>
            </Button>
          </section>
        )}

      {/* TOTALS */}
      <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-5 lg:p-6">
        <p className="eyebrow mb-4">Resumo</p>
        <dl className="space-y-2 text-[0.9375rem]">
          <Row label="Subtotal" value={formatBRL(Number(order.subtotal))} />
          <Row
            label={`Frete · ${order.shippingService} (${order.shippingCarrier})`}
            value={formatBRL(Number(order.shippingCost))}
          />
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
          <span className="font-[var(--font-display)] text-[1.5rem] leading-none text-[color:var(--color-fg)]">
            {formatBRL(Number(order.total))}
          </span>
        </div>
      </section>

      {/* CUSTOMER NOTES */}
      {order.customerNotes && (
        <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-hairline)] p-5">
          <p className="eyebrow mb-2">Suas observações</p>
          <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)] whitespace-pre-line">
            {order.customerNotes}
          </p>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button asChild variant="outline">
          <Link href="/conta/pedidos">
            <Package className="h-4 w-4" strokeWidth={1.5} />
            Todos os pedidos
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/contato">Precisa de ajuda?</Link>
        </Button>
      </div>
    </div>
  );
}

// =====================================================================
// HELPERS
// =====================================================================

function paymentMethodLabel(m: string): string {
  switch (m) {
    case "CREDIT_CARD":
      return "Cartão de crédito";
    case "PIX":
      return "PIX";
    case "BOLETO":
      return "Boleto bancário";
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

function CopyableCode({ code }: { code: string }) {
  return (
    <p className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-[var(--radius-sm)] bg-[color:var(--color-bg-elevated)] font-[var(--font-mono)] text-[0.875rem] text-[color:var(--color-fg)]">
      {code}
      <Copy className="h-3 w-3 opacity-40" strokeWidth={1.5} aria-hidden />
    </p>
  );
}

function NoDbMessage() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
      <Clock className="h-7 w-7 mx-auto text-[color:var(--color-gold)]/60" strokeWidth={1.5} />
      <h3 className="display text-[1.5rem] mt-4">Modo demo</h3>
      <p className="mt-2 max-w-md mx-auto text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
        Detalhes de pedido só ficam disponíveis com Supabase configurado.
      </p>
    </div>
  );
}

// Suppress unused if not used
void Check;
