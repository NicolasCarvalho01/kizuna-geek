import "server-only";

/**
 * Queries de métricas pro painel admin.
 *
 * Todas exigem DATABASE_URL configurado. Em modo demo retornam stub.
 */

const USE_DB = !!process.env.DATABASE_URL;

export interface DashboardKpis {
  /** Faturamento bruto dos últimos 30 dias (Decimal) */
  revenue30d: number;
  /** Mesma janela, 30 dias anteriores — pra calcular delta */
  revenuePrev30d: number;
  /** Pedidos pagos nos últimos 30 dias */
  paidOrders30d: number;
  /** Pedidos da janela anterior */
  paidOrdersPrev30d: number;
  /** Ticket médio dos últimos 30 dias */
  averageOrderValue: number;
  /** Carrinhos abandonados (orders PENDING + > 1h sem mudar) */
  abandonedCarts: number;
  /** Itens em estoque baixo */
  lowStockItems: number;
  /** Pedidos aguardando lançamento (pré-venda paga) */
  awaitingRelease: number;
}

export interface RevenuePoint {
  date: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
}

export interface StatusBreakdown {
  status: string;
  label: string;
  count: number;
}

// =====================================================================
// KPIs
// =====================================================================

export async function getDashboardKpis(): Promise<DashboardKpis> {
  if (!USE_DB) {
    return {
      revenue30d: 0,
      revenuePrev30d: 0,
      paidOrders30d: 0,
      paidOrdersPrev30d: 0,
      averageOrderValue: 0,
      abandonedCarts: 0,
      lowStockItems: 0,
      awaitingRelease: 0,
    };
  }

  const { prisma } = await import("@/lib/prisma");
  const now = new Date();
  const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const start60d = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [
    rev30d,
    revPrev30d,
    paidCount,
    paidPrevCount,
    abandoned,
    lowStock,
    awaiting,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "PROCESSING", "AWAITING_RELEASE", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start30d },
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: ["PAID", "PROCESSING", "AWAITING_RELEASE", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start60d, lt: start30d },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        status: { in: ["PAID", "PROCESSING", "AWAITING_RELEASE", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start30d },
      },
    }),
    prisma.order.count({
      where: {
        status: { in: ["PAID", "PROCESSING", "AWAITING_RELEASE", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start60d, lt: start30d },
      },
    }),
    prisma.order.count({
      where: { status: "PENDING", createdAt: { lt: oneHourAgo } },
    }),
    prisma.productVariant.count({
      where: {
        isActive: true,
        // stock <= lowStockThreshold — Prisma 6 não tem comparação direta entre cols
        // então usamos count com filtro abaixo. Aproximação: stock < 5
        stock: { lt: 5 },
      },
    }),
    prisma.order.count({ where: { status: "AWAITING_RELEASE" } }),
  ]);

  const revenue30d = Number(rev30d._sum.total ?? 0);
  const revenuePrev30d = Number(revPrev30d._sum.total ?? 0);
  const averageOrderValue = paidCount > 0 ? revenue30d / paidCount : 0;

  return {
    revenue30d,
    revenuePrev30d,
    paidOrders30d: paidCount,
    paidOrdersPrev30d: paidPrevCount,
    averageOrderValue,
    abandonedCarts: abandoned,
    lowStockItems: lowStock,
    awaitingRelease: awaiting,
  };
}

// =====================================================================
// FATURAMENTO POR DIA (últimos 30 dias)
// =====================================================================

export async function getRevenueByDay(days = 30): Promise<RevenuePoint[]> {
  if (!USE_DB) return [];

  const { prisma } = await import("@/lib/prisma");
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  start.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "PROCESSING", "AWAITING_RELEASE", "SHIPPED", "DELIVERED"] },
      createdAt: { gte: start },
    },
    select: { total: true, createdAt: true },
  });

  // Bucket por dia
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { revenue: 0, orders: 0 });
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.revenue += Number(order.total);
      bucket.orders += 1;
    }
  }

  return Array.from(buckets.entries()).map(([date, val]) => ({
    date,
    revenue: val.revenue,
    orders: val.orders,
  }));
}

// =====================================================================
// TOP PRODUTOS
// =====================================================================

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  if (!USE_DB) return [];

  const { prisma } = await import("@/lib/prisma");
  const start30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Agrega por variante (depois colapsa por produto)
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { in: ["PAID", "PROCESSING", "AWAITING_RELEASE", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: start30d },
      },
    },
    select: {
      productVariantId: true,
      productName: true,
      quantity: true,
      totalPrice: true,
      imageUrl: true,
      productVariant: {
        select: {
          product: { select: { id: true, slug: true } },
        },
      },
    },
  });

  // Colapsar por productId
  const map = new Map<
    string,
    {
      productId: string;
      slug: string;
      name: string;
      imageUrl: string | null;
      unitsSold: number;
      revenue: number;
    }
  >();

  for (const item of items) {
    const pid = item.productVariant.product.id;
    const existing = map.get(pid);
    if (existing) {
      existing.unitsSold += item.quantity;
      existing.revenue += Number(item.totalPrice);
    } else {
      map.set(pid, {
        productId: pid,
        slug: item.productVariant.product.slug,
        name: item.productName,
        imageUrl: item.imageUrl,
        unitsSold: item.quantity,
        revenue: Number(item.totalPrice),
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// =====================================================================
// QUEBRA POR STATUS
// =====================================================================

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Em preparação",
  AWAITING_RELEASE: "Pré-venda paga",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Estornado",
};

export async function getOrdersStatusBreakdown(): Promise<StatusBreakdown[]> {
  if (!USE_DB) return [];

  const { prisma } = await import("@/lib/prisma");
  const start30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const grouped = await prisma.order.groupBy({
    by: ["status"],
    where: { createdAt: { gte: start30d } },
    _count: true,
  });

  return grouped
    .map((g) => ({
      status: g.status,
      label: STATUS_LABEL[g.status] ?? g.status,
      count: g._count,
    }))
    .sort((a, b) => b.count - a.count);
}

// =====================================================================
// SALDO MELHOR ENVIO
// =====================================================================

export async function getMelhorEnvioBalance(): Promise<number | null> {
  if (!process.env.MELHOR_ENVIO_TOKEN) return null;
  try {
    const { getMeBalance } = await import("@/lib/melhor-envio");
    const res = await getMeBalance();
    return Number(res.balance ?? 0);
  } catch {
    return null;
  }
}
