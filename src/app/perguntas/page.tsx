import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/legal/editorial-page";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Perguntas Frequentes",
  description:
    "Tudo que você precisa saber sobre a Kizuna Geek — pagamento, entrega, autenticidade, pré-venda e TCG.",
};

const FAQ_GROUPS = [
  {
    heading: "Pedidos & Pagamento",
    items: [
      {
        q: "Quais formas de pagamento vocês aceitam?",
        a: "PIX (confirmação imediata, com melhor desconto), cartão de crédito (Visa, Mastercard, Elo, Amex, Hipercard) e boleto bancário. Tudo processado com segurança pelo Stripe — não armazenamos dados de cartão.",
      },
      {
        q: "Posso parcelar no cartão?",
        a: "Sim — o parcelamento depende das regras do seu cartão e aparece no checkout do Stripe. Em geral, até 12x sem juros pra valores acima de R$ 200 (sujeito a alteração).",
      },
      {
        q: "Como sei se meu pedido foi confirmado?",
        a: "Você recebe um email de confirmação assim que o pagamento é aprovado. Também pode acompanhar tudo em Minha conta → Pedidos.",
      },
      {
        q: "Posso cancelar um pedido?",
        a: "Sim, enquanto o status estiver 'aguardando pagamento' ou 'pagamento confirmado'. Após a postagem, segue a política de Trocas & Devoluções (7 dias de arrependimento conforme CDC).",
      },
    ],
  },
  {
    heading: "Entrega & Frete",
    items: [
      {
        q: "Quanto tempo demora pra chegar?",
        a: "Postamos em até 2 dias úteis após confirmação do pagamento. O prazo total depende da modalidade escolhida e da região — varia de 1 dia útil (SEDEX SP/RJ) a 15 dias úteis (PAC Norte). Cotação no checkout mostra o prazo exato pro seu CEP.",
      },
      {
        q: "Vocês fazem frete grátis?",
        a: "Periodicamente lançamos cupons de frete grátis em compras acima de determinado valor. Assine a newsletter pra ser avisado em primeira mão.",
      },
      {
        q: "Atendem fora do Brasil?",
        a: "Ainda não, mas está em planejamento pra 2027.",
      },
      {
        q: "O pacote chegou danificado, e agora?",
        a: "Não recuse a entrega. Aceite o pacote, tire fotos da embalagem e do conteúdo, e em até 48 horas escreva pra contato@kizunageek.com.br com as fotos e o número do pedido. A gente resolve: reembolso, troca pelo mesmo item ou crédito com bônus.",
      },
    ],
  },
  {
    heading: "Pré-vendas",
    items: [
      {
        q: "Como funciona uma pré-venda?",
        a: "Você reserva uma peça que ainda vai ser lançada pelo fabricante (geralmente em 3-12 meses). Paga no ato, garante o seu, e a gente envia assim que chegar no nosso estoque. NF-e é emitida só no momento do envio efetivo, conforme regra fiscal SEFAZ.",
      },
      {
        q: "E se atrasar?",
        a: "Datas de pré-venda são estimativas do fabricante e podem atrasar — comunicamos qualquer mudança por email. Se atrasar mais de 30 dias da data prevista original, você pode pedir reembolso integral sem custo.",
      },
      {
        q: "Posso cancelar uma pré-venda?",
        a: "Sim, sem custo até 30 dias antes da data de release prevista. Entre 30 dias e a data: retenção de 10% como custo administrativo. Após o envio, segue política normal (7 dias de arrependimento).",
      },
      {
        q: "Vocês têm prioridade pra clientes cadastrados?",
        a: "Sim! Pré-vendas ficam disponíveis 48h antes pra quem está cadastrado e logado. Mais um motivo pra criar conta antes do release.",
      },
    ],
  },
  {
    heading: "Autenticidade & Qualidade",
    items: [
      {
        q: "Os produtos são originais?",
        a: "100%. Trabalhamos apenas com distribuidores oficiais (Bandai, Funko, Pokémon Brazil) e importadores credenciados. Nunca vendemos bootleg, réplica ou unboxed como novo.",
      },
      {
        q: "E TCG single — como sei que a carta tá nas condições anunciadas?",
        a: "Cada single tem foto frente e verso na página, com condição (NM/EX/GD) claramente indicada. Se chegar diferente do anunciado, é troca ou reembolso garantido.",
      },
      {
        q: "Como vocês embalam Action Figures originais?",
        a: "Caixa de papelão duplo + plástico bolha + proteção extra de canto pra figures licenciadas. Pra colecionador, embalagem é parte do valor — a gente sabe.",
      },
      {
        q: "Posso ver a caixa fechada antes de comprar?",
        a: "Sim — para itens em estoque sob demanda (pré-venda recém-chegada, raridade), enviamos fotos atualizadas por WhatsApp ou email se você pedir.",
      },
    ],
  },
  {
    heading: "Conta & Privacidade",
    items: [
      {
        q: "Preciso criar conta pra comprar?",
        a: "Pode comprar como visitante, mas recomendamos criar conta — você ganha acesso a histórico de pedidos, endereços salvos pra checkout rápido, e prioridade em pré-vendas.",
      },
      {
        q: "Vocês vendem meus dados?",
        a: "Não. Compartilhamos apenas com parceiros essenciais (Stripe pra pagamento, Melhor Envio pra frete, Focus NFe pra nota fiscal). Detalhes na Política de Privacidade.",
      },
      {
        q: "Como cancelar a newsletter?",
        a: "Tem link de unsubscribe no rodapé de cada email. Ou escreva pra privacidade@kizunageek.com.br pedindo descadastro completo.",
      },
      {
        q: "Como excluir minha conta?",
        a: "Escreva pra privacidade@kizunageek.com.br solicitando exclusão. Removemos tudo em até 30 dias, exceto dados de pedidos com NF-e emitida (obrigação fiscal — retenção de 5 anos).",
      },
    ],
  },
];

