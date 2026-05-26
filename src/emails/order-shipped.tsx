import * as React from "react";
import {
  EmailLayout,
  H1,
  P,
  Eyebrow,
  CTAButton,
  Link,
  emailColors,
  emailFonts,
  APP_URL,
} from "./_layout";

interface OrderShippedEmailProps {
  customerName: string;
  orderNumber: string;
  carrier: string;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  estimatedDays?: string | null;
}

export function OrderShippedEmail({
  customerName,
  orderNumber,
  carrier,
  trackingCode,
  trackingUrl,
  estimatedDays,
}: OrderShippedEmailProps) {
  return (
    <EmailLayout preview={`${orderNumber} saiu pra entrega 🚚`}>
      <Eyebrow>Pedido em trânsito</Eyebrow>
      <H1>
        Seu pedido está a{" "}
        <em style={{ fontStyle: "italic", color: emailColors.gold }}>caminho</em>
        , {customerName.split(" ")[0]}.
      </H1>
      <P>
        Postamos o pedido <strong>{orderNumber}</strong> via{" "}
        <strong>{carrier}</strong>.
        {estimatedDays && ` Previsão de entrega em ${estimatedDays}.`}
      </P>

      {trackingCode && (
        <P>
          Código de rastreio:{" "}
          <span
            style={{
              fontFamily: emailFonts.mono,
              fontSize: "14px",
              padding: "4px 8px",
              backgroundColor: `${emailColors.gold}1A`,
              borderRadius: "4px",
              color: emailColors.cream,
            }}
          >
            {trackingCode}
          </span>
        </P>
      )}

      {trackingUrl && (
        <CTAButton href={trackingUrl}>Rastrear envio</CTAButton>
      )}

      <P muted>
        Em alguns transportadoras o status só aparece depois de 24h — é normal.
        Se atrasar mais que o esperado, é só responder esse e-mail que a gente
        confere com a {carrier}.
      </P>

      <P muted>
        Você pode acompanhar o status completo no seu painel:{" "}
        <Link
          href={`${APP_URL}/conta/pedidos/${orderNumber}`}
          style={{ color: emailColors.gold }}
        >
          ver pedido
        </Link>
      </P>

      <P muted>
        Precisa de comprovante da compra?{" "}
        <Link
          href={`${APP_URL}/api/recibo/${orderNumber}`}
          style={{ color: emailColors.gold }}
        >
          baixar recibo
        </Link>
        {" "}(documento não-fiscal, salvável em PDF pelo navegador).
      </P>
    </EmailLayout>
  );
}

export default OrderShippedEmail;
