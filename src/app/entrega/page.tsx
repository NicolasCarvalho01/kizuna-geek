import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, CalloutBox, TopicList } from "@/components/legal/editorial-page";

export const metadata: Metadata = {
  title: "Entrega & Frete",
  description:
    "Como funciona o envio na Kizuna Geek — transportadoras, prazos, rastreamento e regiões atendidas.",
};

export default function EntregaPage() {
  return (
    <EditorialPage
      eyebrow="Entrega · Logística"
      title={
        <>
          Sua peça chega{" "}
          <em className="display-italic text-[color:var(--color-gold)]">bem embalada</em>{" "}
          em todo o Brasil.
        </>
      }
      lead="Trabalhamos com Melhor Envio pra cotar e despachar — você compara prazos e preços de Correios, Jadlog e Loggi no checkout, escolhe o que faz sentido."
      withWatermark
    >
      <h2>Como funciona</h2>
      <TopicList
        items={[
          {
            index: "01",
            title: "Cotação em tempo real",
            body: "Digite o CEP no checkout — o sistema cota com PAC, SEDEX, Jadlog .Package e Loggi (quando atende sua região). Você escolhe entre as opções.",
          },
          {
            index: "02",
            title: "Postagem em até 2 dias úteis",
            body: "Após confirmar o pagamento (PIX = imediato, cartão = ~1min, boleto = compensação bancária), embalamos e postamos em até 2 dias úteis.",
          },
          {
            index: "03",
            title: "Embalagem cuidada",
            body: "Action figures originais viajam com proteção extra de canto. TCG singles vão em toploader rígido + sleeve. Tudo em caixa de papelão duplo com plástico bolha.",
          },
          {
            index: "04",
            title: "Rastreamento sempre",
            body: "Você recebe email com código de rastreio assim que postamos. Acompanha tudo em Minha conta → Pedidos, ou direto no site da transportadora.",
          },
        ]}
      />

      <h2>Prazos médios (a partir da postagem)</h2>
      <p>
        Prazos finais aparecem no checkout — variam por região, peso e modalidade. Estes são valores de referência <strong>a partir de Itapetininga/SP</strong>:
      </p>
      <ul>
        <li><strong>Sudeste (SP, RJ, MG, ES):</strong> PAC 3–5 dias úteis · SEDEX 1–2 dias úteis · Jadlog 2–3 dias úteis</li>
        <li><strong>Sul (PR, SC, RS):</strong> PAC 5–7 dias úteis · SEDEX 2–3 dias úteis</li>
        <li><strong>Centro-oeste (GO, DF, MT, MS):</strong> PAC 6–9 dias úteis · SEDEX 3–4 dias úteis</li>
        <li><strong>Nordeste:</strong> PAC 8–12 dias úteis · SEDEX 4–6 dias úteis</li>
        <li><strong>Norte:</strong> PAC 10–15 dias úteis · SEDEX 5–7 dias úteis</li>
      </ul>

      <CalloutBox variant="info" title="Atrasos: o que esperar">
        <p>
          Os prazos são de responsabilidade da transportadora. Em datas de pico (Black Friday, Natal, Dia das Crianças), pode haver atraso. Se passar 5 dias do prazo máximo previsto, abrimos reclamação na transportadora e te mantemos atualizado por email.
        </p>
      </CalloutBox>

      <h2>Frete grátis</h2>
      <p>
        Periodicamente lançamos cupons de <strong>frete grátis</strong> em compras acima de determinado valor (ex: R$ 299 ou R$ 499). Para ser avisado em primeira mão, assine a <Link href="/newsletter">newsletter</Link>.
      </p>

      <h2>Regiões atendidas</h2>
      <p>
        Entregamos em <strong>todo o território nacional</strong> — todos os 26 estados + DF, onde as transportadoras atenderem o CEP. Algumas localidades remotas podem ter restrição de algumas modalidades (ex: SEDEX 12h não atende toda a Amazônia rural).
      </p>
      <p>
        <strong>Vendas internacionais:</strong> ainda não atendemos. Em planejamento pra 2027.
      </p>

      <h2>Retirada presencial</h2>
      <p>
        No momento <strong>não oferecemos retirada</strong> — operamos exclusivamente online. Caso seja de Itapetininga e queira combinar algo, escreva pelo <Link href="/contato">formulário de contato</Link>.
      </p>

      <h2>O que fazer se o pacote chegar danificado</h2>
      <ol>
        <li><strong>Não recuse a entrega.</strong> Aceite o pacote.</li>
        <li>Tire fotos do pacote fechado, da embalagem externa danificada e do conteúdo (peça + caixa interna se for figure).</li>
        <li>Em até <strong>48 horas</strong> da entrega, escreva pra <a href="mailto:contato@kizunageek.com.br">contato@kizunageek.com.br</a> com as fotos e o número do pedido.</li>
        <li>Avaliamos e oferecemos: reembolso integral OU troca pela mesma peça (se disponível) OU crédito na loja com bônus.</li>
      </ol>

      <h2>Mais dúvidas?</h2>
      <p>
        Veja as <Link href="/perguntas">Perguntas Frequentes</Link> ou fale com a gente pelo <Link href="/contato">formulário de contato</Link>.
      </p>
    </EditorialPage>
  );
}
