import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, Mail } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { InstagramIcon } from "@/components/brand/social-icons";
import { JsonLd, organizationJsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sobre · A história por trás dos laços",
  description:
    "Kizuna Geek é uma loja boutique de Action Figures, Colecionáveis e TCG em Itapetininga/SP. Curadoria com critério, pré-vendas honestas e atendimento de gente que coleciona.",
  openGraph: {
    title: "Sobre a Kizuna Geek",
    description:
      "A história por trás dos laços que escolhemos guardar. Curadoria boutique de cultura pop japonesa.",
  },
};

const PILLARS = [
  {
    index: "01",
    title: "Curadoria com critério",
    body: "Nada entra no catálogo no automático. Cada peça é avaliada por origem, qualidade da licença, condição da embalagem e relevância pra quem coleciona — não só pelo preço de atacado.",
  },
  {
    index: "02",
    title: "Pré-venda honesta",
    body: "Pré-vendas têm janela, data de lançamento divulgada antes da compra, política de cancelamento clara e atualizações por email quando o cronograma se mexe. Sem fila eterna, sem 'estimativa' vazia.",
  },
  {
    index: "03",
    title: "Embalagem segura",
    body: "Embalamos pra durar a viagem. Action figure original viaja com proteção extra de canto, TCG single vai em toploader rígido + sleeve. Se chegar fora do padrão, refazemos sem rodeio.",
  },
  {
    index: "04",
    title: "Atendimento direto",
    body: "Você fala com gente que coleciona. Dúvida sobre rarity, escala de figure, idioma da carta, condição de single usado — tem resposta, e a resposta não é roteirizada.",
  },
];

const TIMELINE = [
  {
    year: "2024",
    title: "Início dos laços",
    body: "Kizuna Geek nasce em Itapetininga como projeto pessoal — guardar e compartilhar peças japonesas que importam, sem o ruído das mega-lojas.",
  },
  {
    year: "2025",
    title: "Catálogo boutique",
    body: "Estruturação do catálogo em três pilares: Action Figures licenciadas, Colecionáveis raros, e TCG (Pokémon TCG, One Piece TCG, MTG japonês).",
  },
  {
    year: "2026",
    title: "Loja online",
    body: "Lançamento da plataforma própria — pré-vendas com prioridade pra cadastrados, checkout PIX/cartão/boleto, NF-e em todo envio.",
  },
];

