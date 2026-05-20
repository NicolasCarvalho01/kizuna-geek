"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { ActionResult } from "@/server/actions/auth-actions";
import type { ProductStatus, ProductType } from "@prisma/client";

const USE_DB = !!process.env.DATABASE_URL;

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Não autenticado." };
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return { ok: false as const, error: "Acesso negado." };
  }
  return { ok: true as const, userId: session.user.id };
}

// =====================================================================
// SCHEMAS
// =====================================================================

const dimensionsSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU obrigatório"),
  name: z.string().min(1, "Nome obrigatório"),
  priceOverride: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  isActive: z.boolean().default(true),
  imageUrl: z.string().nullable().optional(),

  tcgLanguage: z.string().nullable().optional(),
  tcgCondition: z.string().nullable().optional(),
  tcgEdition: z.string().nullable().optional(),
  tcgRarity: z.string().nullable().optional(),
  tcgIsFoil: z.boolean().nullable().optional(),
  tcgCardNumber: z.string().nullable().optional(),

  figureHasBox: z.boolean().nullable().optional(),
  figureBoxCondition: z.string().nullable().optional(),
  figureScale: z.string().nullable().optional(),
  figureManufacturer: z.string().nullable().optional(),
});

const productSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug só pode ter letras minúsculas, números e hífens"),
  sku: z.string().min(1),
  name: z.string().min(2).max(200),
  shortDescription: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  productType: z.enum(["ACTION_FIGURE", "TCG_SINGLE", "TCG_SEALED", "COLLECTIBLE", "OTHER"]),
  brand: z.string().nullable().optional(),
  franchise: z.string().nullable().optional(),
  basePrice: z.number().positive("Preço deve ser positivo"),
  compareAtPrice: z.number().positive().nullable().optional(),
  cost: z.number().nonnegative().nullable().optional(),
  weight: z.number().int().positive("Peso em gramas"),
  dimensions: dimensionsSchema,
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean().default(false),
  isPreOrder: z.boolean().default(false),
  releaseDate: z.string().nullable().optional(),
  preOrderEndsAt: z.string().nullable().optional(),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  variants: z.array(variantSchema).min(1, "Pelo menos uma variante"),
  imageUrls: z.array(z.string().url("URL inválida")).max(20),
  tagIds: z.array(z.string()).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

// =====================================================================
// CREATE
// =====================================================================

export async function createProduct(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const rawJson = formData.get("payload");
  if (typeof rawJson !== "string") {
    return { ok: false, error: "Payload ausente." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "Payload inválido." };
  }

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const data = parsed.data;

  const { prisma } = await import("@/lib/prisma");

  // Verifica slug + sku únicos
  const existing = await prisma.product.findFirst({
    where: { OR: [{ slug: data.slug }, { sku: data.sku }] },
  });
  if (existing) {
    return {
      ok: false,
      error:
        existing.slug === data.slug
          ? "Já existe um produto com esse slug."
          : "Já existe um produto com esse SKU.",
    };
  }

  // Verifica SKUs únicos entre variantes
  const skuSet = new Set<string>();
  for (const v of data.variants) {
    if (skuSet.has(v.sku)) {
      return { ok: false, error: `SKU duplicado nas variantes: ${v.sku}` };
    }
    skuSet.add(v.sku);
  }

  const product = await prisma.product.create({
    data: {
      slug: data.slug,
      sku: data.sku,
      name: data.name,
      shortDescription: data.shortDescription || null,
      description: data.description || null,
      categoryId: data.categoryId,
      productType: data.productType as ProductType,
      brand: data.brand || null,
      franchise: data.franchise || null,
      basePrice: data.basePrice,
      compareAtPrice: data.compareAtPrice ?? null,
      cost: data.cost ?? null,
      weight: data.weight,
      dimensions: data.dimensions as never,
      status: data.status as ProductStatus,
      featured: data.featured,
      isPreOrder: data.isPreOrder,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      preOrderEndsAt: data.preOrderEndsAt ? new Date(data.preOrderEndsAt) : null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      images: {
        create: data.imageUrls.map((url, idx) => ({
          url,
          altText: data.name,
          sortOrder: idx,
          isPrimary: idx === 0,
        })),
      },
      variants: {
        create: data.variants.map((v) => mapVariantData(v)),
      },
      ...(data.tagIds.length > 0 && {
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      }),
    },
  });

  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
  revalidatePath(`/produto/${product.slug}`);

  return { ok: true, data: { id: product.id } };
}

// =====================================================================
// UPDATE
// =====================================================================

