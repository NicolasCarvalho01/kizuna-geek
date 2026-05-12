import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata = {
  title: "Página não encontrada",
  description: "A conexão se rompeu — esta página não existe na Kizuna Geek.",
};

export default function NotFound() {
  return (
    <div className="wrap py-24 lg:py-32 relative">
      {/* Marca d'água 404 */}
      <span
        aria-hidden
        className="absolute -top-8 right-0 font-[var(--font-display)] italic font-light leading-none text-[clamp(12rem,28vw,24rem)] text-[color:var(--color-gold)]/8 select-none pointer-events-none"
      >
        404
      </span>

      <div className="grid grid-cols-12 gap-6 relative">
        <div className="col-span-12 lg:col-span-2">
          <span
            aria-hidden
            className="font-[var(--font-jp)] text-[clamp(5rem,12vw,9rem)] leading-none font-black text-[color:var(--color-gold)]/70"
          >
            迷
          </span>
        </div>

        <div className="col-span-12 lg:col-span-7 lg:col-start-4">
          <Eyebrow index="—">Página não encontrada</Eyebrow>
          <h1 className="display mt-5 text-[clamp(2.25rem,5vw,3.75rem)]">
            Esta <em className="display-italic text-[color:var(--color-gold)]">conexão</em>{" "}
            se rompeu.
          </h1>
          <p className="mt-6 max-w-md text-[var(--text-body)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
            A página que você procura não existe aqui — talvez tenha sido
            arquivada, renomeada, ou nunca tenha estado nesse endereço.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">
                Voltar para a vitrine
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/buscar">
                <Search className="h-4 w-4" strokeWidth={1.5} />
                Buscar no catálogo
              </Link>
            </Button>
          </div>

          {/* Atalhos */}
          <div className="mt-16 pt-10 border-t border-[color:var(--color-hairline)]">
            <p className="eyebrow mb-5">Atalhos úteis</p>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { href: "/catalogo/action-figures", label: "Action Figures" },
                { href: "/catalogo/tcg", label: "TCG" },
                { href: "/catalogo/colecionaveis", label: "Colecionáveis" },
              ].map((shortcut) => (
                <li key={shortcut.href}>
                  <Link
                    href={shortcut.href}
                    className="group flex items-center justify-between py-3 border-b border-[color:var(--color-hairline)] text-[var(--text-body)] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
                  >
                    {shortcut.label}
                    <ArrowUpRight
                      className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
