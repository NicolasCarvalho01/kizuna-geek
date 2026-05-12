"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Wishlist client-side (localStorage).
 *
 * Em modo demo (sem Supabase), é o único storage.
 * Com Supabase: usamos a server action `toggleWishlist` que escreve em
 * `WishlistItem` — esta store fica como cache otimista de UI.
 */
export interface WishlistItem {
  productId: string;
  productSlug: string;
  notifyOnRestock: boolean;
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  /** Sinal pra animar o ícone do header quando algo é favoritado */
  lastChangedAt: number | null;

  add: (productId: string, productSlug: string, notify?: boolean) => void;
  remove: (productId: string) => void;
  toggle: (productId: string, productSlug: string) => void;
  toggleNotify: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      lastChangedAt: null,

      add: (productId, productSlug, notify = false) => {
        if (get().items.some((i) => i.productId === productId)) return;
        set({
          items: [
            ...get().items,
            {
              productId,
              productSlug,
              notifyOnRestock: notify,
              addedAt: Date.now(),
            },
          ],
          lastChangedAt: Date.now(),
        });
      },

      remove: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
          lastChangedAt: Date.now(),
        });
      },

      toggle: (productId, productSlug) => {
        const has = get().items.some((i) => i.productId === productId);
        if (has) {
          get().remove(productId);
        } else {
          get().add(productId, productSlug);
        }
      },

      toggleNotify: (productId) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, notifyOnRestock: !i.notifyOnRestock }
              : i,
          ),
        });
      },

      has: (productId) => get().items.some((i) => i.productId === productId),

      clear: () => set({ items: [], lastChangedAt: null }),
    }),
    {
      name: "kizuna-wishlist",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const wishlistCount = (s: WishlistState) => s.items.length;
