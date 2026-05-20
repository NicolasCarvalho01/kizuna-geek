// Sentry config — Server (Node runtime).
// Captura erros em Server Components, Server Actions, API Routes, middleware.
import * as Sentry from "@sentry/nextjs";

const DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    environment: process.env.NODE_ENV,
    sendDefaultPii: false,
    // Não enviar erros 4xx (cliente) — só 5xx e exceptions reais
    beforeSend(event) {
      // Filtra alguns erros conhecidos de runtime que não são bugs
      const message = event.exception?.values?.[0]?.value ?? event.message ?? "";
      if (
        message.includes("NEXT_NOT_FOUND") ||
        message.includes("NEXT_REDIRECT")
      ) {
        return null;
      }
      return event;
    },
  });
}
