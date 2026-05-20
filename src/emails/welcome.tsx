import * as React from "react";
import { EmailLayout, H1, P, Eyebrow, CTAButton, APP_URL } from "./_layout";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Bem-vindo aos laços, ${name} 絆`}>
      <Eyebrow>絆 · Bem-vindo</Eyebrow>
      <H1>
        Bem-vindo aos <em style={{ fontStyle: "italic", color: "#c9a874" }}>laços</em>,{" "}
        {name.split(" ")[0]}.
      </H1>
      <P>
        Sua conta na Kizuna Geek está pronta. Você agora tem acesso à curadoria
        boutique de Action Figures, Colecionáveis e TCG — e a algumas vantagens
        que clientes cadastrados têm:
      </P>
      <P muted>
        · Pré-venda com prioridade (48h antes do público geral)
        <br />
        · Lista de favoritos com alerta de &ldquo;voltou ao estoque&rdquo;
        <br />
        · Checkout um clique mais rápido (endereços salvos)
        <br />
        · Histórico de pedidos e NF-e pra download
      </P>
      <CTAButton href={`${APP_URL}/catalogo`}>Explorar o catálogo</CTAButton>
      <P muted>
        Qualquer dúvida é só responder esse email — a gente lê.
      </P>
    </EmailLayout>
  );
}

export default WelcomeEmail;
