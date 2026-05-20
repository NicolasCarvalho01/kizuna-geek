"use server";

import { revalidatePath } from "next/cache";
import { auth, unstable_update } from "@/auth";
import { profileSchema, addressSchema } from "@/lib/validators/account";
import type { ActionResult } from "@/server/actions/auth-actions";

const USE_DEMO = !process.env.DATABASE_URL;

// =====================================================================
// PERFIL
// =====================================================================

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autenticado." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || "",
    cpf: formData.get("cpf") || "",
    birthDate: formData.get("birthDate") || "",
    marketingOptIn: formData.get("marketingOptIn") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os campos.",
      fields: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "",
        ]),
      ),
    };
  }

  if (USE_DEMO) {
    return {
      ok: false,
      error: "Em modo demo os dados não persistem. Configure o Supabase pra editar perfil.",
    };
  }

  const { prisma } = await import("@/lib/prisma");
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        cpf: parsed.data.cpf?.replace(/\D/g, "") || null,
        birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
        marketingOptIn: parsed.data.marketingOptIn,
      },
    });
  } catch (err) {
    // P2025 = "Record not found" — JWT aponta pra ID inexistente (sessão obsoleta)
    if (err instanceof Error && "code" in err && err.code === "P2025") {
      return {
        ok: false,
        error:
          "Sua sessão é de um cadastro antigo. Saia e entre novamente pra continuar.",
      };
    }
    throw err;
  }

  // Sincronizar o JWT — propaga `name` pro cookie da sessão (sem precisar relogar)
  await unstable_update({
    user: { name: parsed.data.name },
  });

  revalidatePath("/conta");
  revalidatePath("/conta/dados");
  return { ok: true };
}

// =====================================================================
// ENDEREÇOS
// =====================================================================

export async function saveAddress(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autenticado." };

  const parsed = addressSchema.safeParse({
    id: formData.get("id") || undefined,
    label: formData.get("label"),
    recipientName: formData.get("recipientName"),
    zipCode: formData.get("zipCode"),
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement") || "",
    neighborhood: formData.get("neighborhood"),
    city: formData.get("city"),
    state: formData.get("state"),
    country: "BR",
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Confira os campos.",
      fields: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
          k,
          v?.[0] ?? "",
        ]),
      ),
    };
  }

  if (USE_DEMO) {
    return {
      ok: false,
      error: "Em modo demo os endereços não persistem. Configure o Supabase.",
    };
  }

  const { prisma } = await import("@/lib/prisma");
  const { id, isDefault, complement, ...rest } = parsed.data;

  // Se for default, desmarcar outros
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  if (id) {
    await prisma.address.update({
      where: { id, userId: session.user.id },
      data: { ...rest, complement: complement || null, isDefault },
    });
  } else {
    await prisma.address.create({
      data: {
        ...rest,
        complement: complement || null,
        isDefault,
        userId: session.user.id,
      },
    });
  }

  revalidatePath("/conta/enderecos");
  return { ok: true };
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Não autenticado." };

  if (USE_DEMO) {
    return { ok: false, error: "Modo demo." };
  }

  const { prisma } = await import("@/lib/prisma");
  await prisma.address.deleteMany({
    where: { id: addressId, userId: session.user.id },
  });

  revalidatePath("/conta/enderecos");
  return { ok: true };
}
