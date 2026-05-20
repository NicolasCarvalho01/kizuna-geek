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

interface OrderDeliveredEmailProps {
  customerName: string;
  orderNumber: string;
  /** Slug do primeiro item — pra link de review direto */
  firstItemSlug?: string;
}

export function OrderDeliveredEmail({
  customerName,
  orderNumber,
  firstItemSlug,
}: OrderDeliveredEmailProps) {
  return (
    <EmailLayout preview="Pedido entregue 絆 que tal uma review?">
      <Eyebrow>絆 · Entregue</Eyebrow>
      <H1>
        Chegou,{" "}
        <em style={{ fontStyle: "italic", color: emailColors.gold }}>
          {customerName.split(" ")[0]}
        </em>
        .
      </H1>
      <P>
        Seu pedido <strong>{orderNumber}</strong> foi entregue. Esperamos que
        seja exatamente como você imaginou.
      </P>
      <P>
        Se você curtir a peça, deixar uma review ajuda muito outros colecionadores
        a decidirem. Leva 30 segundos.
      </P>
      <CTAButton
        href={
          firstItemSlug
            ? `${APP_URL}/produto/${firstItemSlug}?review=1`
            : `${APP_URL}/conta/pedidos/${orderNumber}`
        }
      >
        Avaliar a compra
      </CTAButton>
      <P muted>
        Algum problema na entrega ou no item? Responde esse e-mail e a gente
        resolve em até 24h.
      </P>
      <P muted>
        E se quiser ver o próximo lançamento na nossa curadoria, dá uma olhada
        nas pré-vendas:{" "}
        <a href={`${APP_URL}/pre-venda`} style={{ color: emailColors.gold }}>
          kizunageek.com.br/pre-venda
        </a>
      </P>
    </EmailLayout>
  );
}

export default OrderDeliveredEmail;
