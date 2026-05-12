import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { formatBRL, cn } from "@/lib/utils";
import type { Product } from "@/server/queries/products";

interface EditorialPicksProps {
  products: ReadonlyArray<Product>;
}

function pickBadge(p: Product): { label: string; tone: "gold" | "soft" | "vermilion" } | null {
  if (p.isPreOrder) return { label: "Pré-venda", tone: "gold" };
  if (p.tags.some((t) => t.slug === "raro")) return { label: "Raro", tone: "vermilion" };
  if (p.tags.some((t) => t.slug === "lancamento")) return { label: "Lançamento", tone: "soft" };
  if (p.tags.some((t) => t.slug === "promocao")) return { label: "Promoção", tone: "soft" };
  return null;
}

function fromPrice(product: Product): { price: number; compareAt: number | null } {
  const minVariantPrice = Math.min(
    ...product.variants.map((v) => v.priceOverride ?? product.basePrice),
  );
  return { price: minVariantPrice, compareAt: product.compareAtPrice };
}

export function EditorialPicks({ products }: EditorialPicksProps) {
  if (products.length === 0) return null;

  return (
    <section className="wrap py-24 lg:py-32 relative">
      {/* Cabeçalho */}
      <div className="grid grid-cols-12 gap-6 mb-12 lg:mb-16">
        <div className="col-span-12 lg:col-span-7">
          <Eyebrow index="03">Curadoria</Eyebrow>
          <h2 className="display mt-5 text-[clamp(2.25rem,4.5vw,3.75rem)]">
            Os <em className="display-italic text-[color:var(--color-gold)]">picks</em>{" "}
            desta edição.
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-4 lg:col-start-9 self-end">
          <p className="text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)] max-w-sm">
            Selecionados pelo time da Kizuna entre todos os itens em estoque.
            Trocamos os destaques toda semana.
          </p>
        </div>
      </div>

      {/* Grid editorial — alternância de aspect ratio */}
      <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-16 md:gap-y-24">
        {products.map((pick, i) => {
          const { price, compareAt } = fromPrice(pick);
          const image = pick.images.find((img) => img.isPrimary) ?? pick.images[0];
          const badge = pickBadge(pick);
          const rank = String(i + 1).padStart(2, "0");

          return (
            <li
              key={pick.id}
              className={cn(i % 2 === 1 && "md:mt-16 lg:mt-24")}
            >
              <Link href={`/produto/${pick.slug}`} className="group block">
                {/* Cabeçalho: número + franchise */}
                <div className="flex items-baseline justify-between mb-4">
                  <span className="font-[var(--font-display)] italic text-[clamp(3rem,6vw,4.5rem)] font-light leading-none text-[color:var(--color-gold)] tabular-nums">
                    {rank}
                  </span>
                  {pick.franchise && <span className="eyebrow">{pick.franchise}</span>}
                </div>

                {/* Imagem */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-bg-sunken)]">
                  {image && (
                    <Image
                      src={image.url}
                      alt={image.altText ?? pick.name}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-[var(--motion-slowest)] ease-[var(--ease-out-5)] group-hover:scale-[1.04]"
                    />
                  )}
                  {badge && (
                    <div className="absolute top-4 left-4">
                      <Badge variant={badge.tone} size="lg">
                        {badge.label}
                      </Badge>
                    </div>
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-0 right-0 h-12 w-px bg-[color:var(--color-gold)]/0",
                      "transition-all duration-[var(--motion-slow)] ease-[var(--ease-out-5)]",
                      "group-hover:bg-[color:var(--color-gold)] group-hover:h-20",
                    )}
                  />
                </div>

                {/* Meta */}
                <div className="mt-6 grid grid-cols-12 gap-4">
                  <div className="col-span-12 md:col-span-8">
                    <h3 className="display text-[clamp(1.5rem,2.5vw,2rem)]">
                      {pick.name}
                    </h3>
                    {pick.shortDescription && (
                      <p className="mt-2 text-[var(--text-caption)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)] max-w-md line-clamp-2">
                        {pick.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-4 flex md:justify-end items-start">
                    <div className="text-left md:text-right">
                      <p className="font-[var(--font-mono)] text-[0.875rem] font-medium text-[color:var(--color-fg)]">
                        {formatBRL(price)}
                      </p>
                      {compareAt && compareAt > price && (
                        <p className="font-[var(--font-mono)] text-[var(--text-eyebrow)] text-[color:var(--color-fg-mute)] line-through mt-0.5">
                          {formatBRL(compareAt)}
                        </p>
                      )}
                      <span
                        className={cn(
                          "mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] text-[color:var(--color-gold)]",
                          "transition-transform duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
                          "group-hover:translate-x-1",
                        )}
                      >
                        Ver peça
                        <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Footnote / link pro catálogo */}
      <div className="mt-20 pt-10 border-t border-[color:var(--color-hairline)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="eyebrow">Atualizado toda quarta-feira</p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-[var(--text-body)] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
        >
          Ver o catálogo completo
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}
