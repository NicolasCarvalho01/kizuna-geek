import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Receba lançamentos selecionados, pré-vendas com prioridade e bastidores da curadoria. Sem ruído.",
};

const BENEFITS = [
  {
    index: "01",
    title: "Lançamentos antes do público",
    body: "Quando uma peça rara chega no nosso radar, você fica sabendo antes de ir pro Instagram ou pro catálogo público.",
  },
  {
    index: "02",
    title: "Pré-venda com 48h de prioridade",
    body: "Quem está cadastrado abre pré-vendas 48 horas antes do público geral. Pra quotas limitadas, essa diferença é tudo.",
  },
  {
    index: "03",
    title: "Cupons exclusivos",
    body: "De vez em quando soltamos cupom só pra newsletter — frete grátis, desconto em coleção, brinde junto. Nunca em data óbvia.",
  },
  {
    index: "04",
    title: "Bastidor da curadoria",
    body: "Por que escolhemos essa peça? De onde veio? O que tem de diferente? Conteúdo que não vai pro Instagram.",
  },
];

export default function NewsletterPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-20 lg:pt-32 pb-16 overflow-hidden isolate">
        <span
          aria-hidden
          className="absolute top-10 right-[-4rem] lg:right-[-6rem] font-[var(--font-jp)] text-[20rem] lg:text-[32rem] leading-none font-black text-[color:var(--color-gold)]/[0.08] select-none pointer-events-none"
        >
          絆
        </span>

        <div className="wrap relative grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <Eyebrow index="—">Newsletter · 通信</Eyebrow>
            <h1
              className={cn(
                "display mt-4",
                "text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02]",
              )}
            >
              Os{" "}
              <em className="display-italic text-[color:var(--color-gold)]">
                lançamentos importantes
              </em>{" "}
              na sua caixa.
              <br />
              Sem ruído.
            </h1>
            <p className="mt-8 max-w-xl text-[var(--text-lead)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
              Um email a cada 1–2 semanas. Lançamentos selecionados, pré-vendas
              com prioridade e cupons exclusivos. Sem spam, sem &ldquo;dia das
              mães&rdquo;, sem fluff.
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="border-t border-[color:var(--color-hairline)] py-16 lg:py-24 bg-[color:var(--color-bg-sunken)]">
        <div className="wrap">
          <div className="max-w-2xl mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-16 lg:py-24 border-t border-[color:var(--color-hairline)]">
        <div className="wrap">
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-12 lg:col-span-3">
              <Eyebrow index="—">O que você recebe</Eyebrow>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-5">
              <h2 className="display text-[clamp(1.875rem,3.5vw,2.75rem)] leading-[1.1]">
                Quatro motivos pra{" "}
                <em className="display-italic text-[color:var(--color-gold)]">
                  abrir
                </em>{" "}
                cada email.
              </h2>
            </div>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 max-w-5xl mx-auto">
            {BENEFITS.map((b) => (
              <li key={b.index} className="flex gap-5">
                <span className="eyebrow text-[color:var(--color-gold)] shrink-0 pt-1">
                  {b.index}
                </span>
                <div>
                  <h3 className="font-[var(--font-display)] text-[1.375rem] leading-tight mb-2">
                    {b.title}
                  </h3>
                  <p className="text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
                    {b.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-16 text-center text-[var(--text-caption)] text-[color:var(--color-fg-mute)]">
            Você pode cancelar a qualquer momento — link de unsubscribe em todos
            os emails. Detalhes na{" "}
            <a
              href="/privacidade"
              className="text-[color:var(--color-fg-soft)] underline underline-offset-2 hover:text-[color:var(--color-gold)] transition-colors"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
