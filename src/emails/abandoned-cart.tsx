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

interface AbandonedCartEmailProps {
  customerName: string;
  itemPreview: string; // ex: "Nendoroid Naruto + 2 outros"
  resumeUrl?: string;
}

export function AbandonedCartEmail({
  customerName,
  itemPreview,
  resumeUrl,
}: AbandonedCartEmailProps) {
  return (
    <EmailLayout preview="Você deixou peças na sacola 絆">
      <Eyebrow>戻る · Volta lá quando puder</Eyebrow>
      <H1>
        Deixou peças na{" "}
        <em style={{ fontStyle: "italic", color: emailColors.gold }}>sacola</em>,
        {" "}
        {customerName.split(" ")[0]}.
      </H1>
      <P>
        Vimos que você estava prestes a fechar o pedido de{" "}
        <strong>{itemPreview}</strong> ontem. Sem pressão — só queríamos garantir
        que o link continua valendo.
      </P>
      <P muted>
        Estoque de raridades pode mudar rápido. Se for um item único, vale
        decidir agora antes que outro colecionador resolva levar.
      </P>
      <CTAButton href={resumeUrl ?? `${APP_URL}/carrinho`}>
        Finalizar compra
      </CTAButton>
      <P muted>
        Se ficou alguma dúvida sobre o produto ou o frete, responde aqui e a
        gente responde rápido.
      </P>
    </EmailLayout>
  );
}

export default AbandonedCartEmail;
