import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Supabase Storage (uploads de produtos) — bucket público
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
            },
          ]
        : []),
    ],
  },
  // typedRoutes desligado intencionalmente.
  //
  // Motivo: e-commerce usa muito href dinâmico com query string pra filtros
  // (?status=PENDING, ?filter=low-stock, ?categoria=tcg&franchise=pokemon).
  // typedRoutes só aceita Route literais ou UrlObjects — adicionar `as Route`
  // em dezenas de cards/links da UI gera ruído sem ganho real, já que esses
  // hrefs vêm de constantes verificadas em revisão de PR.
  //
  // Mantemos a tipagem em Link via `next/link` (o React valida props básicas).
  // Pra rotas estáticas críticas, considerar uma constante única (ex:
  // `src/lib/routes.ts`) no futuro.
  // typedRoutes: true,
};

// Só aplica Sentry se DSN setada (não polui dev local sem Sentry).
const SENTRY_DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
const sentryEnabled = !!SENTRY_DSN && !!process.env.SENTRY_ORG && !!process.env.SENTRY_PROJECT;

const config = sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Silencia logs do CLI em build (Vercel) — mantém só erros
      silent: !process.env.CI,
      // Source maps pra debugging com nomes reais
      widenClientFileUpload: true,
      // Source maps: gera, faz upload pro Sentry, e oculta do bundle público
      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },
      // Disable telemetry call to Sentry on builds
      telemetry: false,
      // Suprime logger no build em CI
      disableLogger: true,
      // Tunnel /monitoring para evitar bloqueio por ad-blockers
      tunnelRoute: "/monitoring",
    })
  : nextConfig;

export default config;
