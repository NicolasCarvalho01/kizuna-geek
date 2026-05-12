import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell, GoogleButton } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta Kizuna Geek.",
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Criar conta"
      title={
        <>
          Bem-vindo aos{" "}
          <em className="display-italic text-[color:var(--color-gold)]">laços</em>.
        </>
      }
      subtitle="Conta criada em 30 segundos. Pré-vendas com prioridade e alertas de raridade vêm por padrão (sem spam)."
      kana="登録"
      footer={
        <p>
          Já tem conta?{" "}
          <Link
            href="/entrar"
            className="text-[color:var(--color-gold)] underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <SignupForm />

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
        <span className="eyebrow">ou</span>
        <span className="h-px flex-1 bg-[color:var(--color-hairline)]" />
      </div>

      <GoogleButton />
    </AuthShell>
  );
}
