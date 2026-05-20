import type { MetadataRoute } from "next";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://kizunageek.com.br").replace(
  /\/$/,
  "",
);

// robots.txt:
// - bots de busca: full crawl, exceto áreas privadas/transacionais
// - bots agressivos de scraping de preço/conteúdo: bloqueio explícito
// - sitemap aponta pro /sitemap.xml gerado pelo app/sitemap.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/conta",
          "/conta/*",
          "/checkout",
          "/checkout/*",
          "/carrinho",
          "/favoritos",
          "/_next/*",
          "/*?*", // evita indexação de variações com query string (filtros, utm, etc.)
        ],
      },
      // Bots de scraping de preço/produto — bloqueio explícito
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "CCBot", "anthropic-ai"],
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
