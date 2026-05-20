"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  emitInvoiceForOrder,
  cancelInvoiceForOrder,
} from "@/server/services/nfe";
import type { ActionResult } from "@/server/actions/auth-actions";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Não autenticado." };
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return { ok: false as const, error: "Acesso negado." };
  }
  return { ok: true as const };
}

/**
 * Emite NF-e manualmente — útil quando a emissão automática falhou
 * ou foi rejeitada pelo SEFAZ e admin quer tentar de novo.
 */
export async function emitNfeManual(orderId: string): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  const result = await emitInvoiceForOrder(orderId);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath(`/admin/pedidos`);
  revalidatePath(`/admin/nfe`);
  return { ok: true };
}

/**
 * Cancela NF-e — regra SEFAZ: até 24h após emissão.
 */
export async function cancelNfeManual(
  orderId: string,
  justificativa: string,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  const result = await cancelInvoiceForOrder(orderId, justificativa);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath(`/admin/pedidos`);
  revalidatePath(`/admin/nfe`);
  return { ok: true };
}
