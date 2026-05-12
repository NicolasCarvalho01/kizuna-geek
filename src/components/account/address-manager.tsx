"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Field } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveAddress, deleteAddress } from "@/server/actions/account-actions";
import { cn } from "@/lib/utils";

interface Address {
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

interface AddressManagerProps {
  initial: Address[];
  demoMode: boolean;
}

export function AddressManager({ initial, demoMode }: AddressManagerProps) {
  const [editing, setEditing] = React.useState<Address | "new" | null>(null);

  return (
    <div className="space-y-6">
      {demoMode && (
        <div className="rounded-[var(--radius-md)] border border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/6 p-4 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
          <strong className="text-[color:var(--color-gold)]">Modo demo:</strong>{" "}
          endereços não persistem entre sessões. Configure o Supabase pra ter
          armazenamento real.
        </div>
      )}

      {initial.length === 0 && editing !== "new" ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
          <MapPin className="h-7 w-7 mx-auto text-[color:var(--color-gold)]/60" strokeWidth={1.5} />
          <h3 className="display text-[1.25rem] mt-4">Sem endereços salvos</h3>
          <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] max-w-md mx-auto">
            Adicione um endereço pra checkout mais rápido.
          </p>
          <Button onClick={() => setEditing("new")} className="mt-5">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Adicionar endereço
          </Button>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initial.map((addr) => (
              <li key={addr.id}>
                <AddressCard
                  address={addr}
                  onEdit={() => setEditing(addr)}
                  demoMode={demoMode}
                />
              </li>
            ))}
          </ul>

          {editing !== "new" && (
            <Button onClick={() => setEditing("new")} variant="outline">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Adicionar novo endereço
            </Button>
          )}
        </>
      )}

      {editing !== null && (
        <AddressForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

// =====================================================================
// CARD
// =====================================================================

function AddressCard({
  address,
  onEdit,
  demoMode,
}: {
  address: Address;
  onEdit: () => void;
  demoMode: boolean;
}) {
  const [removing, startRemove] = React.useTransition();

  function handleDelete() {
    if (!confirm("Remover este endereço?")) return;
    startRemove(async () => {
      await deleteAddress(address.id);
    });
  }

  return (
    <article
      className={cn(
        "relative rounded-[var(--radius-md)] border p-5",
        "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
        address.isDefault
          ? "border-[color:var(--color-gold)]/60 bg-[color:var(--color-gold)]/6"
          : "border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="eyebrow">{address.label}</p>
          <p className="mt-1.5 font-[var(--font-display)] text-[1.125rem] leading-snug">
            {address.recipientName}
          </p>
        </div>
        {address.isDefault && (
          <Badge variant="gold" size="sm">
            Padrão
          </Badge>
        )}
      </div>

      <p className="text-[var(--text-caption)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
        {address.street}, {address.number}
        {address.complement && ` · ${address.complement}`}
        <br />
        {address.neighborhood} · {address.city}/{address.state}
        <br />
        CEP {formatCep(address.zipCode)}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[var(--text-caption)] text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-gold)] hover:bg-[color:var(--color-gold)]/8 transition-colors"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.5} />
          Editar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={removing || demoMode}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-[var(--text-caption)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-vermilion)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {removing ? (
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
          ) : (
            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
          )}
          Remover
        </button>
      </div>
    </article>
  );
}

function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
}

// =====================================================================
// FORM
// =====================================================================

function AddressForm({
  initial,
  onClose,
}: {
  initial: Address | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveAddress, null);

  React.useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

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
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-4 mt-4">
        <Field
          label="CEP"
          name="zipCode"
          required
          defaultValue={initial?.zipCode}
          error={state?.fields?.zipCode}
          placeholder="00000-000"
        />
        <Field
          label="Logradouro"
          name="street"
          required
          defaultValue={initial?.street}
          error={state?.fields?.street}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-4 mt-4">
        <Field
          label="Número"
          name="number"
          required
          defaultValue={initial?.number}
          error={state?.fields?.number}
        />
        <Field
          label="Complemento"
          name="complement"
          defaultValue={initial?.complement ?? ""}
          error={state?.fields?.complement}
          placeholder="Apto, bloco… (opcional)"
        />
      </div>

      <Field
        label="Bairro"
        name="neighborhood"
        required
        defaultValue={initial?.neighborhood}
        error={state?.fields?.neighborhood}
        className="mt-4"
      />

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_6rem] gap-4 mt-4">
        <Field
          label="Cidade"
          name="city"
          required
          defaultValue={initial?.city}
          error={state?.fields?.city}
        />
        <Field
          label="UF"
          name="state"
          required
          maxLength={2}
          defaultValue={initial?.state}
          error={state?.fields?.state}
          placeholder="SP"
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
