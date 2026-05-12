import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Gallery } from "@/components/product/gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/catalog/product-card";
import { getProductBySlug, getRelatedProducts } from "@/server/queries/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto" };
  return {
    title: product.name,
    description:
      product.shortDescription ??
      `${product.name} — ${product.franchise ?? "Kizuna Geek"}.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images.slice(0, 1).map((i) => ({ url: i.url, alt: i.altText ?? "" })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, 4);

  return (
    <>
      {/* Breadcrumb */}
      <nav
        aria-label="Trilha"
        className="wrap pt-8 pb-3 flex items-center gap-2 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-soft)]"
      >
        <Link href="/" className="hover:text-[color:var(--color-gold)] transition-colors">
          Início
        </Link>
        <ChevronRight className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        <Link
          href={`/catalogo/${product.category.slug.split("-")[0]}`}
          className="hover:text-[color:var(--color-gold)] transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        <span aria-current="page" className="text-[color:var(--color-fg)] truncate max-w-[40ch]">
          {product.name}
        </span>
      </nav>

      {/* Detalhe principal */}
      <section className="wrap pt-6 pb-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <Gallery images={product.images} productName={product.name} />
          <ProductActions product={product} />
        </div>
      </section>

      {/* Descrição longa */}
      {product.description && (
        <section className="wrap py-16 lg:py-24 border-t border-[color:var(--color-hairline)]">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <Eyebrow index="—">Descrição</Eyebrow>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-5">
              <p className="text-[var(--text-lead)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg)]">
                {product.description}
              </p>

              {/* Specs grid */}
              <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 pt-8 border-t border-[color:var(--color-hairline)]">
                {product.brand && (
                  <Spec label="Marca" value={product.brand} />
                )}
                {product.franchise && (
                  <Spec label="Franquia" value={product.franchise} />
                )}
                <Spec label="SKU" value={product.sku} />
                <Spec label="Peso" value={`${product.weight} g`} />
                <Spec
                  label="Dimensões"
                  value={`${product.dimensions.length}×${product.dimensions.width}×${product.dimensions.height} cm`}
                />
                {product.tags.length > 0 && (
                  <Spec label="Tags" value={product.tags.map((t) => t.name).join(" · ")} />
                )}
              </dl>
            </div>
          </div>
        </section>
      )}

      {/* Produtos relacionados */}
      {related.length > 0 && (
        <section className="wrap py-16 lg:py-24 border-t border-[color:var(--color-hairline)]">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Eyebrow index="—">Continue explorando</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.875rem,3.5vw,2.75rem)]">
                Da mesma coleção
              </h2>
            </div>
            <Link
              href={`/catalogo/${product.category.slug.split("-")[0]}`}
              className="hidden sm:inline-flex items-center gap-2 text-[0.875rem] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              Voltar para {product.category.name}
            </Link>
          </div>
          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow mb-1.5">{label}</dt>
      <dd className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)]">
        {value}
      </dd>
    </div>
  );
}
