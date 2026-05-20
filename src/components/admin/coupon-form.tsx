"use client";

import * as React from "react";
import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/auth/login-form";
import { saveCoupon } from "@/server/actions/admin-coupon-actions";

interface CouponFormProps {
  couponId: string | null;
  initial?: {
    code: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
    discountValue: number;
    minimumPurchase: number | null;
    maxUses: number | null;
    maxUsesPerUser: number;
    startsAt: string;
    expiresAt: string;
    isActive: boolean;
    appliesToPreOrders: boolean;
  };
}

export function CouponForm({ couponId, initial }: CouponFormProps) {
  const action = saveCoupon.bind(null, couponId);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <Field label="Código*" name="code" required defaultValue={initial?.code} placeholder="BEMVINDO10" />

      <Field
        label="Descrição interna"
        name="description"
        defaultValue={initial?.description}
        placeholder="10% off primeira compra"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Tipo de desconto*</span>
          <select
            name="discountType"
            defaultValue={initial?.discountType ?? "PERCENTAGE"}
            required
            className="h-11 px-4 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-transparent"
          >
            <option value="PERCENTAGE">Percentual (%)</option>
            <option value="FIXED_AMOUNT">Valor fixo (R$)</option>
            <option value="FREE_SHIPPING">Frete grátis</option>
          </select>
        </label>
        <Field
          label="Valor do desconto*"
          name="discountValue"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={initial?.discountValue}
          placeholder="10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Compra mínima (R$)"
          name="minimumPurchase"
          type="number"
          step="0.01"
          min="0"
          defaultValue={initial?.minimumPurchase ?? ""}
          placeholder="Sem mínimo"
        />
        <Field
          label="Máximo de usos totais"
          name="maxUses"
          type="number"
          min="1"
          defaultValue={initial?.maxUses ?? ""}
          placeholder="Ilimitado"
        />
      </div>

      <Field
        label="Máximo por usuário"
        name="maxUsesPerUser"
        type="number"
        min="1"
        defaultValue={initial?.maxUsesPerUser ?? 1}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Válido a partir de*"
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={initial?.startsAt}
        />
        <Field
          label="Expira em*"
          name="expiresAt"
          type="datetime-local"
          required
          defaultValue={initial?.expiresAt}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={initial?.isActive ?? true}
            className="h-4 w-4 accent-[color:var(--color-gold)]"
          />
          <span className="text-[0.9375rem]">Cupom ativo</span>
        </label>
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="appliesToPreOrders"
            defaultChecked={initial?.appliesToPreOrders ?? true}
            className="h-4 w-4 accent-[color:var(--color-gold)]"
          />
          <span className="text-[0.9375rem]">Pode ser usado em pré-vendas</span>
        </label>
      </div>

      {state && !state.ok && state.error && (
        <p className="rounded-[var(--radius-sm)] border border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8 px-3 py-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)]">
          {state.error}
        </p>
      )}

      <Button size="lg" type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Salvando…
          </>
        ) : (
          <>
            <Check className="h-4 w-4" strokeWidth={1.5} />
            Salvar cupom
          </>
        )}
      </Button>
    </form>
  );
}
