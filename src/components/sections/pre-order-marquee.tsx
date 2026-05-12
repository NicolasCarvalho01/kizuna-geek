import * as React from "react";
import { Marquee } from "@/components/brand/marquee";

/**
 * Faixa de tickers anunciando pré-vendas e lançamentos.
 * Estilo magazine — texto em Cormorant Italic, separadores em ponto kana ・
 */
const ITEMS = [
  { jp: "予約", pt: "Pré-venda · Pokémon S&V 151 · Lança 17/jul" },
  { jp: "新作", pt: "Lançamento · S.H. Figuarts Luffy Gear 5" },
  { jp: "限定", pt: "Edição limitada · Saitama Resin 1/6" },
  { jp: "予約", pt: "Pré-venda · One Piece TCG OP-01 · Lança 02/ago" },
  { jp: "稀少", pt: "Raro · Charizard Base Set Holo · 1 disponível" },
  { jp: "新作", pt: "Lançamento · Nendoroid Naruto Uzumaki" },
];

export function PreOrderMarquee() {
  const tickerItems = ITEMS.map((it, i) => (
    <span
      key={i}
      className="inline-flex items-center gap-3 whitespace-nowrap font-[var(--font-display)] italic text-[1.25rem] leading-none text-[color:var(--color-gold-ink)] dark:text-[color:var(--color-cream)]"
    >
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[0.875rem] not-italic font-medium tracking-[0.1em] text-[color:var(--color-gold-deep)] dark:text-[color:var(--color-gold)] uppercase"
      >
        {it.jp}
      </span>
      <span aria-hidden className="h-px w-5 bg-current opacity-30" />
      {it.pt}
    </span>
  ));

  return (
    <section
      aria-label="Pré-vendas e lançamentos em destaque"
      className="relative isolate bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] py-5"
    >
      {/* Linhas decorativas top/bottom */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[color:var(--color-gold-deep)]/30" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[color:var(--color-gold-deep)]/30" />

      <Marquee
        items={tickerItems}
        duration={42}
        separator={
          <span aria-hidden className="font-[var(--font-jp)] text-[1.5rem] leading-none mx-7 text-[color:var(--color-gold-deep)]/60">
            ・
          </span>
        }
      />
    </section>
  );
}
