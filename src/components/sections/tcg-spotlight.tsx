import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { formatBRL, cn } from "@/lib/utils";
import type { Product } from "@/server/queries/products";

interface TcgSpotlightProps {
  products: ReadonlyArray<Product>;
}

const COND_SHORT = {
  MINT: "M", NEAR_MINT: "NM", LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP", HEAVILY_PLAYED: "HP", DAMAGED: "DMG",
} as const;

export function TcgSpotlight({ products }: TcgSpotlightProps) {
  if (products.length === 0) return null;

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[color:var(--color-navy-deep)]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background:radial-gradient(80%_60%_at_50%_30%,color-mix(in_oklab,var(--color-gold)_18%,transparent),transparent_70%)]"
      />

      <div className="wrap text-[color:var(--color-cream)]">
        <div className="grid grid-cols-12 gap-6 mb-12 lg:mb-16">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow index="04" className="text-[color:var(--color-gold)]">
              TCG · Trading Card Games
            </Eyebrow>
            <h2 className="display mt-5 text-[clamp(2.25rem,5vw,4rem)]">
              Cartas com <em className="display-italic text-[color:var(--color-gold)]">proveniência</em>.
              <br />
              Não com expectativa.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 self-end">
            <p className="text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-cream)]/70 max-w-md">
              Cada single passa por avaliação manual de condição. Selados ficam
              em sleeve com certificado interno. Sem surpresas.
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((card, i) => {
            const firstVariant = card.variants[0];
            const image = card.images.find((img) => img.isPrimary) ?? card.images[0];
            const price = Math.min(
              ...card.variants.map((v) => v.priceOverride ?? card.basePrice),
            );
            const isFoil = card.variants.some((v) => v.tcgIsFoil);
            const lang = firstVariant?.tcgLanguage ?? "—";
            const condition = firstVariant?.tcgCondition;
            const set = firstVariant?.tcgEdition ?? "";

            return (
              <li key={card.id}>
                <Link
                  href={`/produto/${card.slug}`}
                  className={cn(
                    "group block relative isolate",
                    "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-out-5)]",
                    "hover:-translate-y-2",
                  )}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <div className="relative aspect-[5/7] overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-navy)]">
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.altText ?? card.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-[var(--motion-slowest)] ease-[var(--ease-out-5)] group-hover:scale-105"
                      />
                    )}

                    {isFoil && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-0 pointer-events-none opacity-0",
                          "transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-out-3)]",
                          "group-hover:opacity-100",
                          "[background:linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.4)_40%,rgba(181,148,88,0.55)_50%,rgba(255,255,255,0.4)_60%,transparent_80%)]",
                          "[background-size:300%_300%]",
                          "[animation:holo_3s_var(--ease-io-3)_infinite]",
                          "mix-blend-screen",
                        )}
                      />
                    )}

                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-0 rounded-[var(--radius-md)] pointer-events-none",
                        "ring-1 ring-inset ring-[color:var(--color-cream)]/10",
                        "transition-all duration-[var(--motion-slow)] ease-[var(--ease-out-3)]",
                        "group-hover:ring-[color:var(--color-gold)] group-hover:shadow-[0_0_40px_-8px_rgba(181,148,88,0.55)]",
                      )}
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {condition && (
                        <Badge variant="goldSolid" size="sm">
                          {COND_SHORT[condition]}
                        </Badge>
                      )}
                      {isFoil && (
                        <Badge
                          variant="gold"
                          size="sm"
                          className="bg-[color:var(--color-navy)]/60 backdrop-blur"
                        >
                          Foil
                        </Badge>
                      )}
                    </div>

                    <span className="absolute top-3 right-3 font-[var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-cream)]/70 px-2 py-0.5 rounded-sm bg-[color:var(--color-navy)]/60 backdrop-blur">
                      {lang}
                    </span>
                  </div>

                  <div className="mt-4">
                    {set && (
                      <p className="eyebrow text-[color:var(--color-gold)]/80">
                        {set}
                      </p>
                    )}
                    <h3 className="mt-1.5 font-[var(--font-display)] text-[1.25rem] leading-snug text-[color:var(--color-cream)]">
                      {card.name}
                    </h3>
                    <p className="mt-2 font-[var(--font-mono)] text-[0.8125rem] text-[color:var(--color-gold)]">
                      {formatBRL(price)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-16 pt-10 border-t border-[color:var(--color-cream)]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="eyebrow text-[color:var(--color-cream)]/60">
            Destaques de centenas de cartas em estoque
          </p>
          <Link
            href="/catalogo/tcg"
            className="inline-flex items-center gap-2 text-[var(--text-body)] text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)] transition-colors"
          >
            Ver todas as cartas
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes holo {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}
