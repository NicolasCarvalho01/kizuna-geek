import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage, CalloutBox } from "@/components/legal/editorial-page";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Como a Kizuna Geek usa cookies e tecnologias similares — e como você pode controlá-los.",
  robots: { index: true, follow: true },
};

const UPDATED_AT = "25 de maio de 2026";

export default function CookiesPage() {
  return (
    <EditorialPage
      eyebrow="Cookies"
      title={
        <>
          Pra que servem os{" "}
          <em className="display-italic text-[color:var(--color-gold)]">cookies</em>{" "}
          aqui.
        </>
      }
      lead="Esta página descreve quais cookies usamos, por quê, e como você pode controlá-los. Resumo: usamos só os essenciais pra loja funcionar — sem cookies de rastreamento publicitário."
    >
      <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] mb-8">
        <strong>Última atualização:</strong> {UPDATED_AT}
      </p>

      <h2>1. O que são cookies</h2>
      <p>
        Cookies são pequenos arquivos de texto que sites guardam no seu navegador pra lembrar de informações entre visitas — login, preferências, carrinho. Tecnologias similares incluem <strong>localStorage</strong>, <strong>sessionStorage</strong> e <strong>web beacons</strong>.
      </p>

      <h2>2. Quais cookies usamos</h2>

      <h3>2.1 Estritamente necessários (sempre ativos)</h3>
      <p>
        Sem esses, a loja não funciona. Não exigem consentimento por <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer">orientação da ANPD</a>.
      </p>
      <ul>
        <li>
          <strong><code>authjs.session-token</code></strong> — mantém você logado entre páginas (Auth.js). Expira em 30 dias ou ao deslogar.
        </li>
        <li>
          <strong><code>authjs.csrf-token</code></strong> — proteção contra ataques CSRF em formulários sensíveis.
        </li>
        <li>
          <strong><code>kizuna-cart</code></strong> (localStorage) — guarda seu carrinho entre visitas. Limpa após finalizar pedido.
        </li>
        <li>
          <strong><code>kizuna-wishlist</code></strong> (localStorage) — lista de favoritos sem necessidade de login.
        </li>
        <li>
          <strong><code>theme</code></strong> — sua preferência de tema (dark/light). Não-essencial mas inofensivo.
        </li>
      </ul>

      <h3>2.2 Cookies de pagamento (Stripe)</h3>
      <p>
        Durante o checkout, somos redirecionados pro domínio do Stripe (<code>checkout.stripe.com</code>) — eles usam seus próprios cookies pra prevenção de fraude e processamento seguro. Detalhes:{" "}
        <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">stripe.com/cookies-policy</a>.
      </p>

      <h3>2.3 Analytics (anonimizado)</h3>
      <p>
        Usamos <strong>Vercel Analytics</strong> e <strong>Vercel Speed Insights</strong> pra medir performance e identificar páginas com problema. Esses não usam cookies de identificação — coletam apenas métricas agregadas sem IP completo. Detalhes:{" "}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>.
      </p>

      <h3>2.4 O que NÃO usamos</h3>
      <CalloutBox variant="gold" title="O que não fazemos">
        <p>
          ❌ Cookies de Google Ads, Facebook Pixel, TikTok Pixel ou similares.
        </p>
        <p>
          ❌ Cross-site tracking pra publicidade direcionada.
        </p>
        <p>
          ❌ Venda de dados de navegação a terceiros.
        </p>
      </CalloutBox>

      <h2>3. Como controlar cookies</h2>

      <h3>3.1 Cookies essenciais</h3>
      <p>
        Não há opção de desabilitar — sem eles, login e carrinho não funcionam. Se realmente quiser, configure seu navegador pra bloquear todos os cookies do domínio kizunageek.com.br (a loja deixará de funcionar).
      </p>

      <h3>3.2 Limpando cookies manualmente</h3>
      <ul>
        <li>
          <strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies → Ver todos os dados → busque &ldquo;kizunageek.com.br&rdquo; → Remover.
        </li>
        <li>
          <strong>Firefox:</strong> Configurações → Privacidade e Segurança → Cookies e dados de sites → Gerenciar dados → busque kizunageek.
        </li>
        <li>
          <strong>Safari:</strong> Preferências → Privacidade → Gerenciar dados de sites → busque kizunageek.
        </li>
      </ul>

      <h3>3.3 Limpando o carrinho/favoritos sem logout</h3>
      <p>
        Use o botão <strong>&ldquo;Limpar carrinho&rdquo;</strong> dentro do drawer do carrinho, ou limpe o localStorage do navegador (DevTools → Application → Local Storage → kizunageek.com.br → Delete).
      </p>

      <h2>4. Mudanças nesta política</h2>
      <p>
        Se adicionarmos novos cookies (ex: ferramenta de marketing nova), atualizaremos esta página <strong>antes de ativar</strong> e comunicaremos por email a clientes cadastrados.
      </p>

      <h2>5. Mais sobre privacidade</h2>
      <p>
        Para detalhes completos sobre tratamento de dados, veja nossa <Link href="/privacidade">Política de Privacidade</Link>.
      </p>
    </EditorialPage>
  );
}
