import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, CalloutBox } from "@/components/legal/editorial-page";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Kizuna Geek coleta, usa, armazena e protege seus dados pessoais — conforme a LGPD (Lei nº 13.709/2018).",
  robots: { index: true, follow: true },
};

const UPDATED_AT = "25 de maio de 2026";

export default function PrivacidadePage() {
  return (
    <EditorialPage
      eyebrow="Privacidade · LGPD"
      title={
        <>
          Como cuidamos dos seus{" "}
          <em className="display-italic text-[color:var(--color-gold)]">dados</em>.
        </>
      }
      lead="Esta Política de Privacidade explica como a Kizuna Geek coleta, usa, armazena e protege seus dados pessoais, conforme a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)."
    >
      <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] mb-8">
        <strong>Última atualização:</strong> {UPDATED_AT}
      </p>

      <CalloutBox variant="gold" title="Resumo em 3 linhas">
        <p>
          1. Coletamos apenas o necessário pra processar seu pedido (nome, email, CPF, endereço, telefone, dados de pagamento).
        </p>
        <p>
          2. Não vendemos seus dados. Compartilhamos com parceiros essenciais (Stripe, Melhor Envio, Focus NFe) que têm suas próprias políticas LGPD.
        </p>
        <p>
          3. Você tem direito de acessar, corrigir, exportar e excluir seus dados — escreva pra{" "}
          <a href="mailto:privacidade@kizunageek.com.br">privacidade@kizunageek.com.br</a>.
        </p>
      </CalloutBox>

      <h2>1. Quem somos</h2>
      <p>
        A <strong>Kizuna Geek</strong> é a loja boutique de Action Figures, Colecionáveis e Trading Card Games operada em Itapetininga/SP. Para fins desta política, somos a <strong>controladora</strong> dos seus dados pessoais, no sentido do art. 5º, VI da LGPD.
      </p>
      <p>
        <strong>Encarregado pelo tratamento de dados (DPO):</strong> contato via{" "}
        <a href="mailto:privacidade@kizunageek.com.br">privacidade@kizunageek.com.br</a>.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <h3>2.1 Dados que você nos fornece diretamente</h3>
      <ul>
        <li><strong>Cadastro:</strong> nome completo, email, senha (armazenada com hash bcrypt — nunca em texto claro).</li>
        <li><strong>Perfil:</strong> CPF (opcional, exigido apenas para emissão de NF-e), telefone, data de nascimento.</li>
        <li><strong>Endereço de entrega:</strong> CEP, logradouro, número, complemento, bairro, cidade, estado.</li>
        <li><strong>Comunicação:</strong> mensagens que você envia via formulário de contato ou email.</li>
      </ul>

      <h3>2.2 Dados coletados automaticamente</h3>
      <ul>
        <li><strong>Navegação:</strong> páginas visitadas, tempo de permanência, dispositivo (via Vercel Analytics — anonimizado).</li>
        <li><strong>Cookies essenciais:</strong> sessão de login, carrinho, preferência de tema. Detalhes na{" "}
          <Link href="/cookies">Política de Cookies</Link>.
        </li>
        <li><strong>Logs de erro:</strong> em caso de bug, capturamos contexto técnico (URL, stack trace) via Sentry — sem PII.</li>
      </ul>

      <h3>2.3 Dados de pagamento</h3>
      <p>
        <strong>Importante:</strong> dados de cartão de crédito, PIX e boleto são processados <strong>diretamente pelo Stripe</strong> (PCI-DSS Level 1). A Kizuna Geek <strong>nunca</strong> armazena número de cartão, CVV ou validade. Recebemos apenas: status do pagamento, últimos 4 dígitos do cartão (pra você reconhecer o pedido) e bandeira.
      </p>

      <h2>3. Para que usamos seus dados</h2>
      <p>Tratamos seus dados com bases legais previstas no art. 7º da LGPD:</p>
      <ul>
        <li><strong>Execução de contrato (art. 7º, V):</strong> processar pedidos, calcular frete, emitir NF-e, enviar atualizações de envio.</li>
        <li><strong>Obrigação legal (art. 7º, II):</strong> emitir NF-e, manter histórico fiscal por 5 anos, atender requisições da Receita Federal.</li>
        <li><strong>Consentimento (art. 7º, I):</strong> envio de newsletter, comunicações de marketing, lembretes de carrinho abandonado.</li>
        <li><strong>Legítimo interesse (art. 7º, IX):</strong> prevenção a fraude, segurança da plataforma, melhoria do produto via analytics anonimizado.</li>
      </ul>

      <h2>4. Com quem compartilhamos</h2>
      <p>Compartilhamos apenas com <strong>operadores essenciais</strong> ao funcionamento da loja:</p>
      <ul>
        <li><strong>Stripe Inc.</strong> — processamento de pagamentos (PIX, cartão, boleto). Política:{" "}
          <a href="https://stripe.com/br/privacy" target="_blank" rel="noopener noreferrer">stripe.com/br/privacy</a>.
        </li>
        <li><strong>Melhor Envio</strong> — cotação e contratação de frete (Correios, Jadlog, Loggi). Política:{" "}
          <a href="https://melhorenvio.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer">melhorenvio.com.br</a>.
        </li>
        <li><strong>Focus NFe</strong> — emissão de Nota Fiscal Eletrônica.</li>
        <li><strong>Supabase</strong> — banco de dados (PostgreSQL, hospedado em São Paulo/SP — datacenter AWS sa-east-1).</li>
        <li><strong>Vercel</strong> — hospedagem da aplicação (edge global, dados em trânsito criptografados via TLS 1.3).</li>
        <li><strong>Resend</strong> — envio de emails transacionais (confirmação, envio, pré-venda).</li>
      </ul>
      <p>
        <strong>Não vendemos seus dados.</strong> Não os fornecemos a terceiros pra fins de marketing externo, profiling ou venda casada.
      </p>

      <h2>5. Por quanto tempo guardamos</h2>
      <ul>
        <li><strong>Cadastro ativo:</strong> enquanto sua conta estiver ativa.</li>
        <li><strong>Dados fiscais (notas, pedidos):</strong> 5 anos após emissão, por exigência fiscal.</li>
        <li><strong>Dados de pagamento (status, últimos 4 dígitos):</strong> 5 anos para fins de auditoria e estorno.</li>
        <li><strong>Logs de navegação:</strong> 90 dias.</li>
        <li><strong>Após exclusão de conta:</strong> mantemos apenas o mínimo legal (NF-e emitidas) — todo o resto é apagado em até 30 dias.</li>
      </ul>

      <h2>6. Seus direitos</h2>
      <p>A LGPD garante a você os seguintes direitos (art. 18):</p>
      <ul>
        <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e obter cópia.</li>
        <li><strong>Correção:</strong> atualizar dados desatualizados ou incompletos.</li>
        <li><strong>Anonimização ou bloqueio:</strong> de dados desnecessários ou excessivos.</li>
        <li><strong>Portabilidade:</strong> exportar seus dados em formato estruturado (JSON/CSV).</li>
        <li><strong>Eliminação:</strong> apagar dados tratados com base em consentimento (respeitada a retenção fiscal).</li>
        <li><strong>Revogação de consentimento:</strong> cancelar newsletter ou comunicações de marketing a qualquer momento.</li>
      </ul>
      <p>
        Para exercer qualquer direito, escreva pra{" "}
        <a href="mailto:privacidade@kizunageek.com.br">privacidade@kizunageek.com.br</a>{" "}
        com o assunto &ldquo;LGPD — [seu pedido]&rdquo;. Respondemos em até <strong>15 dias úteis</strong>.
      </p>

      <h2>7. Segurança</h2>
      <ul>
        <li>Conexão HTTPS (TLS 1.3) em todas as páginas, sem exceção.</li>
        <li>Senhas com hash bcrypt (custo 12) — nunca armazenadas em texto claro.</li>
        <li>Dados de pagamento processados apenas no ambiente PCI-DSS do Stripe.</li>
        <li>Acessos administrativos com autenticação multifator e logs auditados.</li>
        <li>Banco de dados em datacenter brasileiro (sa-east-1) com backups diários.</li>
      </ul>

      <h2>8. Cookies</h2>
      <p>
        Para detalhes sobre cookies, finalidades e como recusá-los, consulte nossa{" "}
        <Link href="/cookies">Política de Cookies</Link>.
      </p>

      <h2>9. Crianças e adolescentes</h2>
      <p>
        Não direcionamos a loja a menores de 18 anos e não coletamos dados de crianças conscientemente. Se você é responsável e identificar que dados de um menor foram coletados sem autorização, escreva pra{" "}
        <a href="mailto:privacidade@kizunageek.com.br">privacidade@kizunageek.com.br</a>{" "}
        que removemos.
      </p>

      <h2>10. Mudanças nesta política</h2>
      <p>
        Podemos atualizar esta política quando houver mudança legal, técnica ou de operação. Mudanças relevantes serão comunicadas por email a clientes cadastrados <strong>com pelo menos 15 dias de antecedência</strong>. A versão atual está sempre disponível nesta URL.
      </p>

      <CalloutBox variant="warning" title="Aviso legal">
        <p>
          Este documento é um template baseado em boas práticas LGPD e foi gerado com IA. <strong>Antes de operar comercialmente</strong>, revise com advogado(a) especializado em proteção de dados pra adequar ao seu modelo de negócio específico (ex: vendas internacionais, programa de fidelidade, integração com marketplaces).
        </p>
      </CalloutBox>
    </EditorialPage>
  );
}
