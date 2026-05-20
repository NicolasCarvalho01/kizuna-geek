// Next.js instrumentation hook (Next 15+).
// Carrega o config correto do Sentry baseado no runtime que está rodando.
// Roda uma vez no bootstrap de cada runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// onRequestError hook (Next 15+) — propaga erros de Server Components pro Sentry
export async function onRequestError(
  err: unknown,
  request: {
    path: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
  },
) {
  const DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!DSN) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, context);
}
