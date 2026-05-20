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

interface PreorderReminderEmailProps {
  customerName: string;
  productName: string;
  productSlug: string;
  releaseDate: string;
  daysUntil: number;
}

/**
 * Email enviado X dias antes do lançamento de uma pré-venda em que o cliente
 * tem itens já reservados (pedido com status AWAITING_RELEASE).
 */
export function PreorderReminderEmail({
  customerName,
  productName,
  productSlug,
  releaseDate,
  daysUntil,
}: PreorderReminderEmailProps) {
  return (
    <EmailLayout preview={`${productName} lança em ${daysUntil} dias 絆`}>
      <Eyebrow>予約 · Pré-venda em contagem regressiva</Eyebrow>
      <H1>
        Faltam{" "}
        <em style={{ fontStyle: "italic", color: emailColors.gold }}>
          {daysUntil} dias
        </em>{" "}
        pro lançamento.
      </H1>
      <P>
        Olá {customerName.split(" ")[0]}, aqui é a Kizuna pra avisar que sua
        pré-venda de <strong>{productName}</strong> entra em ação no dia{" "}
        <strong>{releaseDate}</strong>.
      </P>
      <P>
        Assim que o produto chegar ao nosso estoque, despachamos imediatamente —
        você recebe um e-mail com código de rastreio na hora.
      </P>
      <CTAButton href={`${APP_URL}/produto/${productSlug}`}>
        Ver o produto
      </CTAButton>
      <P muted>
        Pode marcar no calendário. Você não precisa fazer nada — só esperar a
        gente postar.
      </P>
    </EmailLayout>
  );
}

export default PreorderReminderEmail;
