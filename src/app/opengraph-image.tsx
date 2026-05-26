import { ImageResponse } from "next/og";

// Imagem padrão de Open Graph — mostrada quando alguém compartilha o link da
// Kizuna em WhatsApp, Telegram, Instagram, Twitter/X, Discord, LinkedIn etc.
// Tamanho recomendado: 1200×630 (proporção 1.91:1).
//
// Páginas específicas podem ter o próprio (ex: src/app/produto/[slug]/opengraph-image.tsx).

export const alt = "Kizuna Geek — Action Figures, Colecionáveis e TCG";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamic = "force-static";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1a1b3a", // navy-deep (dark mode background)
          padding: 64,
          position: "relative",
          fontFamily: '"Cormorant Garamond", serif',
        }}
      >
        {/* Kanji 絆 marca d'água gigante */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -120,
            fontSize: 720,
            color: "#c9a874",
            opacity: 0.18,
            lineHeight: 1,
            fontFamily: '"Noto Serif JP", serif',
            fontWeight: 900,
            display: "flex",
          }}
        >
          絆
        </div>

        {/* Top: eyebrow */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#c9a874",
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            fontFamily: '"JetBrains Mono", monospace',
            zIndex: 1,
          }}
        >
          絆 · Kizuna Geek
        </div>

        {/* Main */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
            maxWidth: 850,
          }}
        >
          <div
            style={{
              fontSize: 92,
              color: "#fbf8f1",
              lineHeight: 1.02,
              fontWeight: 400,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Os&nbsp;
            <span
              style={{
                color: "#c9a874",
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              laços&nbsp;
            </span>
            que colecionamos.
          </div>

          <div
            style={{
              marginTop: 32,
              fontSize: 28,
              color: "#fbf8f1",
              opacity: 0.7,
              lineHeight: 1.4,
              maxWidth: 700,
              display: "flex",
            }}
          >
            Boutique de Action Figures, Colecionáveis e TCG — Itapetininga/SP. Pré-vendas, lançamentos e raridades.
          </div>
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 20,
            color: "#fbf8f1",
            opacity: 0.5,
            fontFamily: '"JetBrains Mono", monospace',
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex" }}>kizunageek.com.br</div>
          <div style={{ display: "flex", textTransform: "uppercase", letterSpacing: "0.2em" }}>
            絆を集める
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
