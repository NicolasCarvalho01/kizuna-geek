import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { KanjiKizuna } from "@/components/brand/kanji-kizuna";
import { cn } from "@/lib/utils";

/**
 * Hero editorial — Cap. 01 da revista Kizuna.
 *
 * Anatomia (12-col grid):
 *  - col 1-7: 絆 caligrafia real — 11 pinceladas desenhadas em sequência (KanjiVG)
 *             com bloom dourado no fim
 *  - col 8-12: eyebrow → display title → lead → CTAs
 *  - canto direito: vertical kana tagline 絆を集める
 */
export function Hero() {
  return (
    <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Aura dourada de fundo (luz suave atrás do kanji) */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10",
          "[background:radial-gradient(60%_50%_at_30%_45%,color-mix(in_oklab,var(--color-gold)_18%,transparent),transparent_65%)]",
          "dark:[background:radial-gradient(60%_50%_at_30%_45%,color-mix(in_oklab,var(--color-gold)_22%,transparent),transparent_70%)]",
        )}
      />

      <div className="wrap grid grid-cols-12 gap-6 relative">
        {/* Caption editorial — coluna lateral esquerda, vertical */}
        <div className="hidden lg:flex col-span-1 flex-col items-start gap-6 pt-4">
          <span className="eyebrow rotate-180 [writing-mode:vertical-rl]">
            Curadoria 2026 · Edição de inverno
          </span>
        </div>

        {/* Kanji massive — caligrafia desenhada traço a traço */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-2 relative flex items-start justify-center">
          <KanjiKizuna
            className={cn(
              "block select-none",
              "w-[clamp(13rem,30vw,28rem)] h-[clamp(13rem,30vw,28rem)]",
            )}
            strokeWidth={7}
          />

          {/* Selo "Cap. 01" — sobreposto ao kanji, decorativo */}
          <span
            aria-hidden
            className={cn(
              "absolute -top-2 -left-2 sm:top-2 sm:left-2",
              "font-[var(--font-mono)] text-[10px] uppercase tracking-[var(--tracking-eyebrow)]",
              "text-[color:var(--color-fg-mute)]",
              "reveal",
            )}
            style={{ "--i": 5 } as React.CSSProperties}
          >
            Cap. 01 — Vitrine
          </span>

          {/* Marca d'água numérica */}
          <span
            aria-hidden
            className={cn(
              "absolute right-0 bottom-2",
              "font-[var(--font-mono)] text-[10px] tracking-widest",
              "text-[color:var(--color-fg-mute)]",
              "reveal",
            )}
            style={{ "--i": 8 } as React.CSSProperties}
          >
            01 / 06
          </span>
        </div>

        {/* Conteúdo principal */}
        <div className="col-span-12 lg:col-span-4 lg:col-start-9 flex flex-col gap-8 lg:pt-8">
          <Eyebrow index="01" className="reveal" style={{ "--i": 0 } as React.CSSProperties}>
            Vitrine · Outono / 26
          </Eyebrow>

          <h1
            className={cn(
              "display text-[clamp(2.75rem,5.4vw,4.75rem)]",
              "text-[color:var(--color-fg)]",
              "reveal",
            )}
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Action figures,{" "}
            <em className="display-italic text-[color:var(--color-gold)]">colecionáveis</em>{" "}
            e cartas raras — os{" "}
            <em className="display-italic">laços</em> que você guarda.
          </h1>

          <p
            className={cn(
              "max-w-md text-[var(--text-lead)] leading-[var(--leading-relaxed)]",
              "text-[color:var(--color-fg-soft)]",
              "reveal",
            )}
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Curadoria boutique de Itapetininga para todo o Brasil. Lançamentos,
            pré-vendas exclusivas e raridades selecionadas item a item.
          </p>

          <div
            className="flex flex-wrap items-center gap-3 reveal"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <Button asChild size="lg">
              <Link href="/catalogo">
                Explorar o catálogo
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pre-venda">Pré-vendas 2026</Link>
            </Button>
          </div>

          {/* Trio de selos editoriais */}
          <ul
            className={cn(
              "mt-2 grid grid-cols-3 gap-4 pt-7 border-t border-[color:var(--color-hairline)]",
              "reveal",
            )}
            style={{ "--i": 4 } as React.CSSProperties}
          >
            {[
              { kpi: "1.4k+", label: "Itens curados" },
              { kpi: "72h", label: "Despacho médio" },
              { kpi: "100%", label: "NF-e + rastreio" },
            ].map((stat) => (
              <li key={stat.label}>
                <p className="font-[var(--font-display)] text-[var(--text-h5)] leading-none text-[color:var(--color-fg)]">
                  {stat.kpi}
                </p>
                <p className="mt-1 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-fg-mute)]">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Tagline vertical kana — edge right */}
        <p
          aria-hidden
          className={cn(
            "vertical-jp absolute right-1 top-1/2 -translate-y-1/2",
            "text-[0.6875rem] text-[color:var(--color-fg-mute)]",
            "hidden xl:block",
          )}
        >
          絆を集める · Os laços que colecionamos
        </p>
      </div>

      {/* Scroll cue */}
      <div className="wrap mt-16 flex items-center justify-between text-[color:var(--color-fg-mute)]">
        <span className="eyebrow">Role para começar</span>
        <ChevronDown
          className="h-4 w-4 animate-[fade-in_1s_var(--ease-out-3)_forwards,bounce_2.5s_var(--ease-io-4)_2s_infinite]"
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="eyebrow tracking-[var(--tracking-eyebrow)]">06 capítulos abaixo</span>
      </div>

      {/* Keyframe local apenas pra o chevron bouncing */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </section>
  );
}
