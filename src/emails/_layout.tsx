import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

/**
 * Layout brand pra todos os e-mails transacionais da Kizuna Geek.
 *
 * Princípios:
 * - Cores cream/gold/navy — paleta brand
 * - Cormorant Garamond pelos headers (fallback serif pq alguns mail clients não suportam @import)
 * - Estrutura: header com 絆 + KIZUNA · conteúdo · footer com links + tagline JP
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kizunageek.com.br";

const colors = {
  cream: "#e8e2d6",
  navy: "#1a1b3a",
  navyDeep: "#0f1027",
  gold: "#b59458",
  goldSoft: "#c9a874",
  goldInk: "#5a4622",
  border: "rgba(232, 226, 214, 0.10)",
  fgSoft: "rgba(232, 226, 214, 0.72)",
};

const fontStack = {
  serif: '"Cormorant Garamond", "Garamond", "Times New Roman", serif',
  sans: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"SF Mono", Menlo, Consolas, monospace',
};

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta name="color-scheme" content="dark light" />
        <meta name="supported-color-schemes" content="dark light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.navy,
          margin: 0,
          padding: 0,
          fontFamily: fontStack.sans,
          color: colors.cream,
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          {/* Header */}
          <Section style={{ textAlign: "center" as const, paddingBottom: "32px" }}>
            <Text
              style={{
                fontFamily: fontStack.serif,
                fontSize: "32px",
                fontWeight: 900,
                color: colors.gold,
                margin: "0",
                lineHeight: 1,
              }}
            >
              絆
            </Text>
            <Text
              style={{
                fontFamily: fontStack.serif,
                fontSize: "20px",
                letterSpacing: "0.3em",
                color: colors.cream,
                margin: "8px 0 0",
                textTransform: "uppercase" as const,
                fontWeight: 300,
              }}
            >
              Kizuna
            </Text>
          </Section>

          {/* Hairline */}
          <Hr
            style={{
              border: "none",
              borderTop: `1px solid ${colors.gold}`,
              opacity: 0.3,
              margin: "0 0 32px",
            }}
          />

          {/* Content */}
          <Section
            style={{
              backgroundColor: colors.navyDeep,
              borderRadius: "14px",
              padding: "40px 32px",
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section
            style={{
              textAlign: "center" as const,
              paddingTop: "32px",
              color: colors.fgSoft,
            }}
          >
            <Text
              style={{
                fontFamily: fontStack.mono,
                fontSize: "10px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.18em",
                color: colors.gold,
                margin: "0 0 12px",
              }}
            >
              絆 · Kizuna · Os laços que colecionamos
            </Text>
            <Text style={{ fontSize: "12px", margin: "0 0 8px", color: colors.fgSoft }}>
              <Link href={APP_URL} style={{ color: colors.gold, textDecoration: "none" }}>
                kizunageek.com.br
              </Link>
              {" · "}
              <Link href={`${APP_URL}/conta`} style={{ color: colors.gold, textDecoration: "none" }}>
                Minha conta
              </Link>
              {" · "}
              <Link href={`${APP_URL}/contato`} style={{ color: colors.gold, textDecoration: "none" }}>
                Suporte
              </Link>
            </Text>
            <Text
              style={{
                fontSize: "11px",
                color: colors.fgSoft,
                margin: "16px 0 0",
                opacity: 0.6,
              }}
            >
              Kizuna Geek · Itapetininga, SP · Brasil
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// =====================================================================
// PRIMITIVAS REUTILIZÁVEIS
// =====================================================================

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: fontStack.serif,
        fontSize: "32px",
        fontWeight: 300,
        color: colors.cream,
        lineHeight: 1.1,
        margin: "0 0 16px",
        letterSpacing: "-0.015em",
      }}
    >
      {children}
    </Text>
  );
}

export function P({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Text
      style={{
        fontSize: "15px",
        lineHeight: 1.6,
        color: muted ? colors.fgSoft : colors.cream,
        margin: "0 0 16px",
      }}
    >
      {children}
    </Text>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: fontStack.mono,
        fontSize: "10px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.18em",
        color: colors.gold,
        margin: "0 0 12px",
      }}
    >
      {children}
    </Text>
  );
}

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export function CTAButton({ href, children }: ButtonProps) {
  return (
    <Section style={{ textAlign: "center" as const, padding: "24px 0" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: colors.gold,
          color: colors.goldInk,
          padding: "14px 32px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 500,
          fontSize: "15px",
          fontFamily: fontStack.sans,
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: `${colors.gold}1A`,
        border: `1px solid ${colors.gold}66`,
        borderRadius: "8px",
        padding: "16px 20px",
        margin: "16px 0",
      }}
    >
      {children}
    </Section>
  );
}

export const emailColors = colors;
export const emailFonts = fontStack;
export { APP_URL };

// Re-export utilities pra templates
export { Link, Img } from "@react-email/components";
