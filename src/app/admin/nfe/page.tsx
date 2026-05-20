import Link from "next/link";
import { FileText } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatBRL } from "@/lib/utils";

export const metadata = { title: "NF-e · Admin" };

const USE_DB = !!process.env.DATABASE_URL;

const STATUS_TONE = {
  PENDING: "soft",
  PROCESSING: "soft",
  AUTHORIZED: "gold",
  REJECTED: "vermilion",
  CANCELLED: "vermilion",
  ERROR: "vermilion",
} as const;

export default async function AdminNfePage() {
  if (!USE_DB) {
    return <div className="rounded-[var(--radius-lg)] border border-dashed p-10 text-center">Modo demo.</div>;
  }

  const { prisma } = await import("@/lib/prisma");
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      order: {
        select: {
          orderNumber: true,
          total: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow index="—">Operação · NF-e</Eyebrow>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">Notas fiscais</h1>
      </header>

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/5 p-5">
        <p className="eyebrow text-[color:var(--color-gold)]">Fase 6</p>
        <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-relaxed">
          A emissão automática via Focus NFe entra na Fase 6 (NF-e + Emails). Pedidos com pré-venda só emitem NF-e quando o item é efetivamente despachado.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
          <FileText className="h-7 w-7 mx-auto text-[color:var(--color-gold)]/60" strokeWidth={1.5} />
          <p className="mt-4 text-[color:var(--color-fg-soft)]">
            Nenhuma NF-e emitida ainda.
          </p>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[color:var(--color-bg-elevated)] border-b border-[color:var(--color-hairline)]">
              <tr className="text-left">
                <Th>Número</Th>
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th>Valor</Th>
                <Th>Status</Th>
                <Th>Emitida</Th>
                <Th>&nbsp;</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-hairline)]">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <Td>
                    <p className="font-[var(--font-mono)] text-[0.8125rem]">
                      {inv.nfeNumber ?? "—"}
                    </p>
                    {inv.nfeSeries && (
                      <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
                        Série {inv.nfeSeries}
                      </p>
                    )}
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/pedidos/${inv.order.orderNumber}`}
                      className="font-[var(--font-mono)] text-[0.8125rem] text-[color:var(--color-gold)] hover:underline"
                    >
                      {inv.order.orderNumber}
                    </Link>
                  </Td>
                  <Td>
                    <p className="text-[0.8125rem] truncate max-w-[14rem]">
                      {inv.order.user?.name ?? inv.order.user?.email ?? "—"}
                    </p>
                  </Td>
                  <Td>
                    <span className="font-[var(--font-mono)] text-[0.8125rem]">
                      {formatBRL(Number(inv.order.total))}
                    </span>
                  </Td>
                  <Td>
                    <Badge variant={STATUS_TONE[inv.status]} size="sm">
                      {inv.status}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="eyebrow whitespace-nowrap">
                      {inv.issuedAt ? formatDate(inv.issuedAt) : "—"}
                    </span>
                  </Td>
                  <Td>
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.8125rem] text-[color:var(--color-gold)] hover:underline"
                      >
                        PDF
                      </a>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] font-medium text-[color:var(--color-fg-mute)]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
