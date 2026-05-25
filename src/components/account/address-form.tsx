"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Field } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { saveAddress, lookupCepAction } from "@/server/actions/account-actions";

export interface AddressInitial {
  id: string;
  label: string;
  recipientName: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface AddressFormProps {
  /** Endereço pra editar; `null` = criar novo */
  initial: AddressInitial | null;
  /** Fecha o form (geralmente seta o state do pai pra null) */
  onClose: () => void;
  /**
   * Chamado quando o save é bem-sucedido, com o ID do endereço.
   * Útil no checkout pra selecionar o novo endereço automaticamente.
   */
  onSaved?: (addressId: string) => void;
}

/**
 * Form de endereço com auto-fill via ViaCEP.
 *
 * Compartilhado entre `/conta/enderecos` (gestão de endereços) e
 * `/checkout` (cadastro inline durante a compra).
 *
 * Auto-fill: quando o usuário digita 8 dígitos no CEP (ou sai do campo),
 * dispara `lookupCepAction` (ViaCEP) e preenche logradouro/bairro/cidade/UF.
 * Campos já preenchidos pelo usuário são preservados.
 */
export function AddressForm({ initial, onClose, onSaved }: AddressFormProps) {
  const [state, formAction, pending] = useActionState(saveAddress, null);

  // Campos controlados — necessário pra auto-fill via ViaCEP
  const [zipCode, setZipCode] = React.useState(initial?.zipCode ?? "");
  const [street, setStreet] = React.useState(initial?.street ?? "");
  const [neighborhood, setNeighborhood] = React.useState(initial?.neighborhood ?? "");
  const [city, setCity] = React.useState(initial?.city ?? "");
  const [stateUf, setStateUf] = React.useState(initial?.state ?? "");

  const [cepLookingUp, setCepLookingUp] = React.useState(false);
  const [cepLookupError, setCepLookupError] = React.useState<string | null>(null);
  // Evita lookup duplicado pro mesmo CEP (ex: blur + change)
  const lastLookedCep = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (state?.ok) {
      if (onSaved && state.data?.addressId) {
        onSaved(state.data.addressId);
      }
      onClose();
    }
  }, [state, onClose, onSaved]);

  /**
   * Dispara o lookup do CEP via ViaCEP (Server Action).
   * Preenche logradouro/bairro/cidade/UF apenas se estiverem vazios —
   * preserva edições manuais do usuário.
   */
  async function tryLookupCep(rawCep: string) {
    const digits = rawCep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    if (lastLookedCep.current === digits) return;
    lastLookedCep.current = digits;

    setCepLookingUp(true);
    setCepLookupError(null);

    const result = await lookupCepAction(digits);

    setCepLookingUp(false);

    if (result.ok && result.data) {
      // Só preenche o que está vazio — não sobrescreve manual
      if (!street.trim() && result.data.street) setStreet(result.data.street);
      if (!neighborhood.trim() && result.data.neighborhood)
        setNeighborhood(result.data.neighborhood);
      if (!city.trim() && result.data.city) setCity(result.data.city);
      if (!stateUf.trim() && result.data.state) setStateUf(result.data.state);
    } else {
      setCepLookupError(result.error ?? "Erro ao consultar CEP.");
    }
  }

  return (
    <form
      action={formAction}
      className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 lg:p-8"
    >
      <h3 className="display text-[1.5rem] mb-6">
        {initial ? "Editar endereço" : "Novo endereço"}
      </h3>

      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Apelido"
          name="label"
          required
          defaultValue={initial?.label}
          error={state?.fields?.label}
          placeholder="Casa, Trabalho…"
        />
        <Field
          label="Destinatário"
          name="recipientName"
          required
          defaultValue={initial?.recipientName}
          error={state?.fields?.recipientName}
          autoComplete="name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-4 mt-4">
        <Field
          label="CEP"
          name="zipCode"
          required
          value={zipCode}
          onChange={(e) => {
            setZipCode(e.target.value);
            setCepLookupError(null);
            // Auto-lookup quando completar 8 dígitos (sem precisar sair do campo)
            const digits = e.target.value.replace(/\D/g, "");
            if (digits.length === 8) {
              void tryLookupCep(digits);
            }
          }}
          onBlur={(e) => void tryLookupCep(e.target.value)}
          error={state?.fields?.zipCode ?? cepLookupError ?? undefined}
          placeholder="00000-000"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={9}
          rightAdornment={
            cepLookingUp ? (
              <Loader2
                className="h-4 w-4 animate-spin text-[color:var(--color-gold)]"
                strokeWidth={1.5}
                aria-label="Consultando CEP"
              />
            ) : null
          }
        />
        <Field
          label="Logradouro"
          name="street"
          required
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          error={state?.fields?.street}
          autoComplete="address-line1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-4 mt-4">
        <Field
          label="Número"
          name="number"
          required
          defaultValue={initial?.number}
          error={state?.fields?.number}
          inputMode="numeric"
        />
        <Field
          label="Complemento"
          name="complement"
          defaultValue={initial?.complement ?? ""}
          error={state?.fields?.complement}
          placeholder="Apto, bloco… (opcional)"
          autoComplete="address-line2"
        />
      </div>

      <Field
        label="Bairro"
        name="neighborhood"
        required
        value={neighborhood}
        onChange={(e) => setNeighborhood(e.target.value)}
        error={state?.fields?.neighborhood}
        className="mt-4"
      />

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_6rem] gap-4 mt-4">
        <Field
          label="Cidade"
          name="city"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={state?.fields?.city}
          autoComplete="address-level2"
        />
        <Field
          label="UF"
          name="state"
          required
          maxLength={2}
          value={stateUf}
          onChange={(e) => setStateUf(e.target.value.toUpperCase())}
          error={state?.fields?.state}
          placeholder="SP"
          autoComplete="address-level1"
        />
      </div>

      <label className="mt-5 inline-flex items-center gap-3 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] cursor-pointer">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={initial?.isDefault}
          className="h-3.5 w-3.5 accent-[color:var(--color-gold)]"
        />
        Marcar como endereço padrão
      </label>

      {state && !state.ok && state.error && (
        <p
          role="alert"
          className="mt-5 rounded-[var(--radius-sm)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 px-3 py-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)]"
        >
          {state.error}
        </p>
      )}

      <div className="mt-7 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              Salvando…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" strokeWidth={1.5} />
              Salvar endereço
            </>
          )}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
