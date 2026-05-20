"use client";

import * as React from "react";
import { FileText, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  emitNfeManual,
  cancelNfeManual,
} from "@/server/actions/admin-nfe-actions";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";

interface AdminNfeActionsProps {
  orderId: string;
  invoice: {
    id: string;
    status: InvoiceStatus;
    nfeNumber: string | null;
    pdfUrl: string | null;
    xmlUrl: string | null;
    issuedAt: Date | null;
    rejectionReason: string | null;
  } | null;
  /** Pedido tem status que permite emissão (SHIPPED ou DELIVERED — não PENDING/PRE) */
  canEmit: boolean;
}

export function AdminNfeActions({ orderId, invoice, canEmit }: AdminNfeActionsProps) {
  const [pending, startTransition] = React.useTransition();
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function show(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 6000);
  }

  function onEmit() {
    if (!canEmit) {
      show("error", "Pedido precisa estar em SHIPPED ou DELIVERED pra emitir NF-e.");
      return;
    }
    if (!confirm("Emitir NF-e pra este pedido?")) return;
    startTransition(async () => {
      const res = await emitNfeManual(orderId);
      if (res.ok) {
        show("success", "NF-e em processamento — atualize em alguns segundos.");
      } else {
        show("error", res.error ?? "Erro ao emitir.");
      }
    });
  }

  function onCancel() {
    const justificativa = prompt(
      "Justificativa do cancelamento (mín 15 caracteres, obrigatório por regra SEFAZ):",
    );
    if (!justificativa || justificativa.trim().length < 15) {
      show("error", "Justificativa precisa ter ao menos 15 caracteres.");
      return;
    }
    startTransition(async () => {
      const res = await cancelNfeManual(orderId, justificativa);
      if (res.ok) {
        show("success", "NF-e cancelada.");
      } else {
        show("error", res.error ?? "Erro ao cancelar.");
      }
    });
  }

  const status = invoice?.status;
  const issuedHours =
    invoice?.issuedAt
      ? (Date.now() - invoice.issuedAt.getTime()) / (1000 * 60 * 60)
      : null;
  const canCancel = status === "AUTHORIZED" && issuedHours !== null && issuedHours <= 24;

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border p-4 lg:p-5",
        feedback?.type === "error"
          ? "border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/5"
          : "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-1.5">
            <FileText className="h-3 w-3" strokeWidth={1.5} />
            Nota Fiscal Eletrônica
          </p>
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
          ) : invoice ? (
            <div className="mt-1 flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              <NfeStatusBadge status={invoice.status} />
              {invoice.nfeNumber && (
                <span className="font-[var(--font-mono)] text-[0.75rem]">
                  NF-e {invoice.nfeNumber}
                </span>
              )}
              {invoice.status === "REJECTED" && invoice.rejectionReason && (
                <span className="text-[color:var(--color-vermilion)] text-[var(--text-caption)] truncate max-w-xs">
                  {invoice.rejectionReason}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
              {canEmit
                ? "Pronta pra emitir."
                : "Emite após postagem do pedido (regra pra pré-venda)."}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botões pra invoice existente */}
          {invoice?.pdfUrl && (
            <a
              href={invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-[var(--radius-md)] border border-[color:var(--color-border)] text-[0.8125rem] text-[color:var(--color-fg)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              DANFE
            </a>
          )}
          {invoice?.xmlUrl && (
            <a
              href={invoice.xmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-[var(--radius-md)] border border-[color:var(--color-border)] text-[0.8125rem] text-[color:var(--color-fg-soft)] hover:border-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] transition-colors"
            >
              XML
            </a>
          )}

          {/* Botão Emitir / Re-emitir */}
          {(!invoice ||
            invoice.status === "REJECTED" ||
            invoice.status === "ERROR" ||
            invoice.status === "CANCELLED") && (
            <Button onClick={onEmit} disabled={pending || !canEmit} size="md">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <FileText className="h-4 w-4" strokeWidth={1.5} />
              )}
              {invoice ? "Re-emitir NF-e" : "Emitir NF-e"}
            </Button>
          )}

          {/* Cancelar (regra 24h) */}
          {canCancel && (
            <Button onClick={onCancel} disabled={pending} variant="outline" size="md">
              <XCircle className="h-4 w-4" strokeWidth={1.5} />
              Cancelar NF-e
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function NfeStatusBadge({ status }: { status: InvoiceStatus }) {
  const config: Record<InvoiceStatus, { tone: "gold" | "soft" | "vermilion"; label: string }> = {
    PENDING: { tone: "soft", label: "Pendente" },
    PROCESSING: { tone: "soft", label: "Processando" },
    AUTHORIZED: { tone: "gold", label: "Autorizada" },
    REJECTED: { tone: "vermilion", label: "Rejeitada" },
    CANCELLED: { tone: "vermilion", label: "Cancelada" },
    ERROR: { tone: "vermilion", label: "Erro" },
  };
  const { tone, label } = config[status];
  return (
    <Badge variant={tone} size="sm">
      {label}
    </Badge>
  );
}
