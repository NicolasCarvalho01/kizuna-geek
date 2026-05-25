"use server";

import { z } from "zod";
import {
  calculateShipping,
  meConfigured,
  meLiveQuoteEnabled,
  MeApiError,
  type MeQuote,
} from "@/lib/melhor-envio";
import { lookupCep, normalizeCep, isValidCep } from "@/lib/viacep";
import { auth } from "@/auth";
import type { ActionResult } from "@/server/actions/auth-actions";

const ORIGIN_ZIP = process.env.MELHOR_ENVIO_ORIGIN_ZIPCODE ?? "18200000";
const USE_DB = !!process.env.DATABASE_URL;

// =====================================================================
// SHAPE NORMALIZADO (UI usa este, não o do Melhor Envio direto)
// =====================================================================

export interface ShippingOption {
  /** ID do serviço no ME (1=PAC, 2=SEDEX, etc.) — vai pro Order.shippingServiceId */
  serviceId: number;
  /** Nome amigável: "PAC", "SEDEX", "Jadlog .Package" */
  serviceName: string;
  /** Transportadora: "Correios", "Jadlog", "Loggi" */
  carrier: string;
  /** URL pequena do logo da transportadora */
  carrierLogo: string;
  /** Preço final em reais */
  price: number;
  /** Prazo médio em dias úteis */
  deliveryDays: number;
  /** Faixa de prazo (min-max) */
  deliveryRange: { min: number; max: number };
  /** True se a cotação retornou erro (esgotado, dimensões inválidas, etc.) */
  error: string | null;
}

interface ShippingQuoteRequest {
  destinationZip: string;
  items: ReadonlyArray<{
    productId: string;
    /** Peso unitário em GRAMAS — DB armazena assim */
    weightGrams: number;
    /** Dimensões em cm */
    length: number;
    width: number;
    height: number;
    /** Valor unitário em reais */
    unitPrice: number;
    quantity: number;
  }>;
  /** ID do carrinho (opcional, pra cachear ShippingQuote) */
  cartId?: string;
}

// =====================================================================
// COTAÇÃO COM CACHE
// =====================================================================

const requestSchema = z.object({
  destinationZip: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      weightGrams: z.number().positive(),
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export async function quoteShipping(
  input: ShippingQuoteRequest,
): Promise<ActionResult<{ options: ShippingOption[]; destinationZip: string }>> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos pra cotação." };
  }

  const destinationZip = normalizeCep(input.destinationZip);
  if (!isValidCep(destinationZip)) {
    return { ok: false, error: "CEP inválido — digite 8 dígitos." };
  }

  if (!meConfigured) {
    return {
      ok: false,
      error:
        "Frete em modo demo (sem credenciais do Melhor Envio). Configure o token.",
    };
  }

  // Tenta usar cache da DB (cotações expiram em 1h)
  if (USE_DB && input.cartId) {
    const cached = await readCachedQuote(input.cartId, destinationZip);
    if (cached) return { ok: true, data: cached };
  }

  try {
    const quotes = await calculateShipping({
      from: { postal_code: ORIGIN_ZIP },
      to: { postal_code: destinationZip },
      products: parsed.data.items.map((item) => ({
        id: item.productId,
        // ME espera dimensões em CM e peso em KG
        width: item.width,
        height: item.height,
        length: item.length,
        weight: item.weightGrams / 1000,
        insurance_value: item.unitPrice * item.quantity,
        quantity: item.quantity,
      })),
    });

    let options = quotes
      .map(normalizeQuote)
      .sort((a, b) => {
        // Erros pro final
        if (a.error && !b.error) return 1;
        if (!a.error && b.error) return -1;
        return a.price - b.price;
      });

    // Fallback de dev: sandbox do ME costuma só retornar Jadlog e/ou só "indisponível".
    // Se houver < 2 opções válidas, injeta cotações mock pra desbloquear o teste do checkout.
    //
    // Desativado quando MELHOR_ENVIO_LIVE_TOKEN está setado (cotação real em
    // produção já entrega valores corretos — mock só atrapalha).
    const validQuotes = options.filter((o) => !o.error && o.price > 0);
    const sandboxMode = process.env.MELHOR_ENVIO_SANDBOX === "true";
    if (sandboxMode && !meLiveQuoteEnabled && validQuotes.length < 2) {
      const mocked = buildMockQuotes(parsed.data.items, destinationZip);
      options = [...validQuotes, ...mocked].sort((a, b) => a.price - b.price);
      console.info(
        `[shipping] sandbox fallback ativado — ${validQuotes.length} reais + ${mocked.length} mock`,
      );
    }

    // Persistir cache se houver cartId + DB
    if (USE_DB && input.cartId) {
      await cacheQuote({
        cartId: input.cartId,
        originZip: ORIGIN_ZIP,
        destinationZip,
        productsPayload: parsed.data.items,
        quotesPayload: quotes,
      });
    }

    return { ok: true, data: { options, destinationZip } };
  } catch (err) {
    if (err instanceof MeApiError) {
      console.error("[shipping] ME error:", err.status, err.body);
      return {
        ok: false,
        error:
          err.status === 401
            ? "Token do Melhor Envio expirado. Rode `npm run me:auth` pra renovar."
            : `Não foi possível cotar o frete (${err.status}). Tente novamente.`,
      };
    }
    console.error("[shipping] unexpected:", err);
    return { ok: false, error: "Erro inesperado ao cotar frete." };
  }
}

function normalizeQuote(q: MeQuote): ShippingOption {
  return {
    serviceId: q.id,
    serviceName: q.name,
    carrier: q.company.name,
    carrierLogo: q.company.picture,
    price: q.price ? Number(q.price) : 0,
    deliveryDays: q.delivery_time ?? q.custom_delivery_time ?? 0,
    deliveryRange: q.delivery_range ?? q.custom_delivery_range ?? { min: 0, max: 0 },
    error: q.error ?? null,
  };
}

