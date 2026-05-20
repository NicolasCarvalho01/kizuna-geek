import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wallet,
  Package,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import {
  getDashboardKpis,
  getRevenueByDay,
  getTopProducts,
  getOrdersStatusBreakdown,
  getMelhorEnvioBalance,
} from "@/server/queries/admin-stats";
import { formatBRL, formatDate, cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard · Admin",
};

export default async function AdminDashboardPage() {
  const [kpis, revenueByDay, topProducts, statusBreakdown, meBalance] =
    await Promise.all([
      getDashboardKpis(),
      getRevenueByDay(30),
      getTopProducts(5),
      getOrdersStatusBreakdown(),
      getMelhorEnvioBalance(),
    ]);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow index="—">Painel</Eyebrow>
          <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">
            Bom dia,{" "}
            <em className="display-italic text-[color:var(--color-gold)]">
              admin
            </em>
            .
          </h1>
        </div>
        <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
          Atualizado em {formatDate(new Date())}
        </p>
      </header>

      {/* KPIs */}
      <section>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={DollarSign}
            label="Faturamento · 30d"
            value={formatBRL(kpis.revenue30d)}
            delta={delta(kpis.revenue30d, kpis.revenuePrev30d)}
          />
          <KpiCard
            icon={ShoppingBag}
            label="Pedidos · 30d"
            value={String(kpis.paidOrders30d)}
            delta={delta(kpis.paidOrders30d, kpis.paidOrdersPrev30d)}
          />
          <KpiCard
            icon={TrendingUp}
            label="Ticket médio"
            value={formatBRL(kpis.averageOrderValue)}
          />
          <KpiCard
            icon={Wallet}
            label="Saldo Melhor Envio"
            value={
              meBalance === null
                ? "ME não conectado"
                : formatBRL(meBalance)
            }
            tone={meBalance !== null && meBalance < 50 ? "warning" : "default"}
          />
        </ul>
      </section>

      {/* Alertas */}
      {(kpis.lowStockItems > 0 ||
        kpis.abandonedCarts > 0 ||
        kpis.awaitingRelease > 0) && (
        <section>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {kpis.awaitingRelease > 0 && (
              <AlertCard
                icon={Calendar}
                label={`${kpis.awaitingRelease} pedido(s) aguardando lançamento`}
                href="/admin/pre-vendas"
                tone="gold"
              />
            )}
            {kpis.lowStockItems > 0 && (
              <AlertCard
                icon={Package}
                label={`${kpis.lowStockItems} variantes com estoque baixo`}
                href="/admin/produtos?filter=low-stock"
                tone="vermilion"
              />
            )}
            {kpis.abandonedCarts > 0 && (
              <AlertCard
                icon={ShoppingCart}
                label={`${kpis.abandonedCarts} carrinhos abandonados`}
                href="/admin/pedidos?status=PENDING"
                tone="soft"
              />
            )}
          </ul>
        </section>
      )}

      {/* Charts */}
      <section>
        <DashboardCharts revenueByDay={revenueByDay} />
      </section>

      {/* Bottom grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produtos */}
        <Panel title="Top produtos · 30d" linkHref="/admin/produtos">
          {topProducts.length === 0 ? (
            <Empty message="Ainda sem vendas nos últimos 30 dias." />
          ) : (
            <ol className="divide-y divide-[color:var(--color-hairline)]">
              {topProducts.map((p, i) => (
                <li key={p.productId} className="py-3 flex items-center gap-3">
                  <span className="font-[var(--font-mono)] text-[0.75rem] text-[color:var(--color-fg-mute)] w-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]">
                    {p.imageUrl && (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/produtos/${p.productId}`}
                      className="text-[0.875rem] font-medium text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors truncate block"
                    >
                      {p.name}
                    </Link>
                    <p className="eyebrow">
                      {p.unitsSold} vendidos · {formatBRL(p.revenue)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        {/* Breakdown por status */}
        <Panel title="Pedidos por status · 30d" linkHref="/admin/pedidos">
          {statusBreakdown.length === 0 ? (
            <Empty message="Sem pedidos no período." />
          ) : (
            <ul className="space-y-3">
              {statusBreakdown.map((s) => {
                const max = Math.max(...statusBreakdown.map((x) => x.count));
                const pct = max > 0 ? (s.count / max) * 100 : 0;
                return (
                  <li key={s.status}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[0.875rem] text-[color:var(--color-fg)]">
                        {s.label}
                      </span>
                      <span className="font-[var(--font-mono)] text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        {s.count}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[color:var(--color-bg-sunken)] overflow-hidden">
                      <span
                        className="block h-full bg-[color:var(--color-gold)] transition-all duration-[var(--motion-slow)] ease-[var(--ease-out-5)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

// =====================================================================
// COMPONENTES INTERNOS
// =====================================================================

function delta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  delta?: number;
  tone?: "default" | "warning";
}

function KpiCard({ icon: Icon, label, value, delta, tone = "default" }: KpiCardProps) {
  const showDelta = delta !== undefined && Number.isFinite(delta);
  const isPositive = delta !== undefined && delta >= 0;
  return (
    <li
      className={cn(
        "rounded-[var(--radius-md)] border p-4 lg:p-5",
        tone === "warning"
          ? "border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/5"
          : "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="h-4 w-4 text-[color:var(--color-gold)]" strokeWidth={1.5} />
        {showDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)]",
              isPositive
                ? "text-[color:var(--color-gold)]"
                : "text-[color:var(--color-vermilion)]",
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
            ) : (
              <TrendingDown className="h-3 w-3" strokeWidth={1.5} />
            )}
            {isPositive ? "+" : ""}
            {delta!.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="font-[var(--font-display)] text-[1.5rem] leading-none mb-1">
        {value}
      </p>
      <p className="eyebrow">{label}</p>
    </li>
  );
}

function AlertCard({
  icon: Icon,
  label,
  href,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  href: string;
  tone: "gold" | "vermilion" | "soft";
}) {
  const toneClasses = {
    gold: "border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 text-[color:var(--color-fg)]",
    vermilion:
      "border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 text-[color:var(--color-fg)]",
    soft: "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] text-[color:var(--color-fg-soft)]",
  };
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center justify-between gap-3 rounded-[var(--radius-md)] border p-4 group transition-colors",
          toneClasses[tone],
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="text-[0.875rem] truncate">{label}</span>
        </div>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
          strokeWidth={1.5}
        />
      </Link>
    </li>
  );
}

function Panel({
  title,
  linkHref,
  children,
}: {
  title: string;
  linkHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="eyebrow">{title}</h3>
        {linkHref && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)] transition-colors"
          >
            Ver tudo
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <p className="py-6 text-center text-[var(--text-caption)] text-[color:var(--color-fg-mute)]">
      {message}
    </p>
  );
}
