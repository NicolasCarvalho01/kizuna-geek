import "server-only";

/**
 * Cliente HTTP para a API do Melhor Envio (v2).
 *
 * Funcionalidades implementadas nesta fase:
 *   - Cotação de frete (`/api/v2/me/shipment/calculate`)
 *   - Listagem de transportadoras (`/api/v2/me/shipment/companies`)
 *   - Refresh do access_token quando expira
 *
 * Funcionalidades pra Fase 5 (admin):
 *   - Adicionar envio ao carrinho ME
 *   - Comprar etiqueta
 *   - Gerar PDF
 *   - Marcar como postado
 *   - Rastreamento
 *
 * Docs oficiais: https://docs.melhorenvio.com.br
 */

const BASE_URL =
  process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br"
    : "https://www.melhorenvio.com.br";

const USER_AGENT = "Kizuna Geek <niaupuca@gmail.com>";

/** Indica se o Melhor Envio está configurado */
export const meConfigured = !!process.env.MELHOR_ENVIO_TOKEN;

/**
 * URL de produção do ME — sempre fixa, usada pra cotação real mesmo quando
 * outras operações estão em sandbox.
 *
 * Cotação é endpoint público e gratuito do ME — não cobra nada, não exige
 * saldo, não emite cobrança. Roteamos cotação pra produção quando
 * `MELHOR_ENVIO_LIVE_TOKEN` está setado, mantendo compra de etiqueta em
 * sandbox até o lojista ter CNPJ + saldo na conta de produção.
 */
const LIVE_BASE_URL = "https://www.melhorenvio.com.br";
const LIVE_TOKEN = process.env.MELHOR_ENVIO_LIVE_TOKEN;
export const meLiveQuoteEnabled = !!LIVE_TOKEN;

// =====================================================================
// TIPOS
// =====================================================================

export interface MeCalculateInput {
  from: { postal_code: string };
  to: { postal_code: string };
  products: ReadonlyArray<{
    id: string;
    width: number;       // cm
    height: number;      // cm
    length: number;      // cm
    weight: number;      // kg
    insurance_value: number; // R$
    quantity: number;
  }>;
  /** Opcional: filtrar por serviços específicos (id) */
  services?: string;
  /** Opcional: opções avançadas */
  options?: {
    receipt?: boolean;            // Aviso de recebimento
    own_hand?: boolean;           // Mão própria
    collect?: boolean;            // Coleta
    insurance_value?: number;
  };
}

export interface MeQuote {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range: { min: number; max: number };
  custom_delivery_time: number;
  custom_delivery_range: { min: number; max: number };
  packages: ReadonlyArray<{
    price: string;
    discount: string;
    format: string;
    weight: string;
    insurance_value: string;
    products: ReadonlyArray<{ id: string; quantity: number }>;
    dimensions: { height: number; width: number; length: number };
  }>;
  additional_services: {
    receipt: boolean;
    own_hand: boolean;
    collect: boolean;
  };
  company: {
    id: number;
    name: string;
    picture: string;
  };
  error?: string;
}

export interface MeUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  document?: string;
  phone?: { area: number; phone: number };
}

// =====================================================================
// AUTH — Refresh token quando próximo de expirar
// =====================================================================

interface RefreshedTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

/**
 * Renova o access_token usando o refresh_token.
 * Em dev: imprime as novas linhas pra colar no .env.local manualmente.
 * Em produção (Fase 7): persiste em DB e atualiza o singleton em memória.
 */
export async function refreshMeToken(): Promise<RefreshedTokens | null> {
  const refreshToken = process.env.MELHOR_ENVIO_REFRESH_TOKEN;
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    console.error("[me] Cannot refresh — missing CLIENT_ID/SECRET/REFRESH_TOKEN");
    return null;
  }

  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    console.error("[me] Refresh failed:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  console.warn(
    "[me] Token renovado. Atualize .env.local:\n" +
      `MELHOR_ENVIO_TOKEN="${data.access_token}"\n` +
      `MELHOR_ENVIO_REFRESH_TOKEN="${data.refresh_token}"\n` +
      `MELHOR_ENVIO_TOKEN_EXPIRES_AT="${expiresAt}"`,
  );

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
  };
}

/** Token atual (com renovação automática se estiver perto de expirar) */
async function getActiveToken(): Promise<string | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) return null;

  const expiresAt = process.env.MELHOR_ENVIO_TOKEN_EXPIRES_AT;
  if (expiresAt) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    // Renovar se faltam < 24h
    if (ms < 24 * 60 * 60 * 1000) {
      const refreshed = await refreshMeToken();
      if (refreshed) return refreshed.access_token;
    }
  }

  return token;
}

// =====================================================================
// HTTP HELPER
// =====================================================================

class MeApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "MeApiError";
  }
}

async function meRequest<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const token = await getActiveToken();
  if (!token) {
    throw new MeApiError(0, null, "Melhor Envio não configurado (sem token).");
  }

  const { json, ...rest } = init;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    throw new MeApiError(
      res.status,
      body,
      `Melhor Envio ${res.status}: ${path}`,
    );
  }

  return (await res.json()) as T;
}

// =====================================================================
// API PÚBLICA
// =====================================================================

