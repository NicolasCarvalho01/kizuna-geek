import * as React from "react";
import { Check, Clock, X } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { cn, formatDate } from "@/lib/utils";

interface OrderTimelineProps {
  status: OrderStatus;
  hasPreOrder: boolean;
  history: Array<{
    toStatus: OrderStatus;
    createdAt: string;
    notes: string | null;
  }>;
  expectedShipDate: string | null;
}

interface Step {
  status: OrderStatus;
  label: string;
  description: (ctx: { expectedShipDate?: string | null }) => string;
}

// Fluxo padrão (sem pré-venda)
const NORMAL_FLOW: Step[] = [
  {
    status: "PENDING",
    label: "Pedido criado",
    description: () => "Aguardando confirmação do pagamento.",
  },
  {
    status: "PAID",
    label: "Pagamento aprovado",
    description: () => "Vamos começar a preparar seu pedido.",
  },
  {
    status: "PROCESSING",
    label: "Em preparação",
    description: () => "Etiqueta gerada. Aguardando despacho.",
  },
  {
    status: "SHIPPED",
    label: "Enviado",
    description: () => "Postado nos Correios/transportadora.",
  },
  {
    status: "DELIVERED",
    label: "Entregue",
    description: () => "Pedido entregue. Esperamos que goste!",
  },
];

// Fluxo pré-venda — insere AWAITING_RELEASE após PAID
const PREORDER_FLOW: Step[] = [
  NORMAL_FLOW[0]!,
  NORMAL_FLOW[1]!,
  {
    status: "AWAITING_RELEASE",
    label: "Aguardando lançamento",
    description: ({ expectedShipDate }) =>
      expectedShipDate
        ? `Item em pré-venda. Envio a partir de ${formatDate(new Date(expectedShipDate))}.`
        : "Item em pré-venda. Será enviado quando lançar.",
  },
  NORMAL_FLOW[2]!,
  NORMAL_FLOW[3]!,
  NORMAL_FLOW[4]!,
];

const TERMINAL_FAILED: Record<"CANCELLED" | "REFUNDED", Step> = {
  CANCELLED: {
    status: "CANCELLED",
    label: "Pedido cancelado",
    description: () => "Operação encerrada — sem cobranças adicionais.",
  },
  REFUNDED: {
    status: "REFUNDED",
    label: "Estornado",
    description: () => "Valor devolvido ao seu método de pagamento.",
  },
};

export function OrderTimeline({
  status,
  hasPreOrder,
  history,
  expectedShipDate,
}: OrderTimelineProps) {
  // Caso terminal: pedido foi cancelado ou estornado
  if (status === "CANCELLED" || status === "REFUNDED") {
    const terminalStep = TERMINAL_FAILED[status];
    const lastHistoryItem = history[history.length - 1];
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 p-5 lg:p-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-vermilion)] text-white shrink-0">
            <X className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <p className="font-[var(--font-display)] text-[1.125rem] leading-snug">
              {terminalStep.label}
            </p>
            <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              {terminalStep.description({ expectedShipDate })}
            </p>
            {lastHistoryItem?.createdAt && (
              <p className="mt-2 eyebrow">
                {formatDate(new Date(lastHistoryItem.createdAt))}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const flow = hasPreOrder ? PREORDER_FLOW : NORMAL_FLOW;

  // Encontra o índice do status atual no flow
  const currentIdx = flow.findIndex((s) => s.status === status);

  // Mapa de quando cada status aconteceu (do history)
  const dateByStatus = new Map(
    history.map((h) => [h.toStatus, h.createdAt]),
  );

  return (
    <ol className="relative">
      {/* Linha vertical de fundo */}
      <span
        aria-hidden
        className="absolute left-[1.0625rem] top-3 bottom-3 w-px bg-[color:var(--color-hairline)]"
      />

      {flow.map((step, idx) => {
        const completed = currentIdx > idx;
        const current = currentIdx === idx;
        const future = currentIdx < idx;
        const date = dateByStatus.get(step.status);

        return (
          <li
            key={step.status}
            className={cn(
              "relative pl-12 pb-6 last:pb-0",
              future && "opacity-40",
            )}
          >
            {/* Bolinha do status */}
            <span
              className={cn(
                "absolute left-0 top-0.5 inline-flex h-[2.125rem] w-[2.125rem] items-center justify-center rounded-full border-2 transition-colors",
                completed && "bg-[color:var(--color-gold)] border-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]",
                current && "bg-[color:var(--color-bg)] border-[color:var(--color-gold)] ring-4 ring-[color:var(--color-gold)]/20",
                future && "bg-[color:var(--color-bg)] border-[color:var(--color-border-strong)]",
              )}
              aria-hidden
            >
              {completed && <Check className="h-4 w-4" strokeWidth={2.5} />}
              {current && (
                <Clock
                  className="h-4 w-4 text-[color:var(--color-gold)] animate-[shimmer-gold_1.8s_var(--ease-io-1)_infinite]"
                  strokeWidth={1.5}
                />
              )}
              {future && (
                <span className="h-2 w-2 rounded-full bg-[color:var(--color-fg-mute)]" />
              )}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p
                  className={cn(
                    "font-[var(--font-display)] text-[1.125rem] leading-tight",
                    current && "text-[color:var(--color-gold)]",
                  )}
                >
                  {step.label}
                </p>
                {date && (
                  <span className="eyebrow text-[color:var(--color-fg-mute)]">
                    {formatDate(new Date(date))}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
                {step.description({ expectedShipDate })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
