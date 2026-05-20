import * as React from "react";
import { Section, Row, Column } from "@react-email/components";
import {
  EmailLayout,
  H1,
  P,
  Eyebrow,
  CTAButton,
  InfoBox,
  emailColors,
  emailFonts,
  APP_URL,
} from "./_layout";

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  total: string;
  items: Array<{
    name: string;
    variant: string;
    quantity: number;
    price: string;
  }>;
  hasPreOrder: boolean;
  expectedShipDate?: string | null;
  shippingAddress: {
    recipient: string;
    line1: string;
    line2?: string;
    cityState: string;
    zipCode: string;
  };
}

export function OrderConfirmationEmail({
  customerName,
  orderNumber,
  total,
  items,
  hasPreOrder,
  expectedShipDate,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  return (
    <EmailLayout preview={`Pedido ${orderNumber} confirmado · Kizuna Geek`}>
      <Eyebrow>Pedido recebido</Eyebrow>
      <H1>
        {hasPreOrder ? (
          <>
            Sua{" "}
            <em style={{ fontStyle: "italic", color: emailColors.gold }}>
              pré-venda
            </em>{" "}
            está reservada.
          </>
        ) : (
          <>
            Recebemos seu{" "}
            <em style={{ fontStyle: "italic", color: emailColors.gold }}>
              pedido
            </em>
            , {customerName.split(" ")[0]}.
          </>
        )}
      </H1>

      <P>
        Pedido <strong>{orderNumber}</strong> registrado. Você vai receber outro
        email assim que o pagamento for confirmado.
      </P>

      {hasPreOrder && expectedShipDate && (
        <InfoBox>
          <P>
            <strong style={{ color: emailColors.gold }}>Atenção — pré-venda</strong>
            <br />
            Este pedido contém itens em pré-venda. Despachamos a partir de{" "}
            <strong>{expectedShipDate}</strong>. A NF-e é emitida no momento do
            envio efetivo.
          </P>
        </InfoBox>
      )}

      {/* Items */}
      <Section style={{ margin: "24px 0", borderTop: `1px solid ${emailColors.border}` }}>
        {items.map((item, i) => (
          <Row key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${emailColors.border}` }}>
            <Column>
              <P>
                <strong>{item.name}</strong>
                <br />
                <span style={{ fontSize: "12px", color: emailColors.fgSoft }}>
                  {item.variant} · {item.quantity}×
                </span>
              </P>
            </Column>
            <Column align="right">
              <P>
                <span style={{ fontFamily: emailFonts.mono, fontSize: "14px" }}>
                  {item.price}
                </span>
              </P>
            </Column>
          </Row>
        ))}
      </Section>

      <Section style={{ marginTop: "16px" }}>
        <Row>
          <Column>
            <Eyebrow>Total</Eyebrow>
          </Column>
          <Column align="right">
            <P>
              <span
                style={{
                  fontFamily: emailFonts.serif,
                  fontSize: "24px",
                  color: emailColors.cream,
                }}
              >
                {total}
              </span>
            </P>
          </Column>
        </Row>
      </Section>

      {/* Endereço */}
      <Section style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${emailColors.border}` }}>
        <Eyebrow>Entregar para</Eyebrow>
        <P>
          {shippingAddress.recipient}
          <br />
          <span style={{ fontSize: "13px", color: emailColors.fgSoft }}>
            {shippingAddress.line1}
            {shippingAddress.line2 && (
              <>
                <br />
                {shippingAddress.line2}
              </>
            )}
            <br />
            {shippingAddress.cityState} · CEP {shippingAddress.zipCode}
          </span>
        </P>
      </Section>

      <CTAButton href={`${APP_URL}/conta/pedidos/${orderNumber}`}>
        Acompanhar pedido
      </CTAButton>
    </EmailLayout>
  );
}

export default OrderConfirmationEmail;
