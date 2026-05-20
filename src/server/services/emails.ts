import "server-only";
import { sendEmail } from "@/lib/resend";
import { WelcomeEmail } from "@/emails/welcome";
import { VerifyEmail } from "@/emails/verify-email";
import { PasswordResetEmail } from "@/emails/password-reset";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { PaymentApprovedEmail } from "@/emails/payment-approved";
import { PreorderReminderEmail } from "@/emails/preorder-reminder";
import { PreorderReleasedEmail } from "@/emails/preorder-released";
import { OrderShippedEmail } from "@/emails/order-shipped";
import { OrderDeliveredEmail } from "@/emails/order-delivered";
import { AbandonedCartEmail } from "@/emails/abandoned-cart";
import { formatBRL, formatDate } from "@/lib/utils";

/**
 * Camada de orquestração: cada função recebe o input "de domínio" (pedido,
 * usuário, etc) e monta o React template + sends via Resend.
 *
 * Todas são try/catch — falhas de email NUNCA bloqueiam o fluxo principal.
 */

// =====================================================================
// AUTENTICAÇÃO
// =====================================================================

export async function sendWelcomeEmail(user: {
  email: string;
  name: string;
}) {
  return sendEmail({
    to: user.email,
    subject: "Bem-vindo à Kizuna Geek 絆",
    react: WelcomeEmail({ name: user.name }),
  });
}

export async function sendVerifyEmail(user: {
  email: string;
  name: string;
  verifyUrl: string;
}) {
  return sendEmail({
    to: user.email,
    subject: "Confirme seu e-mail · Kizuna Geek",
    react: VerifyEmail({ name: user.name, verifyUrl: user.verifyUrl }),
  });
}

export async function sendPasswordResetEmail(input: {
  email: string;
  name: string;
  resetUrl: string;
  requestedFrom?: string;
}) {
  return sendEmail({
    to: input.email,
    subject: "Redefinir sua senha · Kizuna Geek",
    react: PasswordResetEmail({
      name: input.name,
      resetUrl: input.resetUrl,
      requestedFrom: input.requestedFrom,
    }),
  });
}

// =====================================================================
// PEDIDOS
// =====================================================================

export interface OrderEmailContext {
  email: string;
  name: string;
  orderNumber: string;
  totalCents: number; // pra formatar consistente
  items: ReadonlyArray<{
    productName: string;
    variantName: string;
    quantity: number;
    totalPriceCents: number;
  }>;
  hasPreOrder: boolean;
  expectedShipDate?: Date | null;
  shippingAddress: {
    recipientName: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

function formatAddress(addr: OrderEmailContext["shippingAddress"]) {
  return {
    recipient: addr.recipientName,
    line1: `${addr.street}, ${addr.number}${addr.complement ? ` · ${addr.complement}` : ""}`,
    line2: addr.neighborhood,
    cityState: `${addr.city}/${addr.state}`,
    zipCode: addr.zipCode.length === 8
      ? `${addr.zipCode.slice(0, 5)}-${addr.zipCode.slice(5)}`
      : addr.zipCode,
  };
}

export async function sendOrderConfirmation(ctx: OrderEmailContext) {
  return sendEmail({
    to: ctx.email,
    subject: `Pedido ${ctx.orderNumber} recebido`,
    react: OrderConfirmationEmail({
      customerName: ctx.name,
      orderNumber: ctx.orderNumber,
      total: formatBRL(ctx.totalCents / 100),
      items: ctx.items.map((i) => ({
        name: i.productName,
        variant: i.variantName,
        quantity: i.quantity,
        price: formatBRL(i.totalPriceCents / 100),
      })),
      hasPreOrder: ctx.hasPreOrder,
      expectedShipDate: ctx.expectedShipDate ? formatDate(ctx.expectedShipDate) : null,
      shippingAddress: formatAddress(ctx.shippingAddress),
    }),
  });
}

export async function sendPaymentApproved(
  ctx: OrderEmailContext & {
    paymentMethod: string;
    invoiceUrl?: string | null;
  },
) {
  return sendEmail({
    to: ctx.email,
    subject: `Pagamento aprovado · ${ctx.orderNumber}`,
    react: PaymentApprovedEmail({
      customerName: ctx.name,
      orderNumber: ctx.orderNumber,
      total: formatBRL(ctx.totalCents / 100),
      paymentMethod: ctx.paymentMethod,
      hasPreOrder: ctx.hasPreOrder,
      expectedShipDate: ctx.expectedShipDate ? formatDate(ctx.expectedShipDate) : null,
      invoiceUrl: ctx.invoiceUrl,
    }),
  });
}

export async function sendOrderShipped(input: {
  email: string;
  name: string;
  orderNumber: string;
  carrier: string;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  estimatedDays?: string | null;
}) {
  return sendEmail({
    to: input.email,
    subject: `${input.orderNumber} saiu pra entrega 🚚`,
    react: OrderShippedEmail({
      customerName: input.name,
      orderNumber: input.orderNumber,
      carrier: input.carrier,
      trackingCode: input.trackingCode,
      trackingUrl: input.trackingUrl,
      estimatedDays: input.estimatedDays,
    }),
  });
}

export async function sendOrderDelivered(input: {
  email: string;
  name: string;
  orderNumber: string;
  firstItemSlug?: string;
}) {
  return sendEmail({
    to: input.email,
    subject: `Pedido ${input.orderNumber} entregue 絆`,
    react: OrderDeliveredEmail({
      customerName: input.name,
      orderNumber: input.orderNumber,
      firstItemSlug: input.firstItemSlug,
    }),
  });
}

// =====================================================================
// PRÉ-VENDAS
// =====================================================================

export async function sendPreorderReminder(input: {
  email: string;
  name: string;
  productName: string;
  productSlug: string;
  releaseDate: Date;
  daysUntil: number;
}) {
  return sendEmail({
    to: input.email,
    subject: `${input.productName} lança em ${input.daysUntil} dias`,
    react: PreorderReminderEmail({
      customerName: input.name,
      productName: input.productName,
      productSlug: input.productSlug,
      releaseDate: formatDate(input.releaseDate),
      daysUntil: input.daysUntil,
    }),
  });
}

export async function sendPreorderReleased(input: {
  email: string;
  name: string;
  productName: string;
  orderNumber: string;
}) {
  return sendEmail({
    to: input.email,
    subject: `${input.productName} chegou — vamos despachar`,
    react: PreorderReleasedEmail({
      customerName: input.name,
      productName: input.productName,
      orderNumber: input.orderNumber,
    }),
  });
}

// =====================================================================
// CARRINHO ABANDONADO
// =====================================================================

export async function sendAbandonedCart(input: {
  email: string;
  name: string;
  itemPreview: string;
  resumeUrl?: string;
}) {
  return sendEmail({
    to: input.email,
    subject: "Você deixou peças na sacola",
    react: AbandonedCartEmail({
      customerName: input.name,
      itemPreview: input.itemPreview,
      resumeUrl: input.resumeUrl,
    }),
  });
}
