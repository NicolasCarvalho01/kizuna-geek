import * as React from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { InstagramIcon, YoutubeIcon } from "@/components/brand/social-icons";

const COLUMNS = [
  {
    title: "Catálogo",
    links: [
      { href: "/catalogo/action-figures", label: "Action Figures" },
      { href: "/catalogo/tcg", label: "Trading Card Games" },
      { href: "/catalogo/colecionaveis", label: "Colecionáveis" },
      { href: "/pre-venda", label: "Pré-vendas" },
      { href: "/lancamentos", label: "Lançamentos" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { href: "/sobre", label: "Sobre a Kizuna" },
      { href: "/entrega", label: "Entrega & Frete" },
      { href: "/trocas", label: "Trocas & Devoluções" },
      { href: "/perguntas", label: "Perguntas frequentes" },
      { href: "/contato", label: "Contato" },
    ],
  },
  {
    title: "Conta",
    links: [
      { href: "/conta", label: "Meus pedidos" },
      { href: "/favoritos", label: "Favoritos" },
      { href: "/conta/enderecos", label: "Endereços" },
      { href: "/entrar", label: "Entrar" },
      { href: "/cadastrar", label: "Criar conta" },
    ],
  },
];

const SOCIAL = [
  { href: "https://instagram.com/kizunageek", label: "Instagram", Icon: InstagramIcon },
  { href: "https://youtube.com/@kizunageek", label: "YouTube", Icon: YoutubeIcon },
  { href: "https://t.me/kizunageek", label: "Telegram", Icon: Send },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-32 bg-[color:var(--color-bg-sunken)] text-[color:var(--color-fg)]">
      {/* Hairline superior dourada */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--color-gold)]/50 to-transparent" />

      <div className="wrap pt-20 pb-10">
        {/* Tagline editorial principal */}
        <div className="grid grid-cols-12 gap-6 mb-20">
          <div className="col-span-12 lg:col-span-7">
            <p className="eyebrow mb-5">絆 · Kizuna · Os laços que colecionamos</p>
            <h2 className="display text-[clamp(2.5rem,5vw,4.5rem)]">
              Toda peça é um <em className="display-italic text-[color:var(--color-gold)]">laço</em> entre uma
              história e quem decide guardá-la.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 flex flex-col gap-4">
            <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)] max-w-md">
              Receba lançamentos selecionados, pré-vendas com prioridade e bastidores da curadoria.
              Sem ruído. Apenas o que importa.
            </p>
            <Link
              href="/newsletter"
              className="eyebrow inline-flex items-center gap-2 group w-fit"
            >
              <span>Assinar newsletter</span>
              <span
                aria-hidden
                className="inline-block h-px w-8 bg-[color:var(--color-gold)] transition-all duration-[var(--motion-base)] ease-[var(--ease-out-3)] group-hover:w-14"
              />
            </Link>
          </div>
        </div>

        <div className="hairline mb-12" />

        {/* Colunas de links */}
        <div className="grid grid-cols-12 gap-6 mb-16">
          <div className="col-span-12 lg:col-span-3">
            <Logo size="lg" />
            <p className="mt-5 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] max-w-xs leading-[var(--leading-relaxed)]">
              Boutique de Action Figures, Colecionáveis e TCG em Itapetininga/SP.
              Envio para todo o Brasil via Melhor Envio.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  aria-label={label}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-pill)] border border-[color:var(--color-border)] text-[color:var(--color-fg-soft)] transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="col-span-6 sm:col-span-4 lg:col-span-3">
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)] hover:text-[color:var(--color-gold)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mb-8" />

        {/* Rodapé legal */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[var(--text-caption)] text-[color:var(--color-fg-mute)]">
            © {new Date().getFullYear()} Kizuna Geek · Itapetininga, SP · CNPJ 00.000.000/0001-00
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[var(--text-caption)] text-[color:var(--color-fg-mute)]">
            <li>
              <Link href="/privacidade" className="hover:text-[color:var(--color-gold)] transition-colors">
                Privacidade
              </Link>
            </li>
            <li>
              <Link href="/termos" className="hover:text-[color:var(--color-gold)] transition-colors">
                Termos
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-[color:var(--color-gold)] transition-colors">
                Cookies
              </Link>
            </li>
          </ul>
        </div>

        {/* Tagline vertical kana — assinatura tipográfica */}
        <p
          className="vertical-jp absolute right-6 bottom-12 text-[0.6875rem] text-[color:var(--color-fg-mute)] hidden lg:block"
          aria-hidden
        >
          絆を集める
        </p>
      </div>
    </footer>
  );
}
