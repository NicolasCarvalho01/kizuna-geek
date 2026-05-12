import { Suspense } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductCard } from "@/components/catalog/product-card";
import { FilterPanel, ActiveFiltersBar } from "@/components/catalog/filter-panel";
import { SortBar } from "@/components/catalog/sort-bar";
import { Pagination } from "@/components/catalog/pagination";
import { listProducts, getFilterFacets, type ListOptions, type SortKey } from "@/server/queries/products";
import { getCategoryBySlug } from "@/server/queries/categories";
import type { TcgLanguage, TcgCondition } from "@prisma/client";

export const metadata = {
  title: "Catálogo",
  description: "Explore Action Figures, Colecionáveis e TCG da Kizuna Geek.",
};

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params?: Promise<{ category?: string }>;
}

function parseSort(v: string | undefined): SortKey {
  const allowed: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "name-asc"];
  return (allowed as string[]).includes(v ?? "") ? (v as SortKey) : "featured";
}

function asArr(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export default async function CatalogPage({ searchParams, params }: CatalogPageProps) {
  const sp = await searchParams;
  const p = params ? await params : undefined;

  const categorySlug = p?.category;
  const category = categorySlug ? await getCategoryBySlug(categorySlug) : null;

  const opts: ListOptions = {
    category: categorySlug ?? undefined,
    q: typeof sp.q === "string" ? sp.q : undefined,
    franchise: asArr(sp.franchise)[0],
    brand: asArr(sp.brand)[0],
    preorderOnly: sp.preorder === "true",
    inStock: sp.inStock === "true",
    tcgLanguage: asArr(sp.tcgLang) as TcgLanguage[],
    tcgCondition: asArr(sp.tcgCond) as TcgCondition[],
    tcgFoilOnly: sp.tcgFoil === "true",
    figureHasBox: sp.hasBox === "true" ? true : sp.noBox === "true" ? false : undefined,
    minPrice: Number(sp.minPrice) || undefined,
    maxPrice: Number(sp.maxPrice) || undefined,
    sort: parseSort(typeof sp.sort === "string" ? sp.sort : undefined),
    page: Number(sp.page) || 1,
    perPage: 12,
  };

  const [{ products, total, page, perPage, totalPages }, facets] = await Promise.all([
    listProducts(opts),
    getFilterFacets(categorySlug),
  ]);

  return (
    <>
      {/* Header editorial da listagem */}
      <section className="wrap pt-16 lg:pt-24 pb-10">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow index={category ? "02" : "02"}>
              {category ? "Capítulo · Categoria" : "Catálogo completo"}
            </Eyebrow>
            <h1 className="display mt-5 text-[clamp(2.5rem,6vw,5rem)]">
              {category ? (
                <>
                  {category.name}{" "}
                  <em className="display-italic text-[color:var(--color-gold)]">
                    {category.type === "TCG" ? "・ TCG" : ""}
                  </em>
                </>
              ) : (
                <>
                  Toda a <em className="display-italic text-[color:var(--color-gold)]">curadoria</em>{" "}
                  em um lugar.
                </>
              )}
            </h1>
            {category?.description && (
              <p className="mt-5 max-w-2xl text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="wrap pb-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-10 lg:gap-12">
          {/* Filtros */}
          <Suspense fallback={<aside className="hidden lg:block" aria-hidden />}>
            <FilterPanel facets={facets} categoryType={category?.type} />
          </Suspense>

          {/* Grid */}
          <div>
            <Suspense fallback={null}>
              <ActiveFiltersBar />
            </Suspense>

            <Suspense fallback={null}>
              <SortBar total={total} page={page} perPage={perPage} />
            </Suspense>

            {products.length === 0 ? (
              <EmptyResults />
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
                {products.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} variant="compact" priority={i < 3} />
                  </li>
                ))}
              </ul>
            )}

            <Suspense fallback={null}>
              <Pagination page={page} totalPages={totalPages} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyResults() {
  return (
    <div className="py-20 text-center">
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[5rem] leading-none font-black text-[color:var(--color-gold)]/40"
      >
        無
      </span>
      <h2 className="display text-[1.875rem] mt-6">Nada encontrado</h2>
      <p className="mt-3 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] max-w-md mx-auto">
        Nenhum produto bate com os filtros atuais. Tente afrouxar os critérios ou{" "}
        <Link href="/catalogo" className="text-[color:var(--color-gold)] underline underline-offset-2">
          limpar todos os filtros
        </Link>
        .
      </p>
    </div>
  );
}