export default function SobrePage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Início", url: "/" },
            { name: "Sobre", url: "/sobre" },
          ]),
        ]}
      />

      {/* HERO editorial */}
      <section className="relative pt-20 lg:pt-32 pb-20 lg:pb-28 overflow-hidden isolate">
        {/* 絆 marca d'água gigante */}
        <span
          aria-hidden
          className="absolute top-10 right-[-3rem] lg:right-[-4rem] font-[var(--font-jp)] text-[18rem] lg:text-[28rem] leading-none font-black text-[color:var(--color-gold)]/[0.08] select-none pointer-events-none"
        >
          絆
        </span>

        <div className="wrap relative">
          <Eyebrow index="—">Sobre</Eyebrow>
          <h1
            className={cn(
              "display mt-4",
              "text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]",
              "max-w-[18ch]",
            )}
          >
            A história por trás dos{" "}
            <em className="display-italic text-[color:var(--color-gold)]">laços</em> que
            escolhemos guardar.
          </h1>

          <p className="mt-10 max-w-2xl text-[var(--text-lead)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
            Kizuna Geek é uma loja boutique de Action Figures, Colecionáveis e
            Trading Card Games sediada em Itapetininga, interior de São Paulo. A
            gente existe pra fazer um trabalho que as lojas grandes não fazem:
            escolher peça por peça, contar a história delas, e atender quem
            coleciona como gente que também coleciona.
          </p>
        </div>
      </section>

      {/* MANIFESTO — quote longo */}
      <section className="border-t border-[color:var(--color-hairline)] py-24 lg:py-32 bg-[color:var(--color-bg-sunken)]">
        <div className="wrap">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-2">
              <Eyebrow index="01">Manifesto</Eyebrow>
            </div>
            <div className="col-span-12 lg:col-span-9 lg:col-start-3">
              <blockquote className="display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.25] text-[color:var(--color-fg)] max-w-4xl">
                <span
                  aria-hidden
                  className="text-[color:var(--color-gold)] font-[var(--font-display)] italic mr-1"
                >
                  &ldquo;
                </span>
                <em className="display-italic">Kizuna</em> (絆) é a palavra
                japonesa pros laços invisíveis que se formam entre pessoas — e
                entre as pessoas e as coisas que decidem guardar. Toda peça
                desta loja existe por causa de um desses laços: alguém um dia
                escolheu cuidar dela. A gente só faz o intermédio dessa{" "}
                <em className="display-italic text-[color:var(--color-gold)]">
                  passagem
                </em>
                .
                <span
                  aria-hidden
                  className="text-[color:var(--color-gold)] font-[var(--font-display)] italic ml-1"
                >
                  &rdquo;
                </span>
              </blockquote>
              <p className="mt-8 font-[var(--font-display)] italic text-[color:var(--color-fg-soft)]">
                &mdash; Equipe Kizuna · 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES — 4 colunas */}
      <section className="py-24 lg:py-32 border-t border-[color:var(--color-hairline)]">
        <div className="wrap">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 lg:col-span-3">
              <Eyebrow index="02">O que muda aqui</Eyebrow>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-5">
              <h2 className="display text-[clamp(1.875rem,3.5vw,2.75rem)] leading-[1.1]">
                Quatro coisas que a gente leva a sério —{" "}
                <em className="display-italic text-[color:var(--color-gold)]">
                  porque ninguém leva
                </em>
                .
              </h2>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14">
            {PILLARS.map((p) => (
              <li key={p.index} className="flex gap-6">
                <span className="eyebrow text-[color:var(--color-gold)] shrink-0 pt-1">
                  {p.index}
                </span>
                <div>
                  <h3 className="font-[var(--font-display)] text-[1.5rem] leading-[1.2] mb-3">
                    {p.title}
                  </h3>
                  <p className="text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* LINHA DO TEMPO */}
      <section className="py-24 lg:py-32 border-t border-[color:var(--color-hairline)] bg-[color:var(--color-bg-sunken)]">
        <div className="wrap">
          <div className="grid grid-cols-12 gap-6 mb-16">
            <div className="col-span-12 lg:col-span-3">
              <Eyebrow index="03">Linha do tempo</Eyebrow>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-5">
              <h2 className="display text-[clamp(1.875rem,3.5vw,2.75rem)] leading-[1.1]">
                Como a gente{" "}
                <em className="display-italic text-[color:var(--color-gold)]">chegou</em>{" "}
                aqui.
              </h2>
            </div>
          </div>

          <ol className="space-y-12 max-w-3xl mx-auto">
            {TIMELINE.map((t, i) => (
              <li key={t.year} className="grid grid-cols-12 gap-6 items-start">
                <div className="col-span-3 lg:col-span-2">
                  <p className="font-[var(--font-display)] text-[2rem] lg:text-[2.5rem] leading-none text-[color:var(--color-gold)]">
                    {t.year}
                  </p>
                </div>
                <div
                  className={cn(
                    "col-span-9 lg:col-span-10 pl-6 border-l border-[color:var(--color-hairline)]",
                    i === TIMELINE.length - 1 && "pb-0",
                  )}
                >
                  <h3 className="font-[var(--font-display)] text-[1.375rem] mb-2">
                    {t.title}
                  </h3>
                  <p className="text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
                    {t.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* DADOS / CONTATO */}
      <section className="py-24 lg:py-32 border-t border-[color:var(--color-hairline)]">
        <div className="wrap">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-3">
              <Eyebrow index="04">A loja</Eyebrow>
            </div>
            <div className="col-span-12 lg:col-span-9 lg:col-start-4">
              <h2 className="display text-[clamp(1.875rem,3.5vw,2.75rem)] leading-[1.1] mb-12">
                Onde achar a gente —{" "}
                <em className="display-italic text-[color:var(--color-gold)]">offline</em>{" "}
                e online.
              </h2>

              <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
                <div>
                  <dt className="eyebrow mb-3 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Endereço
                  </dt>
                  <dd className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)]">
                    Itapetininga, SP
                    <br />
                    Interior de São Paulo
                  </dd>
                  <p className="mt-2 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                    Envio pra todo Brasil via Melhor Envio (PAC, SEDEX, Jadlog).
                  </p>
                </div>

                <div>
                  <dt className="eyebrow mb-3 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Atendimento
                  </dt>
                  <dd className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)]">
                    <a
                      href="mailto:contato@kizunageek.com.br"
                      className="hover:text-[color:var(--color-gold)] transition-colors"
                    >
                      contato@kizunageek.com.br
                    </a>
                  </dd>
                  <p className="mt-2 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                    Resposta em dia útil — costume é ser mais rápido.
                  </p>
                </div>

                <div>
                  <dt className="eyebrow mb-3 flex items-center gap-2">
                    <InstagramIcon size={14} />
                    Redes
                  </dt>
                  <dd className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)]">
                    <a
                      href="https://instagram.com/kizunageek"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[color:var(--color-gold)] transition-colors inline-flex items-center gap-1"
                    >
                      @kizunageek
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </a>
                  </dd>
                  <p className="mt-2 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                    Lançamentos, pré-vendas e bastidores de embalagem.
                  </p>
                </div>
              </dl>

              <div className="mt-16 pt-10 border-t border-[color:var(--color-hairline)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <p className="text-[var(--text-body)] text-[color:var(--color-fg-soft)] max-w-md">
                  Pronto pra começar? O catálogo tá esperando — e algumas peças
                  têm um número de unidades pra sempre.
                </p>
                <Link
                  href="/catalogo"
                  className={cn(
                    "inline-flex items-center gap-3 px-8 py-4",
                    "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]",
                    "font-[var(--font-display)] text-[1.0625rem]",
                    "rounded-[var(--radius-md)]",
                    "hover:bg-[color:var(--color-gold)]/90 transition-colors",
                  )}
                >
                  Explorar o catálogo
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
