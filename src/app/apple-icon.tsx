import { ImageResponse } from "next/og";

// Apple touch icon — usado quando alguém adiciona a Kizuna na tela inicial do iOS.
// Tamanho recomendado pelo Apple: 180×180.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export const dynamic = "force-static";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 130,
          background: "#c9a874",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1a1b1f",
          fontWeight: 900,
          fontFamily: '"Noto Serif JP", serif',
          // iOS aplica corner radius automaticamente, mas mantemos sólido
          lineHeight: 1,
          paddingTop: 8,
        }}
      >
        絆
      </div>
    ),
    {
      ...size,
    },
  );
}
