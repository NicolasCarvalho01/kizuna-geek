import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ContactForm } from "@/components/contact/contact-form";
import { InstagramIcon } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a Kizuna Geek — formulário, email, Instagram. Resposta em dia útil.",
};

export default function ContatoPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-20 lg:pt-28 pb-12 overflow-hidden isolate">
        <span
          aria-hidden
          className="absolute top-10 right-[-3rem] lg:right-[-4rem] font-[var(--font-jp)] text-[18rem] lg:text-[28rem] leading-none font-black text-[color:var(--color-gold)]/[0.08] select-none pointer-events-none"
        >
          絆
        </span>

        <div className="wrap relative">
          <Eyebrow index="—">Contato</Eyebrow>
          <h1
            className={cn(
              "display mt-4",
              "text-[clamp(2rem,5.5vw,4rem)] leading-[1.05]",
              "max-w-[22ch]",
            )}
          >
            Escreve pra gente —{" "}
            <em className="display-italic text-[color:var(--color-gold)]">a gente lê</em>.
          </h1>
          <p className="mt-8 max-w-2xl text-[var(--text-lead)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
            Dúvida sobre produto, pedido, pré-venda ou parceria? Manda a mensagem.
            Resposta em até 1 dia útil — costume é ser mais rápido.
          </p>
        </div>
      </section>

      {/* Conteúdo: form + canais alternativos */}
      <section className="border-t border-[color:var(--color-hairline)] py-16 lg:py-24">
        <div className="wrap">
          <div className="grid grid-cols-12 gap-6 lg:gap-10">
            {/* Form */}
            <div className="col-span-12 lg:col-span-7">
              <p className="eyebrow mb-6">01 · Formulário</p>
              <ContactForm />
            </div>

            {/* Canais alternativos */}
            <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="eyebrow mb-6">02 · Outros canais</p>

              <ul className="space-y-8">
                <li>
                  <div className="flex items-start gap-3">
                    <Mail
                      className="h-4 w-4 mt-1 text-[color:var(--color-gold)] shrink-0"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="eyebrow mb-1">Email</p>
                      <a
                        href="mailto:contato@kizunageek.com.br"
                        className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
                      >
                        contato@kizunageek.com.br
                      </a>
                      <p className="mt-1 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        Pra dúvidas detalhadas, propostas comerciais ou
                        situações que precisam de histórico.
                      </p>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex items-start gap-3">
                    <InstagramIcon
                      size={16}
                      className="mt-1 text-[color:var(--color-gold)] shrink-0"
                    />
                    <div>
                      <p className="eyebrow mb-1">Instagram</p>
                      <a
                        href="https://instagram.com/kizunageek"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)] transition-colors"
                      >
                        @kizunageek
                      </a>
                      <p className="mt-1 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        DMs respondidas em horário comercial. Mais rápido pra
                        dúvidas curtas sobre produto.
                      </p>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex items-start gap-3">
                    <Clock
                      className="h-4 w-4 mt-1 text-[color:var(--color-gold)] shrink-0"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="eyebrow mb-1">Horário</p>
                      <p className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)]">
                        Seg–Sex · 9h às 18h (BRT)
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        Pedidos confirmados fora desse horário entram na fila
                        do próximo dia útil.
                      </p>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="h-4 w-4 mt-1 text-[color:var(--color-gold)] shrink-0"
                      strokeWidth={1.5}
                    />
                    <div>
                      <p className="eyebrow mb-1">Onde estamos</p>
                      <p className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)]">
                        Itapetininga · SP
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                        Operação 100% online — sem loja física no momento.
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
