import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, CalloutBox } from "@/components/legal/editorial-page";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Regras de uso da plataforma Kizuna Geek — compra, conta, conduta, propriedade intelectual e responsabilidades.",
  robots: { index: true, follow: true },
};

const UPDATED_AT = "25 de maio de 2026";

export default function TermosPage() {
  return (
    <EditorialPage
      eyebrow="Termos de uso"
      title={
        <>
          As regras{" "}
          <em className="display-italic text-[color:var(--color-gold)]">do jogo</em>{" "}
          aqui na Kizuna.
        </>
      }
      lead="Estes Termos de Uso regulam o relacionamento entre você e a Kizuna Geek ao usar nossa loja online — desde a navegação até a compra. Ao criar conta ou realizar uma compra, você concorda com tudo abaixo."
    >
      <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] mb-8">
        <strong>Última atualização:</strong> {UPDATED_AT}
      </p>

      <h2>1. Quem somos e quem você é</h2>
      <p>
        A <strong>Kizuna Geek</strong> é uma loja boutique sediada em Itapetininga/SP, especializada em Action Figures, Colecionáveis e Trading Card Games. Ao usar este site (kizunageek.com.br), você (&ldquo;Usuário&rdquo;) declara ter no mínimo 18 anos ou estar autorizado por responsável legal, e concorda com estes Termos.
      </p>

      <h2>2. Cadastro e conta</h2>
      <ul>
        <li>O cadastro é gratuito e exige email válido e senha.</li>
        <li>Você é responsável pela veracidade dos dados informados e por manter a senha em sigilo.</li>
        <li>Atividade na sua conta é sua responsabilidade — recomendamos senha forte e não compartilhar acesso.</li>
        <li>Reservamos o direito de suspender contas com indícios de fraude, uso indevido, ou múltiplas tentativas de chargeback indevido.</li>
      </ul>

      <h2>3. Produtos e preços</h2>
      <ul>
        <li>Todos os produtos têm descrição, fotos e variantes claras. Em caso de erro óbvio de cadastro (ex: figure colecionável anunciada por R$ 1), reservamos o direito de cancelar o pedido e estornar.</li>
        <li>Preços são em <strong>Reais (BRL)</strong>, com impostos inclusos quando aplicáveis.</li>
        <li>Estoque é limitado e atualizado em tempo real — não garantimos disponibilidade até a finalização do pedido.</li>
        <li>Promoções têm condições claras (data, quantidade, cupom) sempre informadas.</li>
      </ul>

      <h2>4. Pré-vendas</h2>
      <p>
        Itens de pré-venda têm regras específicas — leia a{" "}
        <Link href="/pre-venda">Política de Pré-vendas</Link> antes de comprar:
      </p>
      <ul>
        <li>Pagamento integral no ato da reserva.</li>
        <li>Data de chegada estimada pelo fabricante — pode atrasar; comunicamos qualquer mudança por email.</li>
        <li>NF-e emitida só no momento do envio efetivo (conforme regra fiscal SEFAZ).</li>
        <li>Cancelamento sem custo até <strong>30 dias antes</strong> da data de release; depois, segue a política de trocas e devoluções padrão.</li>
      </ul>

      <h2>5. Pagamento</h2>
      <p>Aceitamos:</p>
      <ul>
        <li><strong>PIX</strong> — confirmação imediata, melhor desconto.</li>
        <li><strong>Cartão de crédito</strong> — Visa, Mastercard, Elo, Amex, Hipercard. Parcelamento conforme regras do cartão.</li>
        <li><strong>Boleto bancário</strong> — vencimento em 3 dias úteis; pedido confirmado após compensação.</li>
      </ul>
      <p>
        Pagamento é processado pelo <strong>Stripe</strong> (PCI-DSS Level 1) — não armazenamos dados de cartão.
      </p>

      <h2>6. Entrega</h2>
      <p>
        Veja todos os detalhes em <Link href="/entrega">Entrega &amp; Frete</Link>. Resumo:
      </p>
      <ul>
        <li>Enviamos pra todo Brasil via <strong>Melhor Envio</strong> (Correios, Jadlog, Loggi).</li>
        <li>Frete e prazo cotados em tempo real no checkout, baseados no CEP de destino.</li>
        <li>Prazo de postagem: <strong>até 2 dias úteis</strong> após confirmação do pagamento.</li>
        <li>Acompanhe seu pedido em <Link href="/conta/pedidos">Minha conta &gt; Pedidos</Link>.</li>
      </ul>

      <h2>7. Trocas e devoluções</h2>
      <p>
        Conforme o <strong>Código de Defesa do Consumidor (Lei 8.078/90)</strong>, você tem direito a:
      </p>
      <ul>
        <li><strong>Arrependimento (art. 49):</strong> 7 dias corridos a contar do recebimento — devolução com reembolso integral, inclusive frete.</li>
        <li><strong>Vício oculto ou defeito (art. 18):</strong> 30 dias para reportar produtos não duráveis e 90 dias para duráveis.</li>
      </ul>
      <p>Veja todas as condições e como solicitar em <Link href="/trocas">Trocas &amp; Devoluções</Link>.</p>

      <h2>8. Propriedade intelectual</h2>
      <ul>
        <li>Todo o conteúdo do site (logotipo Kizuna Geek 絆, identidade visual, textos editoriais, fotos próprias, código) é <strong>propriedade da Kizuna Geek</strong> e protegido por copyright.</li>
        <li>Marcas de produtos (Funko, Bandai, Nendoroid, Pokémon TCG, etc.) pertencem aos respectivos titulares. Usamos para fins informativos e comerciais autorizados.</li>
        <li>Não é permitido copiar, reproduzir ou redistribuir conteúdo do site sem autorização escrita.</li>
      </ul>

      <h2>9. Conduta do usuário</h2>
      <p>Ao usar a plataforma, você se compromete a NÃO:</p>
      <ul>
        <li>Realizar pedidos fraudulentos ou com cartão de terceiros sem autorização.</li>
        <li>Tentar acessar contas alheias, áreas administrativas ou banco de dados.</li>
        <li>Fazer scraping automatizado de catálogo ou preços (vide{" "}
          <a href="https://kizunageek.com.br/robots.txt" target="_blank" rel="noopener noreferrer">robots.txt</a>).
        </li>
        <li>Postar avaliações falsas, ofensivas ou que infrinjam direitos de terceiros.</li>
        <li>Usar a loja para fins ilícitos, lavagem de dinheiro ou financiamento de atividades criminosas.</li>
      </ul>

      <h2>10. Limitação de responsabilidade</h2>
      <p>
        A Kizuna Geek empenha-se em manter a loja disponível 24/7, mas <strong>não garante disponibilidade ininterrupta</strong>. Eventuais indisponibilidades por manutenção, falha de provedores (Vercel, Supabase, Stripe), força maior ou ataques cibernéticos não geram direito a indenização.
      </p>
      <p>
        Não nos responsabilizamos por <strong>uso indevido</strong> de produtos colecionáveis por menores sem supervisão (algumas peças têm pequenas partes ou são licenciadas para colecionadores adultos).
      </p>

      <h2>11. Foro e lei aplicável</h2>
      <p>
        Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de <strong>Itapetininga/SP</strong> para resolver controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja — sem prejuízo dos direitos do consumidor previstos no CDC.
      </p>

      <h2>12. Contato</h2>
      <p>
        Dúvidas sobre estes Termos: <a href="mailto:contato@kizunageek.com.br">contato@kizunageek.com.br</a>{" "}
        ou pelo <Link href="/contato">formulário de contato</Link>.
      </p>

      <CalloutBox variant="warning" title="Aviso legal">
        <p>
          Este documento é um template baseado em boas práticas e nas legislações citadas (LGPD, CDC). <strong>Antes de operar comercialmente</strong>, revise com advogado(a) pra adequar ao seu modelo (ex: vendas internacionais, marketplace, programa de afiliados, etc.).
        </p>
      </CalloutBox>
    </EditorialPage>
  );
}