/**
 * Cota frete entre origem e destino com a lista de produtos.
 * Retorna array de opções (Correios PAC, SEDEX, Jadlog, Loggi, etc.).
 *
 * Cotações expiradas ou inválidas vêm com `error` preenchido em vez de preço.
 *
 * Roteamento:
 *  - Se `MELHOR_ENVIO_LIVE_TOKEN` está setado → cota em PRODUÇÃO (real, gratuito,
 *    sem debitar saldo, valores corretos). Recomendado pra mostrar preço real
 *    pro cliente mesmo enquanto a compra de etiqueta ainda usa sandbox.
 *  - Senão → cota usando o token padrão (sandbox se SANDBOX=true, prod caso
 *    contrário).
 */
export async function calculateShipping(
  input: MeCalculateInput,
): Promise<MeQuote[]> {
  if (LIVE_TOKEN) {
    return liveQuoteRequest<MeQuote[]>("/api/v2/me/shipment/calculate", {
      method: "POST",
      json: input,
    });
  }
  return meRequest<MeQuote[]>("/api/v2/me/shipment/calculate", {
    method: "POST",
    json: input,
  });
}

/**
 * Variante de `meRequest` que sempre bate na URL de produção do ME e usa
 * o `MELHOR_ENVIO_LIVE_TOKEN`. Isolada pra não contaminar as outras chamadas
 * (compra de etiqueta, balance, etc.) que devem seguir o modo principal.
 */
async function liveQuoteRequest<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  if (!LIVE_TOKEN) {
    throw new MeApiError(0, null, "MELHOR_ENVIO_LIVE_TOKEN não configurado.");
  }
  const { json, ...rest } = init;
  const res = await fetch(`${LIVE_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${LIVE_TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    throw new MeApiError(
      res.status,
      body,
      `Melhor Envio LIVE ${res.status}: ${path}`,
    );
  }
  return (await res.json()) as T;
}

/** Lista transportadoras suportadas pela conta */
export async function listCompanies(): Promise<
  Array<{ id: number; name: string; picture: string }>
> {
  return meRequest<Array<{ id: number; name: string; picture: string }>>(
    "/api/v2/me/shipment/companies",
  );
}

/** Dados da conta atual (sanity check) */
export async function getMeProfile(): Promise<MeUser> {
  return meRequest<MeUser>("/api/v2/me");
}

/** Saldo da carteira ME */
export async function getMeBalance(): Promise<{ balance: number }> {
  return meRequest<{ balance: number }>("/api/v2/me/balance");
}

// =====================================================================
// SHIPMENT — fluxo de compra de etiqueta (admin)
// =====================================================================

export interface AddToCartInput {
  service: number; // id do serviço escolhido (PAC, SEDEX, etc.)
  from: AddressInput;
  to: AddressInput;
  products: Array<{
    name: string;
    quantity: string;
    unitary_value: string;
  }>;
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
  options: {
    insurance_value: number;
    receipt: boolean;
    own_hand: boolean;
    reverse?: boolean;
    non_commercial?: boolean;
  };
}

export interface AddressInput {
  name: string;
  phone?: string;
  email?: string;
  document?: string; // CPF/CNPJ
  postal_code: string;
  address: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state_abbr: string;
  country_id?: string;
}

export interface CartShipment {
  id: string;
  protocol: string;
  service_id: number;
  status: string;
  tracking?: string;
  self_tracking?: string;
}

/**
 * Adiciona um envio ao carrinho do Melhor Envio (etapa 1 de 3).
 * Ainda não compra — só prepara. Retorna o `id` do envio.
 */
export async function addShipmentToCart(input: AddToCartInput): Promise<CartShipment> {
  return meRequest<CartShipment>("/api/v2/me/cart", {
    method: "POST",
    json: input,
  });
}

/**
 * Compra (checkout) os envios no carrinho — debita saldo do ME (etapa 2 de 3).
 * Após isso, a etiqueta entra em "RELEASED" e pode ser gerada.
 */
export async function checkoutShipments(
  orderIds: string[],
): Promise<{ purchase: { id: string; orders: CartShipment[] } }> {
  return meRequest("/api/v2/me/shipment/checkout", {
    method: "POST",
    json: { orders: orderIds },
  });
}

/**
 * Gera o PDF da etiqueta (etapa 3 de 3). Retorna URL pública.
 */
export async function generateLabels(
  orderIds: string[],
): Promise<Record<string, { url: string }>> {
  return meRequest("/api/v2/me/shipment/generate", {
    method: "POST",
    json: { orders: orderIds },
  });
}

/**
 * Versão "print" — gera URL pra imprimir direto (sem download).
 */
export async function printLabels(orderIds: string[]): Promise<{ url: string }> {
  return meRequest("/api/v2/me/shipment/print", {
    method: "POST",
    json: { orders: orderIds, mode: "private" },
  });
}

/**
 * Lista status de rastreio de um pedido.
 */
export async function trackShipment(
  orderId: string,
): Promise<Record<string, { tracking?: string; status?: string }>> {
  return meRequest("/api/v2/me/shipment/tracking", {
    method: "POST",
    json: { orders: [orderId] },
  });
}

export { MeApiError };
