import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, formatDate, cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

export const metadata = { title: "Pedidos · Admin" };

const USE_DB = !!process.env.DATABASE_URL;
const PER_PAGE = 30;

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

interface PageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const status = sp.status as OrderStatus | undefined;
  const q = sp.q?.trim();
  const page = Math.max(1, Number(sp.page) || 1);

  if (!USE_DB) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed p-10 text-center">
        <h2 className="display text-[1.5rem]">Modo demo</h2>
        <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
          Pedidos exigem Supabase configurado.
        </p>
      </div>
    );
  }

  const { prisma } = await import("@/lib/prisma");

  const where = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { orderNumber: { contains: q, mode: "insensitive" as const } },
        { user: { email: { contains: q, mode: "insensitive" as const } } },
        { user: { name: { contains: q, mode: "insensitive" as const } } },
        { guestEmail: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [total, orders, byStatusCounts] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const countByStatus = Object.fromEntries(
    byStatusCounts.map((g) => [g.status, g._count]),
  );

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow index="—">Operação</Eyebrow>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">Pedidos</h1>
      </header>

      {/* Status pills */}
      <nav aria-label="Filtros de status" className="flex flex-wrap gap-2">
        <StatusPill href="/admin/pedidos" active={!status} label="Todos" count={Object.values(countByStatus).reduce((a, b) => a + b, 0)} />
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
          <StatusPill
            key={s}
            href={`/admin/pedidos?status=${s}`}
            active={status === s}
            label={STATUS_LABEL[s]}
            count={countByStatus[s] ?? 0}
          />
        ))}
      </nav>

      {/* Search */}
      <form action="/admin/pedidos" className="flex items-center gap-3 max-w-xl">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Busca por nº de pedido, email ou nome do cliente"
          className="flex-1 h-10 px-4 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-transparent text-[0.875rem]"
        />
        <Button type="submit" variant="outline" size="md">
          Buscar
        </Button>
      </form>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed p-10 text-center text-[color:var(--color-fg-soft)]">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[color:var(--color-bg-elevated)] border-b border-[color:var(--color-hairline)]">
              <tr className="text-left">
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Frete</Th>
                <Th>Status</Th>
                <Th>Data</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-hairline)]">
              {orders.map((o) => {
                const totalItems = o.items.reduce((a, i) => a + i.quantity, 0);
                return (
                  <tr
                    key={o.id}
                    className="hover:bg-[color:var(--color-bg-elevated)]/50 transition-colors"
                  >
                    <Td>
                      <Link
                        href={`/admin/pedidos/${o.orderNumber}`}
                        className="font-[var(--font-mono)] text-[0.8125rem] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)]"
                      >
                        {o.orderNumber}
                      </Link>
                      {o.hasPreOrderItems && (
                        <Badge variant="gold" size="sm" className="ml-2">
                          Pré
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      <p className="text-[0.8125rem] text-[color:var(--color-fg)] truncate max-w-[16rem]">
                        {o.user?.name ?? o.guestEmail ?? "—"}
                      </p>
                      <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] truncate max-w-[16rem]">
                        {o.user?.email ?? o.guestEmail ?? ""}
                      </p>
                    </Td>
                    <Td>
                      <span className="text-[0.8125rem]">{totalItems}</span>
                    </Td>
                    <Td>
                      <span className="font-[var(--font-mono)] text-[0.8125rem]">
                        {formatBRL(Number(o.total))}
                      </span>
                    </Td>
                    <Td>
                      <p className="text-[0.8125rem] text-[color:var(--color-fg-soft)] truncate max-w-[10rem]">
                        {o.shippingService}
                      </p>
                      <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
                        {o.shippingCarrier}
                      </p>
                    </Td>
                    <Td>
                      <Badge variant={STATUS_TONE[o.status]} size="sm">
                        {STATUS_LABEL[o.status]}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="eyebrow whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/pedidos?${new URLSearchParams({
                ...(q && { q }),
                ...(status && { status }),
                page: String(p),
              }).toString()}`}
              className={cn(
                "inline-flex h-8 min-w-8 items-center justify-center px-2.5 rounded-[var(--radius-sm)] text-[0.8125rem] font-[var(--font-mono)]",
                p === page
                  ? "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]"
                  : "text-[color:var(--color-fg-soft)] hover:bg-[color:var(--color-bg-elevated)]",
              )}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function StatusPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-pill)] text-[0.8125rem] border transition-colors",
        active
          ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]"
          : "border-[color:var(--color-border)] text-[color:var(--color-fg-soft)] hover:border-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]",
      )}
    >
      {label}
      <span className="font-[var(--font-mono)] text-[10px] opacity-70">
        {count}
      </span>
    </Link>
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
