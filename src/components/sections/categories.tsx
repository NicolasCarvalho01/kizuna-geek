import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    slug: "action-figures",
    title: "Action Figures",
    jp: "アクションフィギュア",
    teaser:
      "Articuladas, em escala, com caixa original ou loose. De Bandai a Good Smile Company.",
    count: "320+ peças",
    bg: "https://picsum.photos/seed/cat-fig-kg/900/1200",
    span: "md:col-span-7 md:row-span-2",
    accent: "01",
  },
  {
    slug: "tcg",
    title: "TCG",
    jp: "トレーディングカード",
    teaser:
      "Pokémon, Magic, Yu-Gi-Oh!, One Piece — singles raros e selados com proveniência.",
    count: "680+ cartas",
    bg: "https://picsum.photos/seed/cat-tcg-kg/900/700",
    span: "md:col-span-5",
    accent: "02",
  },
  {
    slug: "colecionaveis",
    title: "Colecionáveis",
    jp: "コレクタブル",
    teaser:
      "Estátuas em resina, Nendoroids, Funkos numerados e exclusivos importados.",
    count: "400+ itens",
    bg: "https://picsum.photos/seed/cat-col-kg/900/700",
    span: "md:col-span-5",
    accent: "03",
  },
];

export function Categories() {
  return (
    <section className="wrap py-24 lg:py-32">
      {/* Cabeçalho de seção */}
      <div className="grid grid-cols-12 gap-6 mb-12 lg:mb-16">
        <div className="col-span-12 lg:col-span-5">
          <Eyebrow index="02">Catálogo</Eyebrow>
          <h2 className="display mt-5 text-[clamp(2.25rem,4.5vw,3.75rem)]">
            Três <em className="display-italic text-[color:var(--color-gold)]">capítulos</em>,
            uma só obsessão.
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8 self-end">
          <p className="text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)] max-w-md">
            Cada categoria é curada com critérios próprios. Action figures pela
            referência industrial; TCG pela proveniência; colecionáveis pela
            unicidade. Sem ruído de marketplace.
          </p>
        </div>
      </div>

      {/* Mosaico assimétrico (12-col grid, 2 rows) */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:auto-rows-[minmax(280px,38vh)] gap-3 lg:gap-4">
        {CATEGORIES.map((cat, idx) => (
          <Link
            key={cat.slug}
            href={`/catalogo/${cat.slug}`}
            className={cn(
              "group relative overflow-hidden",
              "rounded-[var(--radius-lg)]",
              "isolate",
              "transition-shadow duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
              "hover:shadow-[var(--shadow-3)]",
              cat.span,
            )}
            style={{ "--i": idx } as React.CSSProperties}
          >
            {/* Background image */}
            <div
              aria-hidden
              className={cn(
                "absolute inset-0",
                "bg-cover bg-center",
                "transition-transform duration-[var(--motion-slowest)] ease-[var(--ease-out-5)]",
                "group-hover:scale-[1.04]",
              )}
              style={{ backgroundImage: `url(${cat.bg})` }}
            />

            {/* Vinheta editorial — cool/warm gradient pra legibilidade */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-navy-deep)]/85 via-[color:var(--color-navy-deep)]/30 to-transparent"
            />
            <div
              aria-hidden
              className="absolute inset-0 ring-1 ring-inset ring-[color:var(--color-cream)]/10 rounded-[inherit]"
            />

            {/* Conteúdo */}
            <div className="relative h-full p-6 lg:p-8 flex flex-col text-[color:var(--color-cream)]">
              <div className="flex items-start justify-between">
                <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-gold)]">
                  {`/ ${cat.accent}`}
                </span>
                <span
                  aria-hidden
                  className="font-[var(--font-jp)] text-[0.75rem] tracking-widest opacity-70"
                >
                  {cat.jp}
                </span>
              </div>

              <div className="mt-auto">
                <h3 className="display text-[clamp(1.75rem,3vw,2.75rem)] text-[color:var(--color-cream)]">
                  {cat.title}
                </h3>
                <p className="mt-3 max-w-md text-[var(--text-caption)] leading-[var(--leading-relaxed)] text-[color:var(--color-cream)]/80">
                  {cat.teaser}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-[var(--font-mono)] text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-cream)]/60">
                    {cat.count}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 text-[var(--text-caption)] font-medium",
                      "text-[color:var(--color-gold)]",
                      "transition-transform duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
                      "group-hover:translate-x-1",
                    )}
                  >
                    Ver categoria
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
