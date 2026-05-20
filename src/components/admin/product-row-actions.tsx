"use client";

import * as React from "react";
import Link from "next/link";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Edit, Archive, Trash2, Eye, EyeOff } from "lucide-react";
import {
  setProductStatus,
  deleteProductSoft,
} from "@/server/actions/admin-product-actions";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@prisma/client";

interface ProductRowActionsProps {
  productId: string;
  productName: string;
  currentStatus: ProductStatus;
}

export function ProductRowActions({
  productId,
  productName,
  currentStatus,
}: ProductRowActionsProps) {
  const [pending, startTransition] = React.useTransition();

  const setStatus = (status: ProductStatus) => {
    startTransition(async () => {
      await setProductStatus(productId, status);
    });
  };

  const onDelete = () => {
    if (!confirm(`Arquivar "${productName}"? Você pode recuperar depois.`)) return;
    startTransition(async () => {
      await deleteProductSoft(productId);
    });
  };

  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Ações do produto"
          disabled={pending}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]",
            "text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)]",
            "transition-colors",
            "disabled:opacity-40",
          )}
        >
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </DropdownPrimitive.Trigger>

      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[12rem] rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-3)] p-1.5"
        >
          <DropdownPrimitive.Item asChild>
            <Link
              href={`/admin/produtos/${productId}`}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)] cursor-pointer outline-none"
            >
              <Edit className="h-3.5 w-3.5" strokeWidth={1.5} />
              Editar
            </Link>
          </DropdownPrimitive.Item>

          {currentStatus === "DRAFT" && (
            <DropdownPrimitive.Item
              onSelect={() => setStatus("ACTIVE")}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)] cursor-pointer outline-none"
            >
              <Eye className="h-3.5 w-3.5 text-[color:var(--color-gold)]" strokeWidth={1.5} />
              Publicar (Ativo)
            </DropdownPrimitive.Item>
          )}

          {currentStatus === "ACTIVE" && (
            <DropdownPrimitive.Item
              onSelect={() => setStatus("DRAFT")}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)] cursor-pointer outline-none"
            >
              <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
              Despublicar
            </DropdownPrimitive.Item>
          )}

          {currentStatus !== "ARCHIVED" && (
            <DropdownPrimitive.Item
              onSelect={() => setStatus("ARCHIVED")}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)] cursor-pointer outline-none"
            >
              <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
              Arquivar
            </DropdownPrimitive.Item>
          )}

          <DropdownPrimitive.Separator className="my-1.5 h-px bg-[color:var(--color-hairline)]" />

          <DropdownPrimitive.Item
            onSelect={onDelete}
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-vermilion)] hover:bg-[color:var(--color-vermilion)]/10 cursor-pointer outline-none"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Excluir (soft)
          </DropdownPrimitive.Item>
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
