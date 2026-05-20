"use client";

import * as React from "react";
import { useCart } from "@/stores/cart-store";

interface ClearCartOnSuccessProps {
  /** Só limpa quando o pedido confirmado bater (PAID/AWAITING_RELEASE) */
  orderId: string;
}

/**
 * Limpa o cart Zustand quando o cliente cai na `/checkout/sucesso` com pedido pago.
 * Idempotente — usa o orderId como chave em sessionStorage pra não limpar de novo
 * se o usuário recarregar a página (carrinho novo continua intacto).
 */
export function ClearCartOnSuccess({ orderId }: ClearCartOnSuccessProps) {
  const clear = useCart((s) => s.clear);

  React.useEffect(() => {
    const key = `kizuna-cart-cleared:${orderId}`;
    if (sessionStorage.getItem(key)) return;
    clear();
    sessionStorage.setItem(key, "1");
  }, [orderId, clear]);

  return null;
}
