import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Recibo de venda não-fiscal — pra MEI dispensado de NF-e modelo 55.
 *
 * MEI vendendo pra PF abaixo de R$ 10k/mês está dispensado de emitir
 * NF-e (LC 123/2006 + RFB Resolução CGSN 140/2018). Mas o cliente
 * gosta de receber documentação da compra. Este endpoint gera um
 * recibo HTML estilizado pra impressão A4.
 *
 * UX:
 *  - Cliente acessa /api/recibo/[orderNumber] no browser
 *  - Vê o recibo bonito formatado
 *  - Ctrl+P → "Salvar como PDF" → arquivo pronto
 *
 * Auth:
 *  - Cliente acessa só seus próprios pedidos (compara userId)
 *  - Admin/STAFF acessa qualquer um (pra impressão no setor de envio)
 *
 * Quando virar ME e ativar Focus NFe, este endpoint continua existindo
 * como complemento — DANFE oficial via Focus + recibo simples nosso.
 */

const USE_DB = !!process.env.DATABASE_URL;

// Dados do emitente — reusa as mesmas envs do Focus NFe quando setadas
// (assim quando virar ME, mesmos valores servem pros 2 contextos).
const EMITTER = {
  // Razão social (nome jurídico) — vai como linha menor abaixo do nome fantasia
  legalName:
    process.env.FOCUS_NFE_NOME_EMITENTE ??
    process.env.RECEIPT_EMITTER_NAME ??
    "Kizuna Geek (MEI)",
  // Nome fantasia — vai como nome principal no recibo
  tradeName:
    process.env.FOCUS_NFE_FANTASIA_EMITENTE ??
    process.env.RECEIPT_EMITTER_TRADE_NAME ??
    "Kizuna Geek",
  cnpj:
    process.env.FOCUS_NFE_CNPJ_EMITENTE ??
    process.env.RECEIPT_EMITTER_CNPJ ??
    "00.000.000/0001-00",
  email:
    process.env.RECEIPT_EMITTER_EMAIL ?? "contato@kizunageek.com.br",
  address: {
    street:
      process.env.FOCUS_NFE_LOGRADOURO_EMITENTE ??
      process.env.RECEIPT_EMITTER_ADDRESS ??
      "Rua principal",
    number: process.env.FOCUS_NFE_NUMERO_EMITENTE ?? "100",
    district: process.env.FOCUS_NFE_BAIRRO_EMITENTE ?? "Centro",
    city: process.env.FOCUS_NFE_MUNICIPIO_EMITENTE ?? "Itapetininga",
    state: process.env.FOCUS_NFE_UF_EMITENTE ?? "SP",
    cep: process.env.FOCUS_NFE_CEP_EMITENTE ?? "18200000",
  },
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://kizunageek.com.br";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;

  if (!USE_DB) {
    return new NextResponse(htmlError("Recibo indisponível em modo demo."), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const session = await auth();
  if (!session?.user) {
    return new NextResponse(
      htmlError(
        "Faça login pra acessar o recibo.",
        `${APP_URL}/entrar?from=/api/recibo/${orderNumber}`,
      ),
      {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  const { prisma } = await import("@/lib/prisma");
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
  });

  if (!order) {
    return new NextResponse(htmlError("Pedido não encontrado."), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Auth: cliente só vê os próprios; admin/staff veem todos
  const isAdminOrStaff =
    session.user.role === "ADMIN" || session.user.role === "STAFF";
  if (!isAdminOrStaff && order.userId !== session.user.id) {
    return new NextResponse(htmlError("Você não tem acesso a este pedido."), {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Só gera recibo de pedidos pagos
  if (order.status === "PENDING" || order.status === "CANCELLED") {
    return new NextResponse(
      htmlError(
        `Recibo só fica disponível após pagamento confirmado. Status atual: ${order.status}.`,
      ),
      {
        status: 409,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  const html = buildReceiptHtml({
    order,
    isAdminOrStaff,
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Cache curto — admin pode editar pedido e re-imprimir
      "Cache-Control": "private, max-age=60",
    },
  });
}

// ===========================================================================
// HTML BUILDER
// ===========================================================================

interface OrderForReceipt {
  orderNumber: string;
  createdAt: Date;
  status: string;
  guestEmail: string | null;
  shippingRecipientName: string;
  shippingStreet: string;
  shippingNumber: string;
  shippingComplement: string | null;
  shippingNeighborhood: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  shippingCarrier: string;
  shippingService: string;
  trackingCode: string | null;
  subtotal: unknown; // Decimal
  shippingCost: unknown;
  discountAmount: unknown;
  total: unknown;
  customerNotes: string | null;
  items: Array<{
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unitPrice: unknown;
    totalPrice: unknown;
  }>;
  payment: {
    method: string;
    status: string;
    paidAt: Date | null;
  } | null;
}

function buildReceiptHtml({
  order,
  isAdminOrStaff,
}: {
  order: OrderForReceipt;
  isAdminOrStaff: boolean;
}) {
  const subtotal = formatBRL(Number(order.subtotal));
  const shipping = formatBRL(Number(order.shippingCost));
  const discount = Number(order.discountAmount);
  const total = formatBRL(Number(order.total));

  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td class="cell-num">${escape(item.sku)}</td>
          <td>
            <strong>${escape(item.productName)}</strong>
            <div class="muted">${escape(item.variantName)}</div>
          </td>
          <td class="cell-num">${item.quantity}</td>
          <td class="cell-num">${formatBRL(Number(item.unitPrice))}</td>
          <td class="cell-num">${formatBRL(Number(item.totalPrice))}</td>
        </tr>
      `,
    )
    .join("");

  const paymentLabel = (() => {
    if (!order.payment) return "Aguardando confirmação";
    const methodLabels: Record<string, string> = {
      CREDIT_CARD: "Cartão de crédito",
      PIX: "PIX",
      BOLETO: "Boleto bancário",
    };
    const method = methodLabels[order.payment.method] ?? order.payment.method;
    const status =
      order.payment.status === "SUCCEEDED" || order.payment.status === "APPROVED"
        ? "Aprovado"
        : order.payment.status;
    const paidAt = order.payment.paidAt
      ? formatDate(order.payment.paidAt)
      : "—";
    return `${method} · ${status}${order.payment.paidAt ? ` em ${paidAt}` : ""}`;
  })();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo · Pedido ${escape(order.orderNumber)} · Kizuna Geek</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --gold: #c9a874;
      --gold-ink: #1a1b1f;
      --ink: #1a1b1f;
      --ink-soft: #555558;
      --ink-mute: #8a8a8e;
      --hairline: #e6e2d8;
      --cream: #fbf8f1;
      --cream-deep: #f2eee2;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: "Cormorant Garamond", Georgia, serif;
      background: var(--cream);
      color: var(--ink);
      line-height: 1.45;
      padding: 32px 24px;
    }

    .page {
      max-width: 760px;
      margin: 0 auto;
      background: white;
      padding: 48px 56px;
      border: 1px solid var(--hairline);
      position: relative;
    }

    .watermark {
      position: absolute;
      top: 36px; right: 56px;
      font-family: "Noto Serif JP", serif;
      font-size: 96pt;
      font-weight: 900;
      color: var(--gold);
      opacity: 0.08;
      line-height: 1;
      pointer-events: none;
      user-select: none;
    }

    /* === HEADER === */
    header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 24px;
      align-items: start;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--hairline);
      margin-bottom: 28px;
    }
    .brand .kanji {
      font-family: "Noto Serif JP", serif;
      font-size: 28pt;
      font-weight: 900;
      color: var(--gold);
      line-height: 1;
    }
    .brand h1 {
      font-size: 18pt;
      font-weight: 600;
      margin-top: 6px;
    }
    .brand .tagline {
      font-family: "JetBrains Mono", monospace;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--ink-mute);
      margin-top: 8px;
    }
    .doc-title {
      text-align: right;
    }
    .doc-title .label {
      font-family: "JetBrains Mono", monospace;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--gold);
    }
    .doc-title h2 {
      font-size: 22pt;
      font-weight: 600;
      font-style: italic;
      margin-top: 4px;
    }
    .doc-title .order-num {
      font-family: "JetBrains Mono", monospace;
      font-size: 11pt;
      letter-spacing: 0.04em;
      color: var(--ink-soft);
      margin-top: 6px;
    }

    /* === META === */
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 28px;
    }
    .meta-block .label {
      font-family: "JetBrains Mono", monospace;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--gold);
      margin-bottom: 6px;
    }
    .meta-block strong { font-weight: 600; }
    .meta-block .muted {
      color: var(--ink-soft);
      font-size: 10pt;
      line-height: 1.45;
    }

    /* === ITEMS TABLE === */
    table.items {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 24px;
      font-size: 10pt;
    }
    table.items th {
      font-family: "JetBrains Mono", monospace;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--ink-mute);
      text-align: left;
      padding: 8px 8px 8px 0;
      border-bottom: 1px solid var(--ink);
      font-weight: 500;
    }
    table.items th.cell-num { text-align: right; }
    table.items td {
      padding: 10px 8px 10px 0;
      vertical-align: top;
      border-bottom: 1px solid var(--hairline);
    }
    table.items td.cell-num {
      text-align: right;
      font-family: "JetBrains Mono", monospace;
      font-size: 9.5pt;
      white-space: nowrap;
    }
    table.items td:first-child { padding-left: 0; }
    table.items td:last-child, table.items th:last-child { padding-right: 0; }
    table.items .muted {
      font-size: 8pt;
      color: var(--ink-mute);
      margin-top: 2px;
      font-family: "JetBrains Mono", monospace;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* === TOTALS === */
    .totals {
      max-width: 280px;
      margin-left: auto;
      margin-bottom: 32px;
    }
    .totals dl { display: grid; gap: 4px; }
    .totals .row {
      display: flex; justify-content: space-between;
      font-size: 10pt;
      padding: 4px 0;
    }
    .totals .row .label { color: var(--ink-soft); }
    .totals .row .value {
      font-family: "JetBrains Mono", monospace;
      font-size: 10pt;
    }
    .totals .row.discount .value { color: var(--gold); }
    .totals .total-row {
      display: flex; justify-content: space-between; align-items: baseline;
      border-top: 1px solid var(--ink);
      padding-top: 10px;
      margin-top: 10px;
    }
    .totals .total-row .label {
      font-family: "JetBrains Mono", monospace;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--ink);
    }
    .totals .total-row .value {
      font-size: 18pt;
      font-weight: 600;
      color: var(--ink);
      font-family: "Cormorant Garamond", serif;
    }

    /* === FOOTER LEGAL === */
    .legal {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--hairline);
      font-size: 8.5pt;
      line-height: 1.6;
      color: var(--ink-mute);
    }
    .legal strong { color: var(--ink-soft); }

    .signature {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--hairline);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      font-size: 9pt;
      color: var(--ink-soft);
    }
    .signature .label {
      font-family: "JetBrains Mono", monospace;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--gold);
      margin-bottom: 4px;
    }

    /* === ACTION BAR (não imprime) === */
    .action-bar {
      position: fixed;
      bottom: 16px; left: 50%;
      transform: translateX(-50%);
      background: var(--ink);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      font-family: "Cormorant Garamond", serif;
      font-size: 14px;
      display: flex; align-items: center; gap: 12px;
    }
    .action-bar button {
      background: var(--gold); color: var(--gold-ink);
      border: none;
      padding: 8px 16px;
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
    }
    .action-bar button:hover { opacity: 0.9; }
    .action-bar .hint {
      color: rgba(255,255,255,0.6);
      font-size: 12px;
    }

    /* === PRINT === */
    @media print {
      html, body { background: white; padding: 0; }
      .page {
        border: none;
        padding: 32px 40px;
        max-width: none;
      }
      .action-bar { display: none; }
      @page { size: A4; margin: 14mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <span class="watermark" aria-hidden="true">絆</span>

    <header>
      <div class="brand">
        <div class="kanji">絆</div>
        <h1>Kizuna Geek</h1>
        <div class="tagline">Os laços que colecionamos</div>
      </div>
      <div class="doc-title">
        <div class="label">Recibo de venda</div>
        <h2>nº ${escape(order.orderNumber)}</h2>
        <div class="order-num">Emitido em ${formatDate(new Date())}</div>
      </div>
    </header>

    <div class="meta">
      <div class="meta-block">
        <div class="label">Vendedor</div>
        <strong>${escape(EMITTER.tradeName)}</strong>
        <div class="muted" style="font-size: 9pt; opacity: 0.85; margin-top: 2px;">
          ${escape(EMITTER.legalName)}
        </div>
        <div class="muted" style="margin-top: 6px;">
          CNPJ ${escape(formatCnpj(EMITTER.cnpj))}<br>
          ${escape(EMITTER.address.street)}${EMITTER.address.number ? `, ${escape(EMITTER.address.number)}` : ""}<br>
          ${escape(EMITTER.address.district)} · ${escape(EMITTER.address.city)}/${escape(EMITTER.address.state)}<br>
          CEP ${formatCep(EMITTER.address.cep)}<br>
          ${escape(EMITTER.email)}
        </div>
      </div>

      <div class="meta-block">
        <div class="label">Comprador</div>
        <strong>${escape(order.shippingRecipientName)}</strong>
        <div class="muted">
          ${escape(order.shippingStreet)}, ${escape(order.shippingNumber)}${order.shippingComplement ? ` · ${escape(order.shippingComplement)}` : ""}<br>
          ${escape(order.shippingNeighborhood)} · ${escape(order.shippingCity)}/${escape(order.shippingState)}<br>
          CEP ${formatCep(order.shippingZipCode)}<br>
          ${order.guestEmail ? `<span>${escape(order.guestEmail)}</span>` : ""}
        </div>
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Produto</th>
          <th class="cell-num">Qtd</th>
          <th class="cell-num">Unitário</th>
          <th class="cell-num">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals">
      <dl>
        <div class="row">
          <span class="label">Subtotal</span>
          <span class="value">${subtotal}</span>
        </div>
        <div class="row">
          <span class="label">Frete (${escape(order.shippingCarrier)} ${escape(order.shippingService)})</span>
          <span class="value">${shipping}</span>
        </div>
        ${
          discount > 0
            ? `<div class="row discount">
                <span class="label">Desconto aplicado</span>
                <span class="value">− ${formatBRL(discount)}</span>
              </div>`
            : ""
        }
      </dl>
      <div class="total-row">
        <span class="label">Total pago</span>
        <span class="value">${total}</span>
      </div>
    </div>

    <div class="signature">
      <div>
        <div class="label">Forma de pagamento</div>
        ${escape(paymentLabel)}
      </div>
      ${
        order.trackingCode
          ? `<div>
              <div class="label">Código de rastreio</div>
              ${escape(order.trackingCode)}
            </div>`
          : ""
      }
    </div>

    <div class="legal">
      <p><strong>Documento não-fiscal.</strong> Este recibo comprova a compra realizada em <a href="${APP_URL}">kizunageek.com.br</a> e o pagamento confirmado, mas <strong>não substitui Nota Fiscal Eletrônica</strong>.</p>
      <p style="margin-top: 8px;">O vendedor é Microempreendedor Individual (MEI), dispensado da emissão de NF-e modelo 55 nas vendas a consumidor final pessoa física conforme Resolução CGSN nº 140/2018, art. 106. Em caso de exigência de NF-e (B2B, troca, garantia estendida), entre em contato pelo email acima.</p>
      <p style="margin-top: 8px;">Direitos do consumidor preservados pelo Código de Defesa do Consumidor (Lei 8.078/90) — 7 dias de arrependimento, 90 dias para vícios em produtos duráveis. Política completa em <a href="${APP_URL}/trocas">${APP_URL}/trocas</a>.</p>
    </div>
  </div>

  ${
    !isAdminOrStaff
      ? `<div class="action-bar">
          <span class="hint">Imprima ou salve como PDF (Ctrl+P)</span>
          <button onclick="window.print()">Imprimir / Salvar PDF</button>
        </div>`
      : `<div class="action-bar">
          <span class="hint">Modo admin</span>
          <button onclick="window.print()">Imprimir</button>
        </div>`
  }
</body>
</html>`;
}

function htmlError(message: string, retryUrl?: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recibo indisponível</title>
  <style>
    body { font-family: Georgia, serif; padding: 80px 20px; text-align: center; background: #fbf8f1; color: #1a1b1f; }
    .icon { font-size: 64px; opacity: 0.3; }
    h1 { font-size: 24px; margin: 16px 0 8px; }
    p { color: #555; }
    a { color: #c9a874; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="icon">絆</div>
  <h1>Recibo indisponível</h1>
  <p>${escape(message)}</p>
  ${retryUrl ? `<p style="margin-top: 20px;"><a href="${escape(retryUrl)}">Tentar novamente</a></p>` : ""}
</body>
</html>`;
}

// ===========================================================================
// HELPERS (inline pra não importar de @/lib/utils que tem 'use client')
// ===========================================================================

function escape(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
}

function formatCnpj(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
