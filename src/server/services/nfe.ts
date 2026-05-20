import "server-only";
import {
  emitNfe,
  cancelNfe,
  focusNfeConfigured,
  FocusNfeError,
  type NfeEmitInput,
} from "@/lib/focus-nfe";

const USE_DB = !!process.env.DATABASE_URL;

/**
 * Orquestra a emissão de NF-e a partir de um pedido.
 *
 * Idempotência: se já existe Invoice pra o pedido com status AUTHORIZED,
 * retorna ela direto. Se status ERROR ou REJECTED, permite re-emitir com
 * nova reference.
 *
 * Pra produção: requer dados fiscais do emitente em envs:
 *   - FOCUS_NFE_CNPJ_EMITENTE
 *   - FOCUS_NFE_IE_EMITENTE
 *   - FOCUS_NFE_NOME_EMITENTE
 *   - FOCUS_NFE_LOGRADOURO_EMITENTE
 *   - etc.
 */

const EMITTER = {
  cnpj: process.env.FOCUS_NFE_CNPJ_EMITENTE ?? "00000000000000",
  ie: process.env.FOCUS_NFE_IE_EMITENTE ?? "ISENTO",
  nome: process.env.FOCUS_NFE_NOME_EMITENTE ?? "KIZUNA GEEK COMÉRCIO DIGITAL LTDA",
  fantasia: process.env.FOCUS_NFE_FANTASIA_EMITENTE ?? "Kizuna Geek",
  logradouro: process.env.FOCUS_NFE_LOGRADOURO_EMITENTE ?? "Rua principal",
  numero: process.env.FOCUS_NFE_NUMERO_EMITENTE ?? "100",
  bairro: process.env.FOCUS_NFE_BAIRRO_EMITENTE ?? "Centro",
  municipio: process.env.FOCUS_NFE_MUNICIPIO_EMITENTE ?? "Itapetininga",
  uf: process.env.FOCUS_NFE_UF_EMITENTE ?? "SP",
  cep: process.env.FOCUS_NFE_CEP_EMITENTE ?? "18200000",
  regime: (process.env.FOCUS_NFE_REGIME_EMITENTE as "1" | "2" | "3") ?? "1", // 1 = Simples
};

export interface EmitInvoiceResult {
  ok: boolean;
  status?: "AUTHORIZED" | "PROCESSING" | "REJECTED" | "ERROR";
  invoiceId?: string;
  error?: string;
}

/**
 * Emite NF-e pro pedido. Chamado:
 *  - Em `markAsPosted` (admin) → quando lojista efetivamente despacha
 *  - Pra pré-vendas: respeita regra fiscal — só emite no envio, nunca no pagamento
 */
