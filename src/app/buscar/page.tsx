import { Suspense } from "react";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchHero } from "@/components/search/search-hero";
import { listProducts } from "@/server/queries/products";

export const metadata = {
  title: "Busca",
  description: "Encontre Action Figures, Colecionáveis e TCG na Kizuna Geek.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query
    ? await listProducts({ q: query, perPage: 24, sort: "featured" })
    : null;

  return (
    <>
      <section className="wrap pt-16 lg:pt-24 pb-10">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow index="—">Busca</Eyebrow>
            <h1 className="display mt-5 text-[clamp(2.5rem,6vw,5rem)]">
              {query ? (
                <>
                  Resultados para{" "}
                  <em className="display-italic text-[color:var(--color-gold)]">
                    &ldquo;{query}&rdquo;
                  </em>
                </>
              ) : (
                <>
                  O que você está{" "}
                  <em className="display-italic text-[color:var(--color-gold)]">
                    procurando
                  </em>
                  ?
                </>
              )}
            </h1>
          </div>
        </div>

        <div className="mt-10 max-w-2xl">
          <Suspense fallback={null}>
            <SearchHero defaultValue={query} />
          </Suspense>
        </div>
      </section>

      <section className="wrap pb-24 lg:pb-32">
        {!query ? (
          <EmptyHint />
        ) : results && results.products.length > 0 ? (
          <>
            <p className="eyebrow mb-8">
              {results.total} {results.total === 1 ? "resultado" : "resultados"} encontrados
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {results.products.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} variant="compact" priority={i < 4} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <NoResults query={query} />
        )}
      </section>
    </>
  );
}

function EmptyHint() {
  const suggestions = [
    "Pokémon",
    "One Piece",
    "Nendoroid",
    "Black Lotus",
    "Funko",
    "Pré-venda",
  ];

  return (
    <div className="mt-4 max-w-2xl">
      <p className="eyebrow mb-4">Sugestões</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Link
            key={s}
            href={`/buscar?q=${encodeURIComponent(s)}`}
            className="px-3.5 py-1.5 text-[0.8125rem] rounded-[var(--radius-pill)] border border-[color:var(--color-border)] text-[color:var(--color-fg-soft)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
          >
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="py-16 text-center">
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[5rem] leading-none font-black text-[color:var(--color-gold)]/40"
      >
        無
      </span>
      <h2 className="display text-[1.875rem] mt-6">
        Nada encontrado para &ldquo;{query}&rdquo;
      </h2>
      <p className="mt-3 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] max-w-md mx-auto leading-[var(--leading-relaxed)]">
        Tente termos mais curtos, sem acento, ou{" "}
        <Link href="/catalogo" className="text-[color:var(--color-gold)] underline underline-offset-2">
          explore o catálogo completo
        </Link>
        .
      </p>
    </div>
  );
}
