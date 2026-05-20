import * as React from "react";
import { EmailLayout, H1, P, Eyebrow, CTAButton, Link, emailColors } from "./_layout";

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Confirme seu e-mail na Kizuna Geek">
      <Eyebrow>Verificação de e-mail</Eyebrow>
      <H1>Confirme que é você, {name.split(" ")[0]}.</H1>
      <P>
        Pra liberar todas as funcionalidades da sua conta (incluindo pré-vendas
        prioritárias e download de NF-e), só falta confirmar este e-mail.
      </P>
      <CTAButton href={verifyUrl}>Confirmar meu e-mail</CTAButton>
      <P muted>
        Se o botão não funcionar, copia e cola este link no navegador:{" "}
        <Link href={verifyUrl} style={{ color: emailColors.gold }}>
          {verifyUrl}
        </Link>
      </P>
      <P muted>
        Esse link expira em 24h. Se você não criou conta na Kizuna, pode ignorar.
      </P>
    </EmailLayout>
  );
}

export default VerifyEmail;
