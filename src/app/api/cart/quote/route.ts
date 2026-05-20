import { NextResponse } from "next/server";
import { z } from "zod";
import { quoteShipping } from "@/server/actions/shipping-actions";

const USE_DB = !!process.env.DATABASE_URL;

const requestSchema = z.object({
  destinationZip: z.string(),
  variantIds: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

/**
 * Cotação a partir dos IDs de variant do carrinho.
 * Recompõe peso/dimensões consultando o DB e chama o ME via `quoteShipping`.
 */
export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  if (!USE_DB) {
    return NextResponse.json(
      { error: "Cotação requer Supabase configurado." },
      { status: 503 },
    );
  }

  const { prisma } = await import("@/lib/prisma");

  // Buscar variants + produtos pra obter peso/dimensões reais
  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: parsed.data.variantIds.map((v) => v.variantId) },
      isActive: true,
    },
    select: {
      id: true,
      priceOverride: true,
      product: {
        select: {
          id: true,
          basePrice: true,
          weight: true,
          dimensions: true,
        },
      },
    },
  });

  if (variants.length !== parsed.data.variantIds.length) {
    return NextResponse.json(
      { error: "Alguns itens do carrinho não estão mais disponíveis." },
      { status: 410 },
    );
  }

  const qtyMap = new Map(
    parsed.data.variantIds.map((v) => [v.variantId, v.quantity]),
  );

  const items = variants.map((variant) => {
    const dims = variant.product.dimensions as {
      length?: number;
      width?: number;
      height?: number;
    } | null;
    return {
      productId: variant.product.id,
      weightGrams: variant.product.weight,
      length: Number(dims?.length ?? 10),
      width: Number(dims?.width ?? 10),
      height: Number(dims?.height ?? 5),
      unitPrice: Number(variant.priceOverride ?? variant.product.basePrice),
      quantity: qtyMap.get(variant.id) ?? 1,
    };
  });

  const result = await quoteShipping({
    destinationZip: parsed.data.destinationZip,
    items,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json(result.data);
}
