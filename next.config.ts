import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  // typedRoutes desligado durante a Fase 1 — muitos placeholders apontam para rotas
  // ainda inexistentes (Catálogo, Conta, etc.). Reativar na Fase 7 quando todas as
  // páginas finais existirem.
  // typedRoutes: true,
};

export default nextConfig;
