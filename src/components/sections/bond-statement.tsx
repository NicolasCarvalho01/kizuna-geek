import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

/**
 * Brand statement — chapter dedicado a explicar o nome Kizuna (絆).
 * Anatomia editorial: pull quote em italic + decorações kana laterais.
 */
export function BondStatement() {
  return (
    <section className="py-24 lg:py-32 relative isolate overflow-hidden">
      {/* Faixa de fundo cream-deep / navy-fog */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[color:var(--color-bg-sunken)]"
      />

      <div className="wrap relative">
        {/* Sumi-e brushwork superior decorativo */}
        <span
          aria-hidden
          className="absolute -top-4 left-0 font-[var(--font-jp)] text-[8rem] lg:text-[14rem] leading-none font-black text-[color:var(--color-gold)]/10 select-none pointer-events-none"
        >
          絆
        </span>

        <div className="grid grid-cols-12 gap-6 relative">
          <div className="col-span-12 lg:col-span-2 pt-2">
            <Eyebrow index="05">Manifesto</Eyebrow>
          </div>

          <div className="col-span-12 lg:col-span-9 lg:col-start-3">
            <blockquote
              className={cn(
                "display text-[clamp(1.75rem,3.5vw,3rem)]",
                "text-[color:var(--color-fg)]",
                "max-w-4xl",
              )}
            >
              <span
                aria-hidden
                className="text-[color:var(--color-gold)] font-[var(--font-display)] italic mr-1"
              >
                &ldquo;
              </span>
              <em className="display-italic">Kizuna</em> é a palavra japonesa para os{" "}
              <em className="display-italic text-[color:var(--color-gold)]">laços invisíveis</em>{" "}
              que se formam entre pessoas — e entre as pessoas e as coisas que decidem
              guardar. Toda peça desta loja existe por causa de um desses laços.
              <span
                aria-hidden
                className="text-[color:var(--color-gold)] font-[var(--font-display)] italic ml-1"
              >
                &rdquo;
              </span>
            </blockquote>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-end gap-6 sm:justify-between">
              <div>
                <p className="font-[var(--font-display)] italic text-[color:var(--color-fg)]">
                  &mdash; Equipe Kizuna · Itapetininga, SP
                </p>
                <p className="mt-1 eyebrow">Desde 2024</p>
              </div>

              <Link
                href="/sobre"
                className={cn(
                  "inline-flex items-center gap-2 text-[var(--text-body)]",
                  "text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors",
                  "border-b border-[color:var(--color-border-strong)] hover:border-[color:var(--color-gold)] pb-1",
                  "w-fit",
                )}
              >
                Ler a história completa
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
