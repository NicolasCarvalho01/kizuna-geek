/**
 * One-shot OAuth helper para obter o access_token do Melhor Envio sandbox.
 *
 * O ME exige HTTPS no redirect URI, então no painel deixamos
 * `https://kizunageek.com.br/api/melhor-envio/callback` (placeholder).
 *
 * Esse script faz o dance OAuth manualmente:
 * 1. Imprime a URL de autorização — usuário abre no navegador
 * 2. ME redireciona pra placeholder com `?code=...` → browser dá erro de DNS
 * 3. Usuário copia a URL inteira da barra de endereço e cola aqui
 * 4. Script extrai o `code` e troca por access_token via /oauth/token
 * 5. Imprime os tokens — usuário cola no .env.local
 *
 * Uso: `npm run me:auth`
 */

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const BASE_URL = process.env.MELHOR_ENVIO_SANDBOX === "true"
  ? "https://sandbox.melhorenvio.com.br"
  : "https://www.melhorenvio.com.br";

const CLIENT_ID = process.env.MELHOR_ENVIO_CLIENT_ID;
const CLIENT_SECRET = process.env.MELHOR_ENVIO_CLIENT_SECRET;
const REDIRECT_URI = "https://kizunageek.com.br/api/melhor-envio/callback";

// Escopos completos pra ter acesso a tudo que o checkout precisa
const SCOPES = [
  "cart-read",
  "cart-write",
  "companies-read",
  "coupons-read",
  "notifications-read",
  "orders-read",
  "products-read",
  "products-write",
  "shipping-calculate",
  "shipping-cancel",
  "shipping-checkout",
  "shipping-companies",
  "shipping-generate",
  "shipping-preview",
  "shipping-print",
  "shipping-share",
  "shipping-tracking",
  "ecommerce-shipping",
  "transactions-read",
  "users-read",
  "users-write",
].join(" ");

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(
      "❌ MELHOR_ENVIO_CLIENT_ID e MELHOR_ENVIO_CLIENT_SECRET precisam estar no .env.local",
    );
    process.exit(1);
  }

  const state = Math.random().toString(36).slice(2, 12);
  const authUrl = new URL(`${BASE_URL}/oauth/authorize`);
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", SCOPES);

  console.log("\n絆  ============================================================");
  console.log("    Melhor Envio — OAuth Setup (one-shot)");
  console.log("============================================================\n");
  console.log("PASSO 1 — Abra esta URL no navegador (Ctrl+clique):");
  console.log("\n  " + authUrl.toString() + "\n");
  console.log("PASSO 2 — Faça login no Melhor Envio sandbox (se não estiver logado)");
  console.log("PASSO 3 — Clique em \"Autorizar acesso\"");
  console.log("PASSO 4 — O navegador vai redirecionar pra https://kizunageek.com.br/...");
  console.log("           e dar erro de DNS — IGNORE o erro");
  console.log("PASSO 5 — Copie a URL INTEIRA da barra de endereço (com ?code=... no final)\n");

  const rl = readline.createInterface({ input, output });
  const pasted = (
    await rl.question("Cole a URL completa aqui e pressione Enter:\n> ")
  ).trim();
  rl.close();

  let code: string | null = null;
  let returnedState: string | null = null;
  try {
    const url = new URL(pasted);
    code = url.searchParams.get("code");
    returnedState = url.searchParams.get("state");
  } catch {
    // Talvez o usuário tenha colado só o código
    if (/^[A-Za-z0-9._-]+$/.test(pasted)) {
      code = pasted;
    }
  }

  if (!code) {
    console.error("\n❌ Não consegui extrair o `code`. Verifique se você colou a URL correta.");
    process.exit(1);
  }

  if (returnedState && returnedState !== state) {
    console.warn(
      `\n⚠  state divergente (enviado=${state}, recebido=${returnedState}). ` +
        `Em produção isso seria um sinal de CSRF — mas em dev local pode ser pq você usou link antigo. Seguindo mesmo assim.`,
    );
  }

  console.log("\n→ Trocando authorization code por access_token...\n");

  const tokenRes = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Kizuna Geek <niaupuca@gmail.com>",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error(`\n❌ ME respondeu ${tokenRes.status}:\n${errText}`);
    process.exit(1);
  }

  const data = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };

  console.log("✅ Tokens recebidos!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Cole estas linhas no .env.local (substituindo as antigas):\n");
  console.log(`MELHOR_ENVIO_TOKEN="${data.access_token}"`);
  console.log(`MELHOR_ENVIO_REFRESH_TOKEN="${data.refresh_token}"`);
  console.log(`MELHOR_ENVIO_TOKEN_EXPIRES_AT="${new Date(Date.now() + data.expires_in * 1000).toISOString()}"`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`Token válido por ${Math.round(data.expires_in / 86400)} dias.`);
  console.log("Renovação automática vai ser implementada no cliente ME (Fase 4).\n");

  // Testa rapidinho o token
  console.log("→ Validando token com chamada de teste a /api/v2/me/...\n");
  const testRes = await fetch(`${BASE_URL}/api/v2/me`, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: "application/json",
      "User-Agent": "Kizuna Geek <niaupuca@gmail.com>",
    },
  });

  if (testRes.ok) {
    const me = (await testRes.json()) as { firstname?: string; email?: string };
    console.log(`✅ Conectado como: ${me.firstname ?? "(sem nome)"} <${me.email ?? "(sem email)"}>`);
    console.log("\n絆 Pronto pra Fase 4.\n");
  } else {
    console.warn(`⚠ Token gerado mas teste falhou (${testRes.status}). Talvez precise verificar permissões do app.`);
  }
}

main().catch((err) => {
  console.error("Erro inesperado:", err);
  process.exit(1);
});
