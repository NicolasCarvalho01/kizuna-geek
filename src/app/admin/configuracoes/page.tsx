import { Check, X, AlertTriangle } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Configurações · Admin" };

export default function AdminSettingsPage() {
  // Verificação de presença de envs — bom-senso, não revela valores
  const checks = [
    {
      name: "Supabase",
      ok: !!process.env.DATABASE_URL,
      hint: "Banco de produção (Postgres pooler porta 6543)",
    },
    {
      name: "Auth.js secret",
      ok: !!process.env.AUTH_SECRET,
      hint: "Necessário pra assinar JWT de sessão",
    },
    {
      name: "Stripe",
      ok:
        !!process.env.STRIPE_SECRET_KEY &&
        !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hint: "Pagamentos (cartão / boleto / PIX)",
    },
    {
      name: "Stripe webhook",
      ok: !!process.env.STRIPE_WEBHOOK_SECRET,
      hint: "Necessário pra eventos de pagamento dispararem o webhook",
    },
    {
      name: "Melhor Envio",
      ok: !!process.env.MELHOR_ENVIO_TOKEN,
      hint: "Cotação de frete + compra de etiqueta",
    },
    {
      name: "Google OAuth",
      ok:
        !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      hint: "Login social (opcional)",
    },
    {
      name: "Focus NFe",
      ok: !!process.env.FOCUS_NFE_TOKEN,
      hint: "Emissão de NF-e (Fase 6)",
    },
    {
      name: "Resend",
      ok: !!process.env.RESEND_API_KEY,
      hint: "Envio de e-mails transacionais (Fase 6)",
    },
  ];

  const sandboxEnvs = [
    {
      name: "MELHOR_ENVIO_SANDBOX",
      value: process.env.MELHOR_ENVIO_SANDBOX === "true" ? "ON" : "OFF",
      isSandbox: process.env.MELHOR_ENVIO_SANDBOX === "true",
    },
    {
      name: "FOCUS_NFE_SANDBOX",
      value: process.env.FOCUS_NFE_SANDBOX === "true" ? "ON" : "OFF",
      isSandbox: process.env.FOCUS_NFE_SANDBOX === "true",
    },
    {
      name: "Stripe mode",
      value: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live")
        ? "LIVE 🚨"
        : "TEST",
      isSandbox: !process.env.STRIPE_SECRET_KEY?.startsWith("sk_live"),
    },
  ];

  return (
    <div className="space-y-10">
      <header>
        <Eyebrow index="—">Configuração</Eyebrow>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">
          Loja & integrações
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--text-body)] text-[color:var(--color-fg-soft)]">
          Status das credenciais de cada integração. Configuração visual avançada
          (templates de e-mail, dados da loja, etc.) entra na Fase 7.
        </p>
      </header>

      {/* Status das integrações */}
      <section>
        <h2 className="eyebrow mb-4">Variáveis de ambiente detectadas</h2>
        <ul className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] overflow-hidden divide-y divide-[color:var(--color-hairline)]">
          {checks.map((c) => (
            <li key={c.name} className="flex items-center gap-4 p-4">
              <span
                className={
                  c.ok
                    ? "inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] shrink-0"
                    : "inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-bg-sunken)] text-[color:var(--color-fg-mute)] shrink-0"
                }
              >
                {c.ok ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <X className="h-4 w-4" strokeWidth={2} />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[0.9375rem] font-medium">{c.name}</p>
                <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
                  {c.hint}
                </p>
              </div>
              <Badge variant={c.ok ? "gold" : "soft"} size="sm">
                {c.ok ? "Configurado" : "Pendente"}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      {/* Modos sandbox */}
      <section>
        <h2 className="eyebrow mb-4">Modos atuais</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sandboxEnvs.map((env) => (
            <li
              key={env.name}
              className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-4"
            >
              <p className="eyebrow">{env.name}</p>
              <p
                className={
                  env.isSandbox
                    ? "mt-2 font-[var(--font-mono)] text-[1rem] text-[color:var(--color-fg)]"
                    : "mt-2 font-[var(--font-mono)] text-[1rem] text-[color:var(--color-vermilion)]"
                }
              >
                {env.value}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Aviso prod */}
      <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[color:var(--color-gold)] shrink-0 mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="font-[var(--font-display)] text-[1.0625rem]">
              Antes de ir pra produção
            </p>
            <ul className="mt-2 space-y-1.5 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-relaxed">
              <li>• Trocar Stripe pra modo <strong>live</strong> (precisa CNPJ habilitado)</li>
              <li>• Trocar Melhor Envio pra <strong>produção</strong> (token live + cadastro completo)</li>
              <li>• Trocar Focus NFe pra <strong>produção</strong> com certificado A1</li>
              <li>• Configurar webhook Stripe no dashboard de produção (apontando pra https://kizunageek.com.br)</li>
              <li>• Configurar webhook do Melhor Envio com URL pública</li>
              <li>• Rotacionar todas as chaves de teste antes de fazer o deploy</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
