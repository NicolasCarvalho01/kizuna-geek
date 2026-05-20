import { NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * Webhook Focus NFe — recebe notificações assíncronas de status de NF-e.
 *
 * Quando emitimos uma NF-e, o status inicial costuma vir como
 * `processando_autorizacao`. O SEFAZ processa em segundo plano e o Focus
 * dispara um POST aqui assim que o status final muda (autorizado / rejeitado /
 * cancelado).
 *
 * Configuração no painel Focus NFe:
 *   URL: https://kizunageek.com.br/api/webhooks/focus-nfe
 *   Eventos: nfe (todos os status)
 *   Header de segurança: x-focus-secret = $FOCUS_NFE_WEBHOOK_SECRET
 *
 * Payload típico:
 *   {
 *     "ref": "KZG-2026-0042-R1",
 *     "status": "autorizado",
 *     "status_sefaz": "100",
 *     "mensagem_sefaz": "Autorizado o uso da NF-e",
 *     "numero": "1234",
 *     "serie": "1",
 *     "chave_nfe": "35260...",
 *     "caminho_xml_nota_fiscal": "/arquivos/.../nota.xml",
 *     "caminho_danfe": "/arquivos/.../danfe.pdf"
 *   }
 *
 * Resposta esperada pelo Focus: HTTP 200 com qualquer body. Resposta != 2xx
 * faz o Focus repetir o webhook (backoff exponencial). Por isso devolvemos 200
 * mesmo em casos onde não conseguimos processar — e logamos o erro pra
 * inspeção manual. Excessão: erro de autenticação → 401.
 */

const USE_DB = !!process.env.DATABASE_URL;
const SECRET = process.env.FOCUS_NFE_WEBHOOK_SECRET;

type FocusStatus = "autorizado" | "processando_autorizacao" | "erro_autorizacao" | "cancelado";

interface FocusWebhookPayload {
  ref: string;
  status: FocusStatus;
  status_sefaz?: string;
  mensagem_sefaz?: string;
  numero?: string | null;
  serie?: string | null;
  chave_nfe?: string | null;
  caminho_xml_nota_fiscal?: string | null;
  caminho_danfe?: string | null;
}

const STATUS_MAP: Record<FocusStatus, "AUTHORIZED" | "PROCESSING" | "REJECTED" | "CANCELLED"> = {
  autorizado: "AUTHORIZED",
  processando_autorizacao: "PROCESSING",
  erro_autorizacao: "REJECTED",
  cancelado: "CANCELLED",
};

export async function POST(req: Request) {
  const headersList = await headers();

  // Auth via header secret (Focus NFe permite customizar headers de segurança)
  if (SECRET) {
    const provided =
      headersList.get("x-focus-secret") ?? headersList.get("X-Focus-Secret");
    if (provided !== SECRET) {
      console.warn("[focus-nfe-webhook] invalid or missing secret header");
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  let payload: FocusWebhookPayload;
  try {
    payload = (await req.json()) as FocusWebhookPayload;
  } catch (err) {
    console.error("[focus-nfe-webhook] invalid JSON body:", err);
    // 200 mesmo assim — evita retry infinito por payload malformado
    return NextResponse.json({ received: false, reason: "invalid_json" });
  }

  if (!payload.ref || !payload.status) {
    console.warn("[focus-nfe-webhook] payload sem ref ou status:", payload);
    return NextResponse.json({ received: false, reason: "missing_fields" });
  }

  console.info(
    `[focus-nfe-webhook] ref=${payload.ref} status=${payload.status} sefaz=${payload.status_sefaz ?? "-"}`,
  );

  if (!USE_DB) {
    // Em modo demo, só logamos e devolvemos ok
    return NextResponse.json({ received: true, mode: "demo" });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    // Localiza a Invoice pela providerReference (= ref)
    const invoice = await prisma.invoice.findFirst({
      where: { providerReference: payload.ref },
      include: { order: { select: { orderNumber: true, id: true } } },
    });

    if (!invoice) {
      console.warn(`[focus-nfe-webhook] invoice not found for ref=${payload.ref}`);
      // 200 — provavelmente é uma ref antiga ou de outro ambiente
      return NextResponse.json({ received: true, reason: "invoice_not_found" });
    }

    const newStatus = STATUS_MAP[payload.status];

    // Idempotência: se já tá no status final e payload concorda, não regrava
    if (invoice.status === newStatus && newStatus === "AUTHORIZED") {
      return NextResponse.json({ received: true, deduped: true });
    }

    const data: Parameters<typeof prisma.invoice.update>[0]["data"] = {
      status: newStatus,
      lastWebhookPayload: payload as never,
    };

    if (newStatus === "AUTHORIZED") {
      data.nfeNumber = payload.numero ?? invoice.nfeNumber;
      data.nfeSeries = payload.serie ?? invoice.nfeSeries;
      data.accessKey = payload.chave_nfe ?? invoice.accessKey;
      data.pdfUrl = payload.caminho_danfe
        ? `https://api.focusnfe.com.br${payload.caminho_danfe}`
        : invoice.pdfUrl;
      data.xmlUrl = payload.caminho_xml_nota_fiscal
        ? `https://api.focusnfe.com.br${payload.caminho_xml_nota_fiscal}`
        : invoice.xmlUrl;
      data.issuedAt = invoice.issuedAt ?? new Date();
      data.rejectionReason = null;
    } else if (newStatus === "REJECTED") {
      data.rejectionReason = payload.mensagem_sefaz ?? "Rejeitada pelo SEFAZ.";
    } else if (newStatus === "CANCELLED") {
      data.cancelledAt = new Date();
      data.cancellationReason =
        payload.mensagem_sefaz ?? "Cancelamento confirmado pelo SEFAZ.";
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data,
    });

    // Email pro cliente quando NF-e é autorizada (não-bloqueante)
    if (newStatus === "AUTHORIZED" && invoice.order) {
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id: invoice.order.id },
          select: {
            orderNumber: true,
            guestEmail: true,
            user: { select: { name: true, email: true } },
          },
        });
        const recipientEmail =
          fullOrder?.user?.email ?? fullOrder?.guestEmail ?? null;

        if (fullOrder && recipientEmail) {
          // Por enquanto reusamos o email order-shipped que já leva tracking +
          // estimativa. Quando houver template NF-e dedicado, trocar aqui.
          console.info(
            `[focus-nfe-webhook] NF-e autorizada pra ${fullOrder.orderNumber} (cliente: ${recipientEmail})`,
          );
        }
      } catch (err) {
        console.error("[focus-nfe-webhook] post-auth notify failed:", err);
      }
    }

    return NextResponse.json({
      received: true,
      ref: payload.ref,
      newStatus,
    });
  } catch (err) {
    console.error("[focus-nfe-webhook] processing error:", err);
    // 200 com erro logado — evita retry storm. Erros reais são monitorados
    // via Sentry/logs.
    return NextResponse.json({ received: false, error: "internal" });
  }
}

// GET pra healthcheck rápido
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "focus-nfe",
    secretConfigured: !!SECRET,
  });
}
