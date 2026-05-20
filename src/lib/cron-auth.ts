import { NextResponse } from "next/server";

/**
 * Valida que a request veio do Vercel Cron (ou de uma chamada manual autorizada).
 *
 * Vercel Cron envia `Authorization: Bearer ${CRON_SECRET}` em prod.
 * Em dev, aceita header `x-cron-key` igual ao `CRON_SECRET` pra teste manual.
 */
export function assertCronAuth(req: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;

  // Em dev sem CRON_SECRET, libera (facilita teste local)
  if (!cronSecret && process.env.NODE_ENV !== "production") {
    return null;
  }

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET não configurado." },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  if (auth === expected) return null;

  // Fallback header pra ferramentas que não setam Authorization
  const cronKey = req.headers.get("x-cron-key");
  if (cronKey === cronSecret) return null;

  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}
