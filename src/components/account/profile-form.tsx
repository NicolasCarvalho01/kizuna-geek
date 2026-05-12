"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Field } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/server/actions/account-actions";

interface ProfileFormProps {
  initial: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
    birthDate: string;
    marketingOptIn: boolean;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-2xl">
      <Field
        label="Nome completo"
        name="name"
        defaultValue={initial.name}
        required
        error={state?.fields?.name}
      />

      <label className="flex flex-col gap-1.5">
        <span className="eyebrow">E-mail (não editável)</span>
        <Input value={initial.email} disabled className="opacity-60" />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="CPF"
          name="cpf"
          defaultValue={initial.cpf}
          placeholder="000.000.000-00"
          error={state?.fields?.cpf}
        />
        <Field
          label="Celular"
          name="phone"
          type="tel"
          defaultValue={initial.phone}
          placeholder="+55 11 99999-9999"
          error={state?.fields?.phone}
        />
      </div>

      <Field
        label="Data de nascimento"
        name="birthDate"
        type="date"
        defaultValue={initial.birthDate}
        error={state?.fields?.birthDate}
      />

      <label className="inline-flex items-start gap-3 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] cursor-pointer leading-snug">
        <input
          type="checkbox"
          name="marketingOptIn"
          defaultChecked={initial.marketingOptIn}
          className="h-3.5 w-3.5 mt-0.5 accent-[color:var(--color-gold)] shrink-0"
        />
        Quero receber a newsletter da Kizuna (pré-vendas, lançamentos e bastidores)
      </label>

      {state && !state.ok && state.error && (
        <p
          role="alert"
          className="rounded-[var(--radius-sm)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 px-3 py-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)] leading-snug"
        >
          {state.error}
        </p>
      )}

      {state?.ok && (
        <p
          role="status"
          className="inline-flex items-center gap-2 text-[var(--text-caption)] text-[color:var(--color-gold)]"
        >
          <Check className="h-4 w-4" strokeWidth={1.5} />
          Dados atualizados com sucesso.
        </p>
      )}

      <div className="flex items-center gap-3 pt-3">
        <Button size="lg" type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              Salvando…
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
