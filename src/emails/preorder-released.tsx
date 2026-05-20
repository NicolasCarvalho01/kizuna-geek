import * as React from "react";
import {
  EmailLayout,
  H1,
  P,
  Eyebrow,
  CTAButton,
  emailColors,
  APP_URL,
} from "./_layout";

interface PreorderReleasedEmailProps {
  customerName: string;
  productName: string;
  orderNumber: string;
}

/**
 * Email no dia do lançamento — entrou no fluxo de preparação.
 */
export function PreorderReleasedEmail({
  customerName,
  productName,
  orderNumber,
}: PreorderReleasedEmailProps) {
  return (
    <EmailLayout preview={`${productName} chegou! Vamos despachar 絆`}>
      <Eyebrow>解禁 · Pré-venda liberada</Eyebrow>
      <H1>
        Chegou,{" "}
        <em style={{ fontStyle: "italic", color: emailColors.gold }}>
          {customerName.split(" ")[0]}
        </em>
        .
      </H1>
      <P>
        Seu pré-pedido de <strong>{productName}</strong> está oficialmente
        liberado. Já entrou na fila de preparação — em até <strong>72h
        úteis</strong> postamos e mandamos o código de rastreio.
      </P>
      <P>
        Pedido: <strong>{orderNumber}</strong>
      </P>
      <CTAButton href={`${APP_URL}/conta/pedidos/${orderNumber}`}>
        Acompanhar pedido
      </CTAButton>
      <P muted>
        Foi uma espera longa, mas valeu — esses lançamentos exclusivos esgotam
        rápido. Obrigado por ter pré-reservado com a gente.
      </P>
    </EmailLayout>
  );
}

export default PreorderReleasedEmail;
