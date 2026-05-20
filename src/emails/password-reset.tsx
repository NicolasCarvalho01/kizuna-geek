import * as React from "react";
import { EmailLayout, H1, P, Eyebrow, CTAButton, Link, emailColors } from "./_layout";

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  /** IP/User-Agent pra contexto (opcional) */
  requestedFrom?: string;
}

export function PasswordResetEmail({
  name,
  resetUrl,
  requestedFrom,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Redefinir sua senha · Kizuna Geek">
      <Eyebrow>Recuperação de senha</Eyebrow>
      <H1>
        Esqueceu a senha,{" "}
        <em style={{ fontStyle: "italic", color: emailColors.gold }}>
          {name.split(" ")[0]}
        </em>
        ?
      </H1>
      <P>
        Sem stress. Clica no botão abaixo pra criar uma nova senha. O link é
        válido por <strong>1 hora</strong>.
      </P>
      <CTAButton href={resetUrl}>Criar nova senha</CTAButton>
      <P muted>
        Se o botão não funcionar:{" "}
        <Link href={resetUrl} style={{ color: emailColors.gold }}>
          {resetUrl}
        </Link>
      </P>
      <P muted>
        {requestedFrom ? `Solicitação feita de ${requestedFrom}. ` : ""}
        Se não foi você que pediu, pode ignorar — sua conta continua segura. Mas
        é boa prática trocar a senha mesmo assim.
      </P>
    </EmailLayout>
  );
}

export default PasswordResetEmail;