// =====================================================================
// MOCK QUOTES — fallback de DEV pra sandbox limitado do ME
// =====================================================================

/**
 * Gera cotações fake quando o sandbox do Melhor Envio retorna pouco/nada.
 *
 * Preços e prazos calibrados pra refletir tabela aproximada dos Correios e
 * transportadoras nacionais. NÃO é cotação real — em produção (token live),
 * essa função nunca é chamada (filtrada por `MELHOR_ENVIO_SANDBOX === "true"`).
 */
function buildMockQuotes(
  items: ReadonlyArray<{
    weightGrams: number;
    length: number;
    width: number;
    height: number;
    unitPrice: number;
    quantity: number;
  }>,
  destinationZip: string,
): ShippingOption[] {
  const totalWeightGrams = items.reduce(
    (acc, i) => acc + i.weightGrams * i.quantity,
    0,
  );
  const totalValue = items.reduce(
    (acc, i) => acc + i.unitPrice * i.quantity,
    0,
  );

  // Estima distância pelo prefixo do CEP destino vs origem (Itapetininga 18200)
  const originPrefix = 18;
  const destinationPrefix = Number(destinationZip.slice(0, 2)) || 99;
  const distanceFactor = Math.min(
    3,
    Math.max(1, Math.abs(destinationPrefix - originPrefix) / 15 + 1),
  );

  // Seguro: 1% do valor (cap em R$ 5)
  const insurance = Math.min(5, totalValue * 0.01);

  // Volumetria: assume densidade real (Correios cobra max(peso real, peso volumétrico))
  // Peso volumétrico = (L × W × H) / 6000 em kg (regra Correios)
  const volumetricKg = items.reduce(
    (acc, i) => acc + ((i.length * i.width * i.height) / 6000) * i.quantity,
    0,
  );
  const realKg = totalWeightGrams / 1000;
  const billedKg = Math.max(realKg, volumetricKg);

  // Templates de cotação — preço base + por kg × fator distância
  const templates: Array<{
    serviceId: number;
    serviceName: string;
    carrier: string;
    base: number;
    perKg: number;
    minDays: number;
    maxDays: number;
  }> = [
    { serviceId: 1, serviceName: "PAC", carrier: "Correios", base: 16, perKg: 4, minDays: 5, maxDays: 9 },
    { serviceId: 2, serviceName: "SEDEX", carrier: "Correios", base: 26, perKg: 8, minDays: 2, maxDays: 4 },
    { serviceId: 3, serviceName: ".Package", carrier: "Jadlog", base: 19, perKg: 5, minDays: 4, maxDays: 7 },
    { serviceId: 4, serviceName: "Loggi", carrier: "Loggi", base: 22, perKg: 6, minDays: 3, maxDays: 6 },
  ];

  return templates.map((t) => {
    const price = Number(
      (t.base * distanceFactor + t.perKg * billedKg + insurance).toFixed(2),
    );
    const minDays = Math.ceil(t.minDays * distanceFactor);
    const maxDays = Math.ceil(t.maxDays * distanceFactor);
    return {
      serviceId: t.serviceId,
      serviceName: `${t.serviceName} (estimado)`,
      carrier: t.carrier,
      carrierLogo: "",
      price,
      deliveryDays: maxDays,
      deliveryRange: { min: minDays, max: maxDays },
      error: null,
    };
  });
}

// =====================================================================
// CACHE (ShippingQuote table)
// =====================================================================

async function readCachedQuote(
  cartId: string,
  destinationZip: string,
): Promise<{ options: ShippingOption[]; destinationZip: string } | null> {
  const { prisma } = await import("@/lib/prisma");
  const cached = await prisma.shippingQuote.findFirst({
    where: {
      cartId,
      destinationZipCode: destinationZip,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!cached) return null;

  const quotes = cached.quotesPayload as unknown as MeQuote[];
  const options = quotes
    .map(normalizeQuote)
    .sort((a, b) => {
      if (a.error && !b.error) return 1;
      if (!a.error && b.error) return -1;
      return a.price - b.price;
    });

  return { options, destinationZip };
}

async function cacheQuote(input: {
  cartId: string;
  originZip: string;
  destinationZip: string;
  productsPayload: unknown;
  quotesPayload: MeQuote[];
}) {
  const { prisma } = await import("@/lib/prisma");
  // 1 hora
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.shippingQuote.create({
    data: {
      cartId: input.cartId,
      originZipCode: input.originZip,
      destinationZipCode: input.destinationZip,
      productsPayload: input.productsPayload as never,
      quotesPayload: input.quotesPayload as never,
      expiresAt,
    },
  });
}

// =====================================================================
// VIA CEP — autopreenchimento
// =====================================================================

export async function fetchCepAddress(cep: string): Promise<
  ActionResult<{
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    complement: string | null;
  }>
> {
  const result = await lookupCep(cep);
  if (!result.ok) {
    const messages = {
      invalid_format: "CEP inválido — digite 8 dígitos.",
      not_found: "CEP não encontrado.",
      network_error: "Falha de conexão com o ViaCEP. Tente novamente.",
    };
    return { ok: false, error: messages[result.error] };
  }

  return {
    ok: true,
    data: {
      cep: result.address.cep,
      street: result.address.street,
      neighborhood: result.address.neighborhood,
      city: result.address.city,
      state: result.address.state,
      complement: result.address.complement,
    },
  };
}

// Não-action — util pra page server components (sem precisar marcar "use server")
void auth; // garante que o import permanece (referência futura pra checkout protegido)
