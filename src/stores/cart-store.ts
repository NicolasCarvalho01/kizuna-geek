"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Item armazenado no carrinho — snapshot mínimo necessário pra UI + checkout.
 * Em produção, será reconciliado com o banco antes do checkout
 * (preço atual, disponibilidade, validade da pré-venda).
 */
export interface CartLine {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  isPreOrder: boolean;
  releaseDate: string | null;
  /** quanto há em estoque no momento da adição (UI evita passar) */
  stockAtAdd: number;
}

interface CartState {
  /** UI: drawer aberto */
  isOpen: boolean;
  /** Itens atualmente no carrinho */
  lines: CartLine[];
  /** Quando o último item foi adicionado — usado pra animar o ícone do header */
  lastAddedAt: number | null;

  // -------- Ações --------
  open: () => void;
  close: () => void;
  toggle: () => void;
  addLine: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      lines: [],
      lastAddedAt: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      addLine: (input) => {
        const qty = Math.max(1, input.quantity ?? 1);
        const existing = get().lines.find((l) => l.variantId === input.variantId);
        const cap = Math.max(1, input.stockAtAdd || 1);

        if (existing) {
          const newQty = Math.min(cap, existing.quantity + qty);
          set({
            lines: get().lines.map((l) =>
              l.variantId === input.variantId ? { ...l, quantity: newQty } : l,
            ),
            lastAddedAt: Date.now(),
            isOpen: true,
          });
          return;
        }

        const line: CartLine = {
          ...input,
          quantity: Math.min(cap, qty),
        };
        set({
          lines: [...get().lines, line],
          lastAddedAt: Date.now(),
          isOpen: true,
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((l) => l.variantId !== variantId) });
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.variantId === variantId
              ? { ...l, quantity: Math.min(l.stockAtAdd || quantity, quantity) }
              : l,
          ),
        });
      },

      removeLine: (variantId) => {
        set({ lines: get().lines.filter((l) => l.variantId !== variantId) });
      },

      clear: () => set({ lines: [], lastAddedAt: null }),
    }),
    {
      name: "kizuna-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

// =====================================================================
// SELETORES UTILITÁRIOS (use com `useCart(seletor)` pra evitar re-renders)
// =====================================================================

export const cartItemCount = (s: CartState) =>
  s.lines.reduce((acc, l) => acc + l.quantity, 0);

export const cartSubtotal = (s: CartState) =>
  s.lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);

export const cartHasPreOrder = (s: CartState) =>
  s.lines.some((l) => l.isPreOrder);
