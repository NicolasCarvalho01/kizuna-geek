"use server";

import { auth } from "@/auth";
import {
  uploadProductImage,
  deleteProductImage,
  supabaseStorageConfigured,
} from "@/lib/supabase-storage";
import type { ActionResult } from "@/server/actions/auth-actions";

/**
 * Server Actions de upload de imagens — chamadas pelo admin product-form.
 *
 * Pre-flight: auth(admin/staff) + Supabase configurado.
 */

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Não autenticado." };
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return { ok: false as const, error: "Acesso negado." };
  }
  return { ok: true as const };
}

export async function uploadProductImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string; path: string }>> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  if (!supabaseStorageConfigured) {
    return {
      ok: false,
      error:
        "Supabase Storage não configurado. Defina SUPABASE_SERVICE_ROLE_KEY no .env.local.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Arquivo inválido." };
  }

  try {
    const result = await uploadProductImage(file);
    return { ok: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no upload.";
    return { ok: false, error: message };
  }
}

export async function deleteProductImageAction(
  pathOrUrl: string,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  if (!supabaseStorageConfigured) {
    // Em modo sem Supabase, "delete" só remove do array — não há nada pra apagar
    return { ok: true };
  }

  try {
    await deleteProductImage(pathOrUrl);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao deletar.";
    return { ok: false, error: message };
  }
}
