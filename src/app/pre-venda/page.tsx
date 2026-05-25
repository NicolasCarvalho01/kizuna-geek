import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, CalloutBox, TopicList } from "@/components/legal/editorial-page";
import { getPreOrderProducts } from "@/server/queries/products";
import { ProductCard } from "@/components/catalog/product-card";

export const metadata: Metadata = {
  title: "Como funcionam as Pré-vendas",
  description:
    "Garanta peças raras antes do lançamento — entenda como funcionam as pré-vendas na Kizuna Geek.",
};

export default async function PreVendaPage() {
  const activePreorders = await getPreOrderProducts(6);

  return (
    <EditorialPage
      eyebrow="Pré-venda · 予約"
      title={
        <>
          Pré-vendas com{" "}
          <em className="display-italic text-[color:var(--color-gold)]">honestidade</em>{" "}
          e prioridade.
        </>
      }
      lead="Quer garantir uma peça raríssima antes que esgote? Pré-venda é o caminho. Mas a gente faz diferente: data clara, política transparente, prioridade pra quem é cadastrado."
      withWatermark
    >
      <h2>Como funciona</h2>
      <TopicList
        items={[
          {
            index: "01",
            title: "Reserva antes do lançamento",
            body: "Você reserva uma peça que o fabricante (Bandai, Funko, Good Smile Company, etc.) ainda vai produzir. Geralmente a janela é de 3 a 12 meses entre reserva e chegada.",
          },
          {
            index: "02",
            title: "Pagamento integral no ato",
            body: "Pagamento PIX, cartão ou boleto — confirma a reserva. Isso garante o seu lugar na quota limitada que conseguimos importar.",
          },
          {
            index: "03",
            title: "Prioridade pra cadastrados",
            body: "Quem tem conta na Kizuna acessa pré-vendas com 48h de antecedência antes da abertura ao público geral. Mais um motivo pra criar conta antes do release.",
          },
          {
            index: "04",
            title: "Envio na hora certa",
            body: "Assim que a peça chega no nosso estoque, embalamos e enviamos. NF-e emitida só nesse momento, conforme regra fiscal do SEFAZ.",
          },
        ]}
      />

      <h2>Regras de cancelamento</h2>
      <p>Você pode mudar de ideia. As regras de cancelamento são transparentes:</p>
      <ul>
        <li>
          <strong>Até 30 dias antes da data de release prevista:</strong>{" "}
          cancelamento gratuito, reembolso integral pela mesma forma de pagamento.
        </li>
        <li>
          <strong>Entre 30 dias e a data de release:</strong> reembolso com retenção
          de 10% como custo administrativo (frete já foi reservado com o fabricante).
        </li>
        <li>
          <strong>Após release e envio:</strong> segue política normal de
          arrependimento — 7 dias corridos do recebimento (CDC art. 49).
        </li>
      </ul>

      <CalloutBox variant="gold" title="Se o fabricante atrasar">
        <p>
          Datas de pré-venda são <strong>estimativas do fabricante</strong> e podem
          mudar. A gente comunica qualquer atraso por email assim que ficamos sabendo.
        </p>
        <p>
          Se o atraso ultrapassar <strong>30 dias da data prevista original</strong>,
          você pode pedir reembolso integral sem custo nenhum — basta responder o
          email comunicando o atraso.
        </p>
      </CalloutBox>

      <h2>Por que pagar agora se vai chegar daqui a meses?</h2>
      <p>
        Justa pergunta. A resposta:
      </p>
      <ul>
        <li>
          <strong>Quota limitada</strong> — fabricantes japoneses produzem em
          tiragem fechada. Sem reserva paga, não tem como garantir unidade.
        </li>
        <li>
          <strong>Preço travado</strong> — o preço da pré-venda fica congelado.
          Câmbio sobe? Demanda explode? Não te afeta.
        </li>
        <li>
          <strong>Importação</strong> — pré-pagamento permite à gente fechar a ordem
          de importação com o distribuidor sem expor capital próprio (e por isso
          conseguimos passar preço melhor).
        </li>
      </ul>

      {activePreorders.length > 0 && (
        <section className="not-prose my-16">
          <h2 className="font-[var(--font-display)] text-[clamp(1.5rem,2.6vw,2rem)] leading-tight mb-6 text-[color:var(--color-fg)]">
            Pré-vendas abertas agora
          </h2>
          <ul className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
            {activePreorders.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} variant="compact" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2>Resumindo</h2>
      <p>
        Pré-venda é o caminho pra colecionador sério — garante a peça antes que
        esgote, com preço travado e prioridade pra cadastrados. Se ficar com
        qualquer dúvida, escreve pra gente.
      </p>

      <p className="mt-6">
        Mais sobre prazos, frete e devoluções:
      </p>
      <ul>
        <li><Link href="/entrega">Entrega &amp; Frete</Link></li>
        <li><Link href="/trocas">Trocas &amp; Devoluções</Link></li>
        <li><Link href="/perguntas">FAQ completo</Link></li>
      </ul>
    </EditorialPage>
  );
}