export async function emitInvoiceForOrder(
  orderId: string,
): Promise<EmitInvoiceResult> {
  if (!USE_DB) {
    return { ok: false, error: "DB obrigatório." };
  }

  const { prisma } = await import("@/lib/prisma");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { name: true, email: true, cpf: true } },
      invoice: true,
    },
  });

  if (!order) {
    return { ok: false, error: "Pedido não encontrado." };
  }

  // Idempotência — se já tem NF-e autorizada, não re-emite
  if (order.invoice?.status === "AUTHORIZED") {
    return {
      ok: true,
      status: "AUTHORIZED",
      invoiceId: order.invoice.id,
    };
  }

  // Referência única — combina orderNumber + retry count
  const retryCount = (order.invoice?.retryCount ?? 0) + 1;
  const ref = `${order.orderNumber}-R${retryCount}`;

  // Cria/atualiza Invoice com status PROCESSING
  const invoice = order.invoice
    ? await prisma.invoice.update({
        where: { id: order.invoice.id },
        data: {
          status: "PROCESSING",
          providerReference: ref,
          retryCount,
          rejectionReason: null,
        },
      })
    : await prisma.invoice.create({
        data: {
          orderId: order.id,
          provider: "FOCUS_NFE",
          providerReference: ref,
          status: "PROCESSING",
          nfeSeries: "1",
          retryCount: 1,
        },
      });

  // Monta payload
  const payload: NfeEmitInput = {
    ref,
    natureza_operacao: "Venda de mercadoria",
    data_emissao: new Date().toISOString(),
    tipo_documento: "1",
    finalidade_emissao: "1",
    presenca_comprador: "2",

    cnpj_emitente: EMITTER.cnpj,
    inscricao_estadual_emitente: EMITTER.ie,
    nome_emitente: EMITTER.nome,
    nome_fantasia_emitente: EMITTER.fantasia,
    logradouro_emitente: EMITTER.logradouro,
    numero_emitente: EMITTER.numero,
    bairro_emitente: EMITTER.bairro,
    municipio_emitente: EMITTER.municipio,
    uf_emitente: EMITTER.uf,
    cep_emitente: EMITTER.cep,
    regime_tributario_emitente: EMITTER.regime,

    nome_destinatario: order.shippingRecipientName,
    cpf_destinatario: order.user?.cpf ?? undefined,
    email_destinatario: order.user?.email ?? order.guestEmail ?? "",
    logradouro_destinatario: order.shippingStreet,
    numero_destinatario: order.shippingNumber,
    complemento_destinatario: order.shippingComplement ?? undefined,
    bairro_destinatario: order.shippingNeighborhood,
    municipio_destinatario: order.shippingCity,
    uf_destinatario: order.shippingState,
    cep_destinatario: order.shippingZipCode,
    pais_destinatario: order.shippingCountry,

    items: order.items.map((item, idx) => ({
      numero_item: String(idx + 1),
      codigo_produto: item.sku,
      descricao: item.productName,
      cfop: order.shippingState === EMITTER.uf ? "5102" : "6102", // 5xxx dentro UF, 6xxx fora
      unidade_comercial: "UN",
      quantidade_comercial: String(item.quantity),
      valor_unitario_comercial: Number(item.unitPrice).toFixed(2),
      valor_bruto: Number(item.totalPrice).toFixed(2),
      unidade_tributavel: "UN",
      quantidade_tributavel: String(item.quantity),
      valor_unitario_tributavel: Number(item.unitPrice).toFixed(2),
      ncm: "95030000", // Brinquedos / colecionáveis · ajustar conforme tipo
      origem: "0",
      icms_situacao_tributaria: "102", // Simples Nacional sem permissão de crédito
    })),

    valor_frete: Number(order.shippingCost).toFixed(2),
    valor_desconto:
      Number(order.discountAmount) > 0
        ? Number(order.discountAmount).toFixed(2)
        : undefined,
  };

  try {
    const response = await emitNfe(payload);

    if (response.status === "autorizado") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "AUTHORIZED",
          nfeNumber: response.numero ?? null,
          nfeSeries: response.serie ?? "1",
          accessKey: response.chave_nfe ?? null,
          pdfUrl: response.caminho_danfe
            ? `https://api.focusnfe.com.br${response.caminho_danfe}`
            : null,
          xmlUrl: response.caminho_xml_nota_fiscal
            ? `https://api.focusnfe.com.br${response.caminho_xml_nota_fiscal}`
            : null,
          issuedAt: new Date(),
          lastWebhookPayload: response as never,
        },
      });
      return { ok: true, status: "AUTHORIZED", invoiceId: invoice.id };
    }

    if (response.status === "processando_autorizacao") {
      // Webhook irá completar
      return { ok: true, status: "PROCESSING", invoiceId: invoice.id };
    }

    // Erro
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "REJECTED",
        rejectionReason: response.mensagem_sefaz ?? "Rejeitada pelo SEFAZ.",
        lastWebhookPayload: response as never,
      },
    });
    return {
      ok: false,
      status: "REJECTED",
      error: response.mensagem_sefaz ?? "NF-e rejeitada.",
    };
  } catch (err) {
    const message =
      err instanceof FocusNfeError
        ? `Focus NFe ${err.status}: ${JSON.stringify(err.body).slice(0, 200)}`
        : err instanceof Error
          ? err.message
          : "Erro desconhecido";

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "ERROR",
        rejectionReason: message,
      },
    });

    console.error("[nfe] emit failed:", message);
    return { ok: false, status: "ERROR", error: message };
  }
}

/**
 * Cancela uma NF-e (regra fiscal: até 24h após autorização).
 */
export async function cancelInvoiceForOrder(
  orderId: string,
  justificativa: string,
): Promise<EmitInvoiceResult> {
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };
  if (justificativa.trim().length < 15) {
    return {
      ok: false,
      error: "Justificativa precisa ter pelo menos 15 caracteres (regra SEFAZ).",
    };
  }

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { invoice: true },
  });

  if (!order?.invoice || order.invoice.status !== "AUTHORIZED") {
    return {
      ok: false,
      error: "Pedido sem NF-e autorizada ou já cancelada.",
    };
  }

  // Verifica regra 24h
  if (order.invoice.issuedAt) {
    const hoursSinceIssue =
      (Date.now() - order.invoice.issuedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceIssue > 24) {
      return {
        ok: false,
        error: "NF-e emitida há mais de 24h — cancelamento bloqueado pelo SEFAZ. Use carta de correção.",
      };
    }
  }

  try {
    const response = await cancelNfe(order.invoice.providerReference, justificativa);

    if (response.status === "cancelado") {
      await prisma.invoice.update({
        where: { id: order.invoice.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: justificativa,
        },
      });
      return { ok: true, status: "AUTHORIZED" };
    }

    return {
      ok: false,
      error: response.mensagem_sefaz ?? "Falha no cancelamento.",
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro desconhecido";
    return { ok: false, error: message };
  }
}

export { focusNfeConfigured };
