import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageBack } from "@/components/shared/page-back";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Editar produto · Admin" };

const USE_DB = !!process.env.DATABASE_URL;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  if (!USE_DB) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
        <h2 className="display text-[1.5rem]">Modo demo</h2>
        <Link href="/admin/produtos" className="text-[color:var(--color-gold)]">
          Voltar
        </Link>
      </div>
    );
  }

  const { prisma } = await import("@/lib/prisma");

  const [product, categories, tags] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, type: true, parentId: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const dims = product.dimensions as
    | { length: number; width: number; height: number }
    | null;

  const initialValues = {
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    categoryId: product.categoryId,
    productType: product.productType,
    brand: product.brand ?? "",
    franchise: product.franchise ?? "",
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    cost: product.cost ? Number(product.cost) : null,
    weight: product.weight,
    dimensions: dims ?? { length: 10, width: 10, height: 5 },
    status: product.status,
    featured: product.featured,
    isPreOrder: product.isPreOrder,
    releaseDate: product.releaseDate
      ? product.releaseDate.toISOString().slice(0, 10)
      : "",
    preOrderEndsAt: product.preOrderEndsAt
      ? product.preOrderEndsAt.toISOString().slice(0, 10)
      : "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    imageUrls: product.images.map((i) => i.url),
    tagIds: product.tags.map((t) => t.tag.id),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      isActive: v.isActive,
      imageUrl: v.imageUrl,
      tcgLanguage: v.tcgLanguage,
      tcgCondition: v.tcgCondition,
      tcgEdition: v.tcgEdition,
      tcgRarity: v.tcgRarity,
      tcgIsFoil: v.tcgIsFoil,
      tcgCardNumber: v.tcgCardNumber,
      figureHasBox: v.figureHasBox,
      figureBoxCondition: v.figureBoxCondition,
      figureScale: v.figureScale,
      figureManufacturer: v.figureManufacturer,
    })),
  };

  return (
    <div className="space-y-8">
      <header>
        <PageBack fallback="/admin/produtos" label="Voltar pra produtos" className="mb-5" />
        <Eyebrow index="—">Catálogo · editar</Eyebrow>
        <h1 className="display mt-3 text-[clamp(1.875rem,3.5vw,2.5rem)]">
          {product.name}
        </h1>
        <p className="mt-2 eyebrow">SKU {product.sku}</p>
      </header>

      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories}
        tags={tags}
        initialValues={initialValues}
      />
    </div>
  );
}
