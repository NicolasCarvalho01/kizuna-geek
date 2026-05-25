"use client";

import * as React from "react";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressForm } from "@/components/account/address-form";
import { deleteAddress } from "@/server/actions/account-actions";
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

