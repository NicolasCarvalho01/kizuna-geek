import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductCard } from "@/components/catalog/product-card";
import { listProducts, getPreOrderProducts } from "@/server/queries/products";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lançamentos",
  description:
    "Peças novas no catálogo da Kizuna Geek — Action Figures, Colecionáveis e TCG selecionados das últimas semanas.",
};

export default async function LancamentosPage() {
  const [{ products: recent }, preorders] = await Promise.all([
    listProducts({ sort: "newest", perPage: 18 }),
    getPreOrderProducts(6),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative pt-20 lg:pt-32 pb-12 overflow-hidden isolate">
        <span
          aria-hidden
          className="absolute top-10 right-[-3rem] lg:right-[-4rem] font-[var(--font-jp)] text-[18rem] lg:text-[28rem] leading-none font-black text-[color:var(--color-gold)]/[0.08] select-none pointer-events-none"
        >
          新
        </span>

        <div className="wrap relative">
          <Eyebrow index="—">Lançamentos · 新着</Eyebrow>
          <h1
            className={cn(
              "display mt-4",
              "text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]",
              "max-w-[18ch]",
            )}
          >
            O que entrou no{" "}
            <em className="display-italic text-[color:var(--color-gold)]">catálogo</em>{" "}
            recentemente.
          </h1>
          <p className="mt-8 max-w-2xl text-[var(--text-lead)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
            Tudo novo aqui — peças que chegaram no nosso estoque ou estão em
            pré-venda. Atualizado em tempo real conforme curamos novidades.
          </p>
        </div>
      </section>

      {/* PRÉ-VENDAS EM DESTAQUE */}
      {preorders.length > 0 && (
        <section className="py-16 lg:py-20 border-t border-[color:var(--color-hairline)]">
          <div className="wrap">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-gold)]" strokeWidth={1.5} />
                  <Eyebrow>Pré-venda · 予約</Eyebrow>
                </div>
                <h2 className="display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight">
                  Garante antes que <em className="display-italic text-[color:var(--color-gold)]">esgote</em>
                </h2>
              </div>
              <Link
                href="/pre-venda"
                className="inline-flex items-center gap-1.5 text-[var(--text-caption)] text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)] transition-colors"
              >
                Como funciona pré-venda
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>

            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {preorders.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* MAIS RECENTES NO CATÁLOGO */}
      <section className="py-16 lg:py-24 border-t border-[color:var(--color-hairline)]">
        <div className="wrap">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <Eyebrow index="—">Catálogo · mais novos</Eyebrow>
              <h2 className="display mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight">
                Última{" "}
                <em className="display-italic text-[color:var(--color-gold)]">curadoria</em>
              </h2>
            </div>
            <Link
              href="/catalogo?sort=newest"
              className="inline-flex items-center gap-1.5 text-[var(--text-caption)] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
            >
              Ver catálogo completo
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="text-[color:var(--color-fg-soft)] py-12 text-center">
              Sem novidades cadastradas ainda — em breve!
            </p>
          ) : (
            <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
              {recent.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} variant="compact" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA newsletter */}
      <section className="py-16 lg:py-24 border-t border-[color:var(--color-hairline)] bg-[color:var(--color-bg-sunken)]">
        <div className="wrap text-center max-w-2xl mx-auto">
          <Eyebrow>Newsletter · 通信</Eyebrow>
          <h2 className="display mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight">
            Quer saber dos{" "}
            <em className="display-italic text-[color:var(--color-gold)]">lançamentos</em>{" "}
            antes?
          </h2>
          <p className="mt-5 text-[var(--text-body)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
            Assine a newsletter pra receber pré-vendas com 48h de prioridade,
            lançamentos selecionados e cupons exclusivos.
          </p>
          <Link
            href="/newsletter"
            className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] font-[var(--font-display)] hover:bg-[color:var(--color-gold)]/90 transition-colors"
          >
            Assinar newsletter
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </>
  );
}
