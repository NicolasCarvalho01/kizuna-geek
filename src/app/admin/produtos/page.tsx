import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { formatBRL, formatDate, cn } from "@/lib/utils";
import type { ProductStatus } from "@prisma/client";

export const metadata = { title: "Produtos · Admin" };

const USE_DB = !!process.env.DATABASE_URL;
const PER_PAGE = 24;

const STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  ARCHIVED: "Arquivado",
};

const STATUS_TONE: Record<ProductStatus, "soft" | "gold" | "vermilion"> = {
  DRAFT: "soft",
  ACTIVE: "gold",
  ARCHIVED: "vermilion",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    filter?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const status = sp.status as ProductStatus | undefined;
  const lowStockOnly = sp.filter === "low-stock";

  if (!USE_DB) {
    return <DemoMode />;
  }

  const { prisma } = await import("@/lib/prisma");

  const where: Parameters<typeof prisma.product.findMany>[0] = {
    where: {
      deletedAt: null,
      ...(status && { status }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { franchise: { contains: q, mode: "insensitive" } },
        ],
      }),
      ...(lowStockOnly && {
        variants: { some: { stock: { lt: 5 }, isActive: true } },
      }),
    },
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where: where.where }),
    prisma.product.findMany({
      ...where,
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
        variants: { select: { stock: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow index="—">Catálogo</Eyebrow>
          <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">
            Produtos
          </h1>
          <p className="mt-2 eyebrow">
            {total} {total === 1 ? "produto cadastrado" : "produtos cadastrados"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo produto
          </Link>
        </Button>
      </header>

      {/* Filtros */}
      <form action="/admin/produtos" className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[14rem] max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-fg-mute)] pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Busca por nome, SKU, marca, franquia…"
            className="pl-9 h-10"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 px-3 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-transparent text-[0.875rem]"
        >
          <option value="">Todos status</option>
          <option value="DRAFT">Rascunho</option>
          <option value="ACTIVE">Ativo</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
        <Button type="submit" variant="outline" size="md">
          Aplicar
        </Button>
        {(q || status || lowStockOnly) && (
          <Link
            href="/admin/produtos"
            className="text-[var(--text-caption)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-vermilion)] transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[color:var(--color-bg-elevated)] border-b border-[color:var(--color-hairline)]">
              <tr className="text-left">
                <Th>Produto</Th>
                <Th>Categoria</Th>
                <Th>Preço</Th>
                <Th>Estoque</Th>
                <Th>Status</Th>
                <Th>Criado</Th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-hairline)]">
              {products.map((p) => {
                const totalStock = p.variants.reduce((a, v) => a + v.stock, 0);
                const image = p.images[0];
                const lowStock = totalStock <= 3;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[color:var(--color-bg-elevated)]/50 transition-colors"
                  >
                    <Td>
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="flex items-center gap-3 group min-w-0"
                      >
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[color:var(--color-bg-sunken)]">
                          {image && (
                            <Image
                              src={image.url}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.875rem] font-medium text-[color:var(--color-fg)] group-hover:text-[color:var(--color-gold)] transition-colors truncate">
                            {p.name}
                          </p>
                          <p className="eyebrow truncate">
                            {p.sku}
                            {p._count.variants > 1 &&
                              ` · ${p._count.variants} variantes`}
                            {p.isPreOrder && " · pré-venda"}
                          </p>
                        </div>
                      </Link>
                    </Td>
                    <Td>
                      <span className="text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        {p.category.name}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-[var(--font-mono)] text-[0.8125rem]">
                        {formatBRL(Number(p.basePrice))}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          "font-[var(--font-mono)] text-[0.8125rem]",
                          lowStock && "text-[color:var(--color-vermilion)]",
                        )}
                      >
                        {totalStock} un.
                      </span>
                    </Td>
                    <Td>
                      <Badge variant={STATUS_TONE[p.status]} size="sm">
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    </Td>
                    <Td>
                      <span className="eyebrow whitespace-nowrap">
                        {formatDate(p.createdAt)}
                      </span>
                    </Td>
                    <Td>
                      <ProductRowActions
                        productId={p.id}
                        productName={p.name}
                        currentStatus={p.status}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-center gap-2"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/produtos?${new URLSearchParams({
                ...(q && { q }),
                ...(status && { status }),
                ...(lowStockOnly && { filter: "low-stock" }),
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

function EmptyState() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-12 text-center">
      <h2 className="display text-[1.5rem]">Nenhum produto encontrado</h2>
      <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
        Ajuste os filtros ou cadastre o primeiro produto.
      </p>
      <Button asChild className="mt-5">
        <Link href="/admin/produtos/novo">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Cadastrar produto
        </Link>
      </Button>
    </div>
  );
}

function DemoMode() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
      <h2 className="display text-[1.5rem]">Modo demo</h2>
      <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
        CRUD de produtos exige Supabase configurado.
      </p>
    </div>
  );
}
