"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { deleteCoupon } from "@/server/actions/admin-coupon-actions";

interface CouponRowActionsProps {
  couponId: string;
  couponCode: string;
}

export function CouponRowActions({ couponId, couponCode }: CouponRowActionsProps) {
  const [pending, startTransition] = React.useTransition();

  function onDelete() {
    if (!confirm(`Apagar o cupom ${couponCode}? Esta ação é permanente.`)) return;
    startTransition(async () => {
      await deleteCoupon(couponId);
    });
  }

  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Ações"
          disabled={pending}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)] transition-colors disabled:opacity-40"
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[10rem] rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-3)] p-1.5"
        >
          <DropdownPrimitive.Item asChild>
            <Link
              href={`/admin/cupons/${couponId}`}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)] cursor-pointer outline-none"
            >
              <Edit className="h-3.5 w-3.5" strokeWidth={1.5} />
              Editar
            </Link>
          </DropdownPrimitive.Item>
          <DropdownPrimitive.Item
            onSelect={onDelete}
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-vermilion)] hover:bg-[color:var(--color-vermilion)]/10 cursor-pointer outline-none"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Apagar
          </DropdownPrimitive.Item>
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
