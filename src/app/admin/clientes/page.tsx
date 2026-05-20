import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate } from "@/lib/utils";

export const metadata = { title: "Clientes · Admin" };

const USE_DB = !!process.env.DATABASE_URL;

export default async function AdminClientsPage() {
  if (!USE_DB) {
    return <div className="rounded-[var(--radius-lg)] border border-dashed p-10 text-center">Modo demo.</div>;
  }

  const { prisma } = await import("@/lib/prisma");

  // Buscar clientes + agregados de pedidos (LTV)
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
      lastLoginAt: true,
      orders: {
        where: {
          status: { in: ["PAID", "PROCESSING", "AWAITING_RELEASE", "SHIPPED", "DELIVERED"] },
        },
        select: { total: true, createdAt: true },
      },
    },
  });

  const enriched = customers.map((c) => {
    const ltv = c.orders.reduce((acc, o) => acc + Number(o.total), 0);
    const orderCount = c.orders.length;
    const lastOrder = c.orders.length
      ? c.orders.reduce((max, o) => (o.createdAt > max ? o.createdAt : max), c.orders[0]!.createdAt)
      : null;
    return { ...c, ltv, orderCount, lastOrder };
  });

  // Top spenders primeiro
  enriched.sort((a, b) => b.ltv - a.ltv);

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow index="—">Pessoas · clientes</Eyebrow>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">Clientes</h1>
        <p className="mt-2 eyebrow">{enriched.length} cadastrados (top 100)</p>
      </header>

      {enriched.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed p-10 text-center text-[color:var(--color-fg-soft)]">
          Sem clientes cadastrados ainda.
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[color:var(--color-bg-elevated)] border-b border-[color:var(--color-hairline)]">
              <tr className="text-left">
                <Th>Cliente</Th>
                <Th>Contato</Th>
                <Th>Pedidos</Th>
                <Th>LTV</Th>
                <Th>Último pedido</Th>
                <Th>Cadastrado</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-hairline)]">
              {enriched.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <p className="text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
                      {c.name ?? "(sem nome)"}
                    </p>
                  </Td>
                  <Td>
                    <p className="flex items-center gap-1.5 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                      <Mail className="h-3 w-3" strokeWidth={1.5} />
                      <a href={`mailto:${c.email}`} className="hover:text-[color:var(--color-gold)] truncate">
                        {c.email}
                      </a>
                    </p>
                    {c.phone && (
                      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] mt-0.5">
                        <Phone className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {c.phone}
                      </p>
                    )}
                  </Td>
                  <Td>
                    {c.orderCount > 0 ? (
                      <Badge variant="gold" size="sm">
                        {c.orderCount}
                      </Badge>
                    ) : (
                      <Badge variant="soft" size="sm">0</Badge>
                    )}
                  </Td>
                  <Td>
                    <span className="font-[var(--font-mono)] text-[0.875rem]">
                      {formatBRL(c.ltv)}
                    </span>
                  </Td>
                  <Td>
                    <span className="eyebrow">
                      {c.lastOrder ? formatDate(c.lastOrder) : "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="eyebrow whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </span>
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
