import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, CalloutBox, TopicList } from "@/components/legal/editorial-page";

export const metadata: Metadata = {
  title: "Trocas & Devoluções",
  description:
    "Direito de arrependimento, vício de produto e como solicitar troca ou devolução na Kizuna Geek — conforme o Código de Defesa do Consumidor.",
};

export default function TrocasPage() {
  return (
    <EditorialPage
      eyebrow="Trocas · Devoluções"
      title={
        <>
          Mudou de ideia ou veio com{" "}
          <em className="display-italic text-[color:var(--color-gold)]">problema</em>?
          A gente resolve.
        </>
      }
      lead="Seguimos o Código de Defesa do Consumidor (Lei 8.078/90). Você tem direito a se arrepender em 7 dias e a reportar defeitos por até 90 dias. Sem burocracia."
    >
      <h2>Resumo dos seus direitos</h2>
      <TopicList
        items={[
          {
            index: "01",
            title: "7 dias de arrependimento",
            body: (
              <>
                Conforme <strong>art. 49 do CDC</strong>, se você comprou online e
                se arrependeu, tem <strong>7 dias corridos</strong> a partir do
                recebimento pra devolver — sem precisar justificar nada. Reembolso
                integral, inclusive o frete pago.
              </>
            ),
          },
          {
            index: "02",
            title: "Vício oculto ou defeito",
            body: (
              <>
                <strong>30 dias</strong> pra reportar defeitos em produtos não
                duráveis e <strong>90 dias</strong> em duráveis (art. 26 do CDC).
                Action figures e colecionáveis em geral são duráveis — 90 dias.
              </>
            ),
          },
          {
            index: "03",
            title: "Troca por outro produto",
            body: (
              <>
                Não tá satisfeito mas quer outra coisa? Aceitamos trocar por outro
                item de valor equivalente (ou superior, com diferença) dentro do
                prazo de arrependimento.
              </>
            ),
          },
          {
            index: "04",
            title: "Sem custo se o defeito for nosso",
            body: (
              <>
                Se o produto veio com defeito ou foi danificado no transporte por
                embalagem inadequada nossa, <strong>a gente paga o frete de
                volta</strong>. Você manda uma foto e a gente envia código de
                postagem pré-pago.
              </>
            ),
          },
        ]}
      />

      <h2>Como solicitar</h2>
      <ol>
        <li>
          Envie email pra <a href="mailto:contato@kizunageek.com.br">contato@kizunageek.com.br</a>{" "}
          com o assunto &ldquo;Troca/Devolução — Pedido #XXXX&rdquo;.
        </li>
        <li>Informe: número do pedido, motivo (arrependimento, defeito, troca) e fotos se for o caso.</li>
        <li>Em até <strong>2 dias úteis</strong>, respondemos com o procedimento — código de postagem pré-pago (defeito nosso) ou orientação de envio (arrependimento).</li>
        <li>Assim que recebermos o item e confirmarmos a condição, processamos reembolso ou troca em até <strong>10 dias úteis</strong>.</li>
      </ol>

      <h2>Condições para devolução</h2>
      <p>Para garantir o reembolso, o item deve voltar:</p>
      <ul>
        <li>Na <strong>embalagem original</strong>, com todos os acessórios e itens promocionais (se houver).</li>
        <li><strong>Sem uso</strong>, sem sinais de manuseio prolongado e sem etiquetas removidas.</li>
        <li>Em condição de <strong>revenda como novo</strong>.</li>
      </ul>
      <CalloutBox variant="info" title="TCG — sealed vs single">
        <p>
          <strong>TCG selado</strong> (boosters, decks fechados): devolução só se o
          lacre estiver íntegro. Não aceitamos devolução de produto que foi aberto
          — colecionadores sabem que o valor cai pra zero após abertura.
        </p>
        <p>
          <strong>TCG single</strong> (carta avulsa): foto frente e verso da carta
          recebida, condição igual à do anúncio. Singles vão sempre em toploader
          rígido + sleeve — se chegou amassada por culpa da embalagem, é nosso.
        </p>
      </CalloutBox>

      <h2>Como funciona o reembolso</h2>
      <ul>
        <li>
          <strong>Pagamento via PIX:</strong> devolução por PIX, em até 5 dias úteis
          após confirmação da devolução.
        </li>
        <li>
          <strong>Cartão de crédito:</strong> estorno na fatura — depende do banco
          emissor, geralmente 1 a 2 faturas.
        </li>
        <li>
          <strong>Boleto:</strong> reembolso por PIX (precisamos do CPF e chave PIX
          de quem comprou).
        </li>
      </ul>

      <h2>O que NÃO trocamos</h2>
      <ul>
        <li>Produtos personalizados ou customizados sob encomenda.</li>
        <li>TCG single avulsa <strong>após manuseio</strong> que tenha causado dano (vinco, dobra).</li>
        <li>Produtos com lacre violado quando o lacre era condição de revenda (boosters TCG).</li>
        <li>Pré-vendas <strong>após a data de release</strong> — a partir do envio, vale política normal de arrependimento (7 dias).</li>
      </ul>

      <h2>Pré-vendas: regras especiais</h2>
      <p>
        Pré-vendas têm condições específicas — leia em <Link href="/pre-venda">Como funcionam as pré-vendas</Link>.
        Resumo:
      </p>
      <ul>
        <li>Cancelamento <strong>sem custo</strong> até 30 dias antes da data de release prevista.</li>
        <li>Entre 30 dias e a data de release: retenção de 10% como custo administrativo.</li>
        <li>Após release e envio: política normal de arrependimento (7 dias).</li>
      </ul>

      <CalloutBox variant="warning" title="Aviso legal">
        <p>
          Estes prazos seguem o CDC e jurisprudência consolidada, mas casos
          excepcionais podem variar. Em caso de divergência, prevalece sempre o
          que for mais favorável ao consumidor.
        </p>
      </CalloutBox>
    </EditorialPage>
  );
}