export async function updateProduct(
  productId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const rawJson = formData.get("payload");
  if (typeof rawJson !== "string") {
    return { ok: false, error: "Payload ausente." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "Payload inválido." };
  }

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const data = parsed.data;
  const { prisma } = await import("@/lib/prisma");

  // Slug/SKU únicos (excluindo este produto)
  const conflict = await prisma.product.findFirst({
    where: {
      id: { not: productId },
      OR: [{ slug: data.slug }, { sku: data.sku }],
    },
  });
  if (conflict) {
    return {
      ok: false,
      error:
        conflict.slug === data.slug
          ? "Já existe outro produto com esse slug."
          : "Já existe outro produto com esse SKU.",
    };
  }

  await prisma.$transaction(async (tx) => {
    // Atualiza produto base
    await tx.product.update({
      where: { id: productId },
      data: {
        slug: data.slug,
        sku: data.sku,
        name: data.name,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        categoryId: data.categoryId,
        productType: data.productType as ProductType,
        brand: data.brand || null,
        franchise: data.franchise || null,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice ?? null,
        cost: data.cost ?? null,
        weight: data.weight,
        dimensions: data.dimensions as never,
        status: data.status as ProductStatus,
        featured: data.featured,
        isPreOrder: data.isPreOrder,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
        preOrderEndsAt: data.preOrderEndsAt ? new Date(data.preOrderEndsAt) : null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    // Imagens: estratégia simples — apaga todas e recria
    // (em prod com upload real, faríamos diff)
    await tx.productImage.deleteMany({ where: { productId } });
    if (data.imageUrls.length > 0) {
      await tx.productImage.createMany({
        data: data.imageUrls.map((url, idx) => ({
          productId,
          url,
          altText: data.name,
          sortOrder: idx,
          isPrimary: idx === 0,
        })),
      });
    }

    // Variantes: upsert por id, delete as removidas
    const existingVariants = await tx.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });
    const submittedIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id!));
    const toDelete = existingVariants
      .map((v) => v.id)
      .filter((id) => !submittedIds.has(id));

    if (toDelete.length > 0) {
      await tx.productVariant.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    for (const v of data.variants) {
      if (v.id) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: mapVariantData(v),
        });
      } else {
        await tx.productVariant.create({
          data: { ...mapVariantData(v), productId },
        });
      }
    }

    // Tags: substitui o set
    await tx.productTag.deleteMany({ where: { productId } });
    if (data.tagIds.length > 0) {
      await tx.productTag.createMany({
        data: data.tagIds.map((tagId) => ({ productId, tagId })),
      });
    }
  });

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/catalogo");
  revalidatePath(`/produto/${data.slug}`);

  return { ok: true };
}

// =====================================================================
// QUICK ACTIONS (sem form)
// =====================================================================

export async function setProductStatus(
  productId: string,
  status: ProductStatus,
): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const { prisma } = await import("@/lib/prisma");
  await prisma.product.update({
    where: { id: productId },
    data: { status },
  });

  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function deleteProductSoft(productId: string): Promise<ActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;
  if (!USE_DB) return { ok: false, error: "DB obrigatório." };

  const { prisma } = await import("@/lib/prisma");
  await prisma.product.update({
    where: { id: productId },
    data: { deletedAt: new Date(), status: "ARCHIVED" },
  });

  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function createProductAndRedirect(
  prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const res = await createProduct(prev, formData);
  if (res.ok && res.data) {
    redirect(`/admin/produtos/${(res.data as { id: string }).id}`);
  }
  return res;
}

// =====================================================================
// HELPERS
// =====================================================================

function mapVariantData(v: z.infer<typeof variantSchema>) {
  return {
    sku: v.sku,
    name: v.name,
    priceOverride: v.priceOverride ?? null,
    stock: v.stock,
    lowStockThreshold: v.lowStockThreshold,
    isActive: v.isActive,
    imageUrl: v.imageUrl ?? null,
    tcgLanguage: (v.tcgLanguage as never) ?? null,
    tcgCondition: (v.tcgCondition as never) ?? null,
    tcgEdition: v.tcgEdition ?? null,
    tcgRarity: v.tcgRarity ?? null,
    tcgIsFoil: v.tcgIsFoil ?? null,
    tcgCardNumber: v.tcgCardNumber ?? null,
    figureHasBox: v.figureHasBox ?? null,
    figureBoxCondition: (v.figureBoxCondition as never) ?? null,
    figureScale: v.figureScale ?? null,
    figureManufacturer: v.figureManufacturer ?? null,
  };
}
