import Link from "next/link";
import Image from "next/image";
import { Calendar, Package } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDate, cn } from "@/lib/utils";

export const metadata = { title: "Pré-vendas · Admin" };

const USE_DB = !!process.env.DATABASE_URL;

export default async function AdminPreOrdersPage() {
  if (!USE_DB) {
    return <div className="rounded-[var(--radius-lg)] border border-dashed p-10 text-center">Modo demo.</div>;
  }

  const { prisma } = await import("@/lib/prisma");

  // Produtos em pré-venda + pedidos vinculados (paid awaiting_release)
  const products = await prisma.product.findMany({
    where: { isPreOrder: true, deletedAt: null, status: "ACTIVE" },
    orderBy: [{ releaseDate: "asc" }, { createdAt: "desc" }],
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: { select: { stock: true } },
      category: { select: { name: true } },
    },
  });

  // Contar pedidos em AWAITING_RELEASE por produto
  const orderItems = await prisma.orderItem.findMany({
    where: {
      isPreOrder: true,
      order: {
        status: "AWAITING_RELEASE",
      },
    },
    select: {
      quantity: true,
      productVariant: { select: { productId: true } },
    },
  });

  const reservedByProduct = new Map<string, number>();
  for (const item of orderItems) {
    const pid = item.productVariant.productId;
    reservedByProduct.set(pid, (reservedByProduct.get(pid) ?? 0) + item.quantity);
  }

  const now = new Date();

  return (
    <div className="space-y-8">
      <header>
        <Eyebrow index="—">Operação · pré-vendas</Eyebrow>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">
          Pré-vendas{" "}
          <em className="display-italic text-[color:var(--color-gold)]">ativas</em>
        </h1>
        <p className="mt-2 eyebrow">
          {products.length} {products.length === 1 ? "produto" : "produtos"} em pré-venda
        </p>
      </header>

      {products.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
          <Calendar className="h-7 w-7 mx-auto text-[color:var(--color-gold)]/60" strokeWidth={1.5} />
          <p className="mt-4 text-[color:var(--color-fg-soft)]">
            Sem pré-vendas ativas no momento.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {products.map((p) => {
            const reserved = reservedByProduct.get(p.id) ?? 0;
            const totalStock = p.variants.reduce((a, v) => a + v.stock, 0);
            const releaseDate = p.releaseDate;
            const daysUntil = releaseDate
              ? Math.ceil(
                  (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                )
              : null;
            const released = releaseDate && releaseDate <= now;
            const image = p.images[0];

            return (
              <li key={p.id}>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="block rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5 hover:border-[color:var(--color-gold)] transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]">
                      {image && (
                        <Image
                          src={image.url}
                          alt={p.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="eyebrow">{p.category.name}</p>
                      <p className="mt-1 font-[var(--font-display)] text-[1.125rem] leading-snug">
                        {p.name}
                      </p>
                      <p className="mt-1 font-[var(--font-mono)] text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        {formatBRL(Number(p.basePrice))} · SKU {p.sku}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <Stat
                          label="Reservados"
                          value={reserved.toString()}
                          tone={reserved > 0 ? "gold" : "default"}
                        />
                        <Stat label="Estoque" value={`${totalStock}`} />
                        <Stat
                          label="Lançamento"
                          value={
                            !releaseDate
                              ? "—"
                              : released
                                ? "🚀 Hoje"
                                : `${daysUntil}d`
                          }
                          tone={
                            !releaseDate
                              ? "default"
                              : released
                                ? "gold"
                                : daysUntil! < 7
                                  ? "vermilion"
                                  : "default"
                          }
                        />
                      </div>

                      {releaseDate && (
                        <p className="mt-3 eyebrow">
                          {released ? "Liberada em " : "Lança em "}
                          {formatDate(releaseDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Alerta de ação */}
                  {released && reserved > 0 && (
                    <div className="mt-4 pt-4 border-t border-[color:var(--color-hairline)]">
                      <Badge variant="gold" size="sm">
                        ⚡ {reserved} pedido(s) prontos pra postar — gerar etiquetas
                      </Badge>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold" | "vermilion";
}) {
  return (
    <div>
      <p
        className={cn(
          "font-[var(--font-display)] text-[1.25rem] leading-none",
          tone === "gold" && "text-[color:var(--color-gold)]",
          tone === "vermilion" && "text-[color:var(--color-vermilion)]",
        )}
      >
        {value}
      </p>
      <p className="eyebrow mt-1">{label}</p>
    </div>
  );
}
