"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { ActionResult } from "@/server/actions/auth-actions";

const USE_DB = !!process.env.DATABASE_URL;

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Não autenticado." };
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return { ok: false as const, error: "Acesso negado." };
  }
  return { ok: true as const };
}

const couponSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(40)
    .transform((v) => v.toUpperCase()),
  description: z.string().max(200).nullable().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  discountValue: z.number().nonnegative(),
  minimumPurchase: z.number().nonnegative().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  startsAt: z.string(),
  expiresAt: z.string(),
  isActive: z.boolean().default(true),
  appliesToPreOrders: z.boolean().default(true),
});

export async function saveCoupon(
  couponId: string | null,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description") || null,
    discountType: formData.get("discountType"),
    discountValue: Number(formData.get("discountValue")),
    minimumPurchase: formData.get("minimumPurchase")
      ? Number(formData.get("minimumPurchase"))
      : null,
    maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    maxUsesPerUser: Number(formData.get("maxUsesPerUser") || 1),
    startsAt: formData.get("startsAt"),
    expiresAt: formData.get("expiresAt"),
    isActive: formData.get("isActive") === "on",
    appliesToPreOrders: formData.get("appliesToPreOrders") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const data = parsed.data;
  const { prisma } = await import("@/lib/prisma");

  // Code único
  const conflict = await prisma.coupon.findFirst({
    where: { code: data.code, ...(couponId && { id: { not: couponId } }) },
  });
  if (conflict) {
    return { ok: false, error: "Já existe um cupom com esse código." };
  }

  const payload = {
    code: data.code,
    description: data.description || null,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minimumPurchase: data.minimumPurchase ?? null,
    maxUses: data.maxUses ?? null,
    maxUsesPerUser: data.maxUsesPerUser,
    startsAt: new Date(data.startsAt),
    expiresAt: new Date(data.expiresAt),
    isActive: data.isActive,
    appliesToPreOrders: data.appliesToPreOrders,
  };

  if (couponId) {
    await prisma.coupon.update({ where: { id: couponId }, data: payload });
  } else {
    await prisma.coupon.create({ data: payload });
  }

  revalidatePath("/admin/cupons");
  redirect("/admin/cupons");
}

export async function deleteCoupon(couponId: string): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const { prisma } = await import("@/lib/prisma");
  await prisma.coupon.delete({ where: { id: couponId } });

  revalidatePath("/admin/cupons");
  return { ok: true };
}
