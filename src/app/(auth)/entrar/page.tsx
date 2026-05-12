import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell, GoogleButton } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta Kizuna Geek.",
};

const USE_DEMO = !process.env.DATABASE_URL;

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Entrar"
      title={
        <>
          Bem-vindo{" "}
          <em className="display-italic text-[color:var(--color-gold)]">de volta</em>.
        </>
      }
      subtitle="Acesse pra acompanhar pedidos, gerenciar favoritos e finalizar compras com mais rapidez."
      kana="認証"
      footer={
        <p>
          Ainda não tem conta?{" "}
          <Link
            href="/cadastrar"
            className="text-[color:var(--color-gold)] underline-offset-4 hover:underline"
          >
            Criar agora
          </Link>
        </p>
      }
    >
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
        <span className="eyebrow">ou</span>
        <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
      </div>

      <GoogleButton />

      {USE_DEMO && <DemoCredentialsHint />}
    </AuthShell>
  );
}

function LoginFallback() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-16 rounded-[var(--radius-md)] bg-[color:var(--color-bg-sunken)]" />
      <div className="h-16 rounded-[var(--radius-md)] bg-[color:var(--color-bg-sunken)]" />
      <div className="h-12 rounded-[var(--radius-md)] bg-[color:var(--color-bg-sunken)]" />
    </div>
  );
}

function DemoCredentialsHint() {
  return (
    <div className="mt-8 rounded-[var(--radius-md)] border border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/6 p-4">
      <p className="eyebrow text-[color:var(--color-gold)] mb-2">
        Modo demonstração
      </p>
      <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)] mb-3">
        Configure o Supabase pra ter persistência real. Por enquanto, entre com
        qualquer usuário do seed (senha <code className="font-[var(--font-mono)] text-[color:var(--color-fg)]">Kizuna@2026</code>):
      </p>
      <ul className="space-y-0.5 text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
        <li>· admin@kizunageek.com.br · ADMIN</li>
        <li>· staff@kizunageek.com.br · STAFF</li>
        <li>· yuki@example.com · CUSTOMER</li>
      </ul>
    </div>
  );
}
