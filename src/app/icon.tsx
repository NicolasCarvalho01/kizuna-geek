import { ImageResponse } from "next/og";

// Next 15 dynamic favicon — gera PNG em build time.
// Documentação: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons#generate-icons-using-code-js-ts-tsx

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Cache forever — favicon não muda entre deploys (a menos que rebuild)
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#c9a874", // gold da paleta
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1a1b1f", // navy/ink da paleta
          fontWeight: 900,
          fontFamily: '"Noto Serif JP", serif',
          // Subtle border-radius (~16% = iOS rounded square)
          borderRadius: "20%",
          lineHeight: 1,
          // Leve ajuste do baseline pra centralizar o kanji
          paddingTop: 2,
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
