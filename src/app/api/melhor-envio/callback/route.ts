import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * OAuth callback do Melhor Envio.
 *
 * Fluxo:
 *   1. Admin clica em "Conectar Melhor Envio" no painel admin (Fase 5)
 *   2. Redirecionado pra `${ME}/oauth/authorize?client_id=...&redirect_uri=https://kizunageek.com.br/api/melhor-envio/callback&...`
 *   3. ME redireciona pra cá com `?code=...&state=...`
 *   4. Aqui trocamos code por access_token + refresh_token
 *   5. Persistimos os tokens (em produção: em DB encriptado, não env)
 *
 * Em dev, isso só roda se você apontar o redirect URI do app ME pra esta URL
 * (precisa estar em HTTPS — ngrok ou domínio público real). Por enquanto, em
 * dev usamos `npm run me:auth` (script CLI).
 *
 * TODO Fase 5: persistir token em modelo `ApiCredential` ou similar,
 * proteger por role ADMIN, mostrar status de conexão no admin.
 */

const BASE_URL =
  process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br"
    : "https://www.melhorenvio.com.br";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");

  if (error) {
    return NextResponse.json(
      { error, error_description: errorDesc },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code ausente." },
      { status: 400 },
    );
  }

  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "MELHOR_ENVIO_CLIENT_ID/SECRET/REDIRECT_URI não configurados." },
      { status: 503 },
    );
  }

  const tokenRes = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Kizuna Geek <contato@kizunageek.com.br>",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    return NextResponse.json(
      { error: "Falha ao trocar code por token", status: tokenRes.status, body },
      { status: 502 },
    );
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // TODO Fase 5: persistir em DB (modelo ApiCredential) com criptografia.
  // Por enquanto, redireciona pra página admin com instruções de copy/paste.
  const params = new URLSearchParams({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  });

  return NextResponse.redirect(
    new URL(`/admin/integracoes/melhor-envio?${params}`, req.url),
  );
}
