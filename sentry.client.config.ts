// Sentry config — Client (browser).
// Roda no bundle do browser. Inicializa só se DSN configurada — em dev/local
// sem DSN, vira no-op silencioso pra não poluir console.
import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    // 10% das transações em prod, 100% em dev. Ajustar conforme volume.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    // Replay opcional — pesado, mantenho desligado por enquanto
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    // Não envia erros de extensões/scripts third-party que não controlamos
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      // Network errors transitórios — não acionar PagerDuty por isso
      "NetworkError when attempting to fetch resource.",
      "Failed to fetch",
    ],
    // Atenção: NÃO envia PII por padrão
    sendDefaultPii: false,
  });
}
