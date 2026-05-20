"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatBRL } from "@/lib/utils";

interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardChartsProps {
  revenueByDay: ReadonlyArray<RevenuePoint>;
}

const GOLD = "#b59458";
const GOLD_SOFT = "#c9a874";

export function DashboardCharts({ revenueByDay }: DashboardChartsProps) {
  const [tab, setTab] = React.useState<"revenue" | "orders">("revenue");

  // Resample x-axis labels — só dia do mês
  const data = revenueByDay.map((p) => ({
    ...p,
    label: new Date(p.date + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <Eyebrow index="—">Últimos 30 dias</Eyebrow>
          <h3 className="display mt-2 text-[1.5rem]">
            {tab === "revenue" ? "Faturamento" : "Volume de pedidos"}
          </h3>
        </div>
        <div className="inline-flex items-center p-1 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
          <TabButton active={tab === "revenue"} onClick={() => setTab("revenue")}>
            R$
          </TabButton>
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
            Pedidos
          </TabButton>
        </div>
      </div>

      <div className="h-64 lg:h-72 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          {tab === "revenue" ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gold-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.06}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "currentColor", fillOpacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.floor(data.length / 8))}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "currentColor", fillOpacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${v}`
                }
                width={48}
              />
              <Tooltip
                cursor={{ stroke: GOLD, strokeOpacity: 0.2, strokeWidth: 1 }}
                content={<CustomTooltip prefix="R$" type="revenue" />}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={GOLD}
                strokeWidth={2}
                fill="url(#gold-fill)"
                dot={false}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                strokeOpacity={0.06}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "currentColor", fillOpacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                interval={Math.max(0, Math.floor(data.length / 8))}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "currentColor", fillOpacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: GOLD, fillOpacity: 0.08 }}
                content={<CustomTooltip type="orders" />}
              />
              <Bar dataKey="orders" fill={GOLD_SOFT} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1 text-[0.75rem] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] rounded-[var(--radius-pill)] transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)] " +
        (active
          ? "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]"
          : "text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)]")
      }
    >
      {children}
    </button>
  );
}

interface TooltipPayloadEntry {
  payload: RevenuePoint & { label: string };
}

function CustomTooltip({
  active,
  payload,
  type,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  prefix?: string;
  type: "revenue" | "orders";
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload;
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2 shadow-[var(--shadow-2)]">
      <p className="eyebrow">{point.label}</p>
      <p className="mt-1 font-[var(--font-mono)] text-[0.875rem] text-[color:var(--color-fg)]">
        {type === "revenue" ? formatBRL(point.revenue) : `${point.orders} pedidos`}
      </p>
      {type === "revenue" && point.orders > 0 && (
        <p className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
          {point.orders} pedido{point.orders === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
