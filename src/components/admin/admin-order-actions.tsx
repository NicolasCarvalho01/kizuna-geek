"use client";

import * as React from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Printer,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buyShippingLabel,
  getPrintLabelUrl,
  markAsPosted,
} from "@/server/actions/admin-order-actions";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

interface AdminOrderActionsProps {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  meOrderId: string | null;
  meLabelUrl: string | null;
  hasPreOrder: boolean;
}

export function AdminOrderActions({
  orderId,
  currentStatus,
  meOrderId,
  meLabelUrl,
  hasPreOrder,
}: AdminOrderActionsProps) {
  const [pending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  }

  function onBuyLabel() {
    if (
      !confirm(
        "Confirma a compra da etiqueta? O saldo do Melhor Envio será debitado.",
      )
    )
      return;

    startTransition(async () => {
      const res = await buyShippingLabel(orderId);
      if (res.ok) {
        showFeedback("success", "Etiqueta comprada! PDF disponível.");
      } else {
        showFeedback("error", res.error ?? "Erro ao comprar etiqueta.");
      }
    });
  }

  function onPrintLabel() {
    startTransition(async () => {
      const res = await getPrintLabelUrl(orderId);
      if (res.ok && res.data) {
        window.open((res.data as { url: string }).url, "_blank", "noopener");
      } else {
        showFeedback("error", res.error ?? "Erro ao gerar PDF.");
      }
    });
  }

  function onMarkPosted() {
    const trackingCode = prompt(
      "Código de rastreio dos Correios/transportadora (opcional):",
    );
    if (trackingCode === null) return; // cancelado

    startTransition(async () => {
      const res = await markAsPosted(orderId, trackingCode || undefined);
      if (res.ok) {
        showFeedback("success", "Pedido marcado como postado. NF-e dispara em seguida (Fase 6).");
      } else {
        showFeedback("error", res.error ?? "Erro ao marcar como postado.");
      }
    });
  }

  // Lógica de quais botões mostrar
  const canBuyLabel =
    !meOrderId && (currentStatus === "PAID" || currentStatus === "PROCESSING");
  const canPrint = !!meOrderId;
  const canPost =
    currentStatus !== "SHIPPED" &&
    currentStatus !== "DELIVERED" &&
    currentStatus !== "CANCELLED" &&
    currentStatus !== "REFUNDED" &&
    currentStatus !== "PENDING" &&
    !hasPreOrder;

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border p-4 lg:p-5",
        feedback?.type === "error"
          ? "border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/5"
          : "border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-[color:var(--color-gold)]">Ações do pedido</p>
          {feedback ? (
            <p
              className={cn(
                "mt-1 text-[var(--text-caption)] leading-snug",
                feedback.type === "success"
                  ? "text-[color:var(--color-gold)]"
                  : "text-[color:var(--color-vermilion)]",
              )}
            >
              {feedback.message}
            </p>
          ) : (
            <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-snug">
              {hasPreOrder && currentStatus === "AWAITING_RELEASE"
                ? "Pedido em pré-venda — aguarde lançamento antes de comprar etiqueta."
                : meOrderId
                  ? `ME order: ${meOrderId}`
                  : "Próximo passo: comprar etiqueta no Melhor Envio."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canBuyLabel && (
            <Button onClick={onBuyLabel} disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              )}
              Comprar etiqueta ME
            </Button>
          )}

          {canPrint && (
            <>
              <Button
                variant="outline"
                onClick={onPrintLabel}
                disabled={pending}
              >
                <Printer className="h-4 w-4" strokeWidth={1.5} />
                Imprimir etiqueta
              </Button>
              {meLabelUrl && (
                <a
                  href={meLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 h-11 rounded-[var(--radius-md)] text-[0.875rem] text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-gold)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                  Ver PDF
                </a>
              )}
            </>
          )}

          {canPost && (
            <Button onClick={onMarkPosted} disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Truck className="h-4 w-4" strokeWidth={1.5} />
              )}
              Marcar como postado
            </Button>
          )}

          {currentStatus === "DELIVERED" && (
            <span className="inline-flex items-center gap-2 px-4 h-11 text-[0.875rem] text-[color:var(--color-gold)]">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
              Pedido entregue
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