export default function PerguntasPage() {
  // JSON-LD pra rich snippets do Google (FAQ no SERP)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    ),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <EditorialPage
        eyebrow="FAQ · Dúvidas"
        title={
          <>
            Perguntas{" "}
            <em className="display-italic text-[color:var(--color-gold)]">frequentes</em>.
          </>
        }
        lead="Antes de escrever pra gente, talvez a resposta já esteja aqui. Se não tiver, segue pro formulário de contato — a gente responde rápido."
      >
        {FAQ_GROUPS.map((group) => (
          <section key={group.heading} className="not-prose mb-12 last:mb-0">
            <h2 className="font-[var(--font-display)] text-[clamp(1.5rem,2.6vw,2rem)] leading-tight mt-12 first:mt-0 mb-6 text-[color:var(--color-fg)]">
              {group.heading}
            </h2>
            <ul className="space-y-3">
              {group.items.map((item) => (
                <li key={item.q}>
                  <details className="group rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] overflow-hidden transition-colors hover:border-[color:var(--color-gold)]/40 open:border-[color:var(--color-gold)]/60 open:bg-[color:var(--color-gold)]/[0.04]">
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-4 text-[color:var(--color-fg)] font-[var(--font-display)] text-[1.0625rem] leading-snug">
                      <span>{item.q}</span>
                      <span
                        aria-hidden
                        className="shrink-0 mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[color:var(--color-gold)] transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out-3)] group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 pt-1 text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
                      {item.a}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="not-prose mt-16 pt-10 border-t border-[color:var(--color-hairline)] text-center">
          <p className="font-[var(--font-display)] text-[1.5rem] mb-2">Não achou a resposta?</p>
          <p className="text-[var(--text-body)] text-[color:var(--color-fg-soft)] mb-6">
            Escreve pra gente que a gente lê.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] font-[var(--font-display)] hover:bg-[color:var(--color-gold)]/90 transition-colors"
          >
            Falar com a gente
          </Link>
        </section>
      </EditorialPage>
    </>
  );
}
