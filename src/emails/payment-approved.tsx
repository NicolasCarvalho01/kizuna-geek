import * as React from "react";
import {
  EmailLayout,
  H1,
  P,
  Eyebrow,
  CTAButton,
  InfoBox,
  emailColors,
  APP_URL,
} from "./_layout";

interface PaymentApprovedEmailProps {
  customerName: string;
  orderNumber: string;
  total: string;
  paymentMethod: string;
  hasPreOrder: boolean;
  expectedShipDate?: string | null;
  invoiceUrl?: string | null;
}

export function PaymentApprovedEmail({
  customerName,
  orderNumber,
  total,
  paymentMethod,
  hasPreOrder,
  expectedShipDate,
  invoiceUrl,
}: PaymentApprovedEmailProps) {
  return (
    <EmailLayout preview={`Pagamento aprovado · ${orderNumber}`}>
      <Eyebrow>Pagamento aprovado</Eyebrow>
      <H1>
        Tudo certo,{" "}
        <em style={{ fontStyle: "italic", color: emailColors.gold }}>
          {customerName.split(" ")[0]}
        </em>
        .
      </H1>
      <P>
        Confirmamos o recebimento de <strong>{total}</strong> via{" "}
        <strong>{paymentMethod}</strong> pra o pedido {orderNumber}.
      </P>

      {hasPreOrder ? (
        <InfoBox>
          <P>
            Como este pedido contém pré-venda, vamos despachar a partir de{" "}
            <strong>{expectedShipDate}</strong>. Você recebe outro email com o
            código de rastreio quando postarmos.
          </P>
        </InfoBox>
      ) : (
        <P>
          A partir de agora, sua sacola entra na fila de preparação. Em até{" "}
          <strong>72h úteis</strong> você recebe um email com o código de rastreio.
        </P>
      )}

      <CTAButton href={`${APP_URL}/conta/pedidos/${orderNumber}`}>
        Ver detalhes do pedido
      </CTAButton>

      {invoiceUrl && (
        <P muted>
          NF-e disponível pra download:{" "}
          <a href={invoiceUrl} style={{ color: emailColors.gold }}>
            baixar PDF
          </a>
        </P>
      )}

      <P muted>
        Qualquer movimento no pedido fica visível no seu painel — e você sempre
        recebe email avisando.
      </P>
    </EmailLayout>
  );
}

export default PaymentApprovedEmail;
