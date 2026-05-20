import "server-only";
import {
  DEMO_PRODUCTS,
  type DemoProduct,
  type DemoVariant,
} from "@/server/demo-data";
import type { ProductType, TcgLanguage, TcgCondition, Prisma } from "@prisma/client";

const USE_DB = !!process.env.DATABASE_URL;

export type Product = DemoProduct;
export type Variant = DemoVariant;

// =====================================================================
// FILTROS
// =====================================================================

export interface ProductFilters {
  category?: string;
  q?: string;
  franchise?: string;
  brand?: string;
  preorderOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tcgLanguage?: TcgLanguage[];
  tcgCondition?: TcgCondition[];
  tcgFoilOnly?: boolean;
  figureHasBox?: boolean;
  inStock?: boolean;
}

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export interface ListOptions extends ProductFilters {
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FilterFacets {
  franchises: string[];
  brands: string[];
  tcgLanguages: TcgLanguage[];
  tcgConditions: TcgCondition[];
  priceRange: { min: number; max: number };
}

// =====================================================================
// MAPPER — Prisma DB row → shape interno (Product)
// =====================================================================

type DbProduct = Prisma.ProductGetPayload<{
  include: {
    category: { select: { id: true; slug: true; name: true; type: true } };
    images: true;
    variants: true;
    tags: { include: { tag: true } };
  };
}>;

function mapDbProductToProduct(p: DbProduct): Product {
  const dims = p.dimensions as { length: number; width: number; height: number } | null;
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    categoryId: p.categoryId,
    category: {
      id: p.category.id,
      slug: p.category.slug,
      name: p.category.name,
      type: p.category.type,
    },
    productType: p.productType,
    brand: p.brand,
    franchise: p.franchise,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    weight: p.weight,
    dimensions: dims ?? { length: 10, width: 10, height: 5 },
    status: p.status,
    featured: p.featured,
    isPreOrder: p.isPreOrder,
    releaseDate: p.releaseDate,
    preOrderEndsAt: p.preOrderEndsAt,
    images: p.images
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
    variants: p.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
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
    tags: p.tags.map((pt) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      slug: pt.tag.slug,
    })),
  };
}

// =====================================================================
// HELPERS (demo + shared)
// =====================================================================

function variantPrice(v: Variant, base: number): number {
  return v.priceOverride ?? base;
}

function isAvailableProduct(p: Product, opts: ProductFilters): boolean {
  if (p.status !== "ACTIVE") return false;

  if (opts.category && opts.category !== "all") {
    const slug = p.category.slug;
    if (slug !== opts.category && !slug.startsWith(`${opts.category}-`)) {
      return false;
    }
  }

  if (opts.q) {
    const q = opts.q.toLowerCase();
    const haystack = [p.name, p.brand, p.franchise, p.shortDescription]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  if (opts.franchise && p.franchise !== opts.franchise) return false;
  if (opts.brand && p.brand !== opts.brand) return false;
  if (opts.preorderOnly && !p.isPreOrder) return false;

  const minVariantPrice = Math.min(
    ...p.variants.map((v) => variantPrice(v, p.basePrice)),
  );
  if (opts.minPrice && minVariantPrice < opts.minPrice) return false;
  if (opts.maxPrice && minVariantPrice > opts.maxPrice) return false;

  if (opts.inStock) {
    const anyStock = p.variants.some((v) => v.isActive && v.stock > 0);
    if (!anyStock) return false;
  }

  if (opts.tcgLanguage?.length) {
    const ok = p.variants.some(
      (v) => v.tcgLanguage && opts.tcgLanguage!.includes(v.tcgLanguage),
    );
    if (!ok) return false;
  }

  if (opts.tcgCondition?.length) {
    const ok = p.variants.some(
      (v) => v.tcgCondition && opts.tcgCondition!.includes(v.tcgCondition),
    );
    if (!ok) return false;
  }

  if (opts.tcgFoilOnly) {
    if (!p.variants.some((v) => v.tcgIsFoil)) return false;
  }

  if (opts.figureHasBox !== undefined) {
    const ok = p.variants.some((v) => v.figureHasBox === opts.figureHasBox);
    if (!ok) return false;
  }

  return true;
}

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    case "price-asc":
      return copy.sort((a, b) => a.basePrice - b.basePrice);
    case "price-desc":
      return copy.sort((a, b) => b.basePrice - a.basePrice);
    case "newest":
      return copy.reverse();
    case "featured":
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

/**
 * Resolve um slug de categoria para os IDs no DB.
 * Se for slug raiz (ex: "tcg"), retorna IDs da categoria + todas as filhas.
 */
async function resolveCategoryIds(slug: string): Promise<string[]> {
  const { prisma } = await import("@/lib/prisma");
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: { children: { select: { id: true } } },
  });
  if (!cat) return [];
  return [cat.id, ...cat.children.map((c) => c.id)];
}

// =====================================================================
// API PÚBLICA — listProducts
// =====================================================================

export async function listProducts(
  options: ListOptions = {},
): Promise<PaginatedProducts> {
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.max(1, Math.min(48, options.perPage ?? 12));
  const sort: SortKey = options.sort ?? "featured";

  // -------- DEMO path --------
  if (!USE_DB) {
    const filtered = DEMO_PRODUCTS.filter((p) => isAvailableProduct(p, options));
    const sorted = sortProducts(filtered, sort);
    const total = sorted.length;
    const start = (page - 1) * perPage;
    return {
      products: sorted.slice(start, start + perPage),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  // -------- Prisma path --------
  const { prisma } = await import("@/lib/prisma");

  // Resolver category slug → IDs (inclui filhas)
  let categoryIds: string[] | null = null;
  if (options.category && options.category !== "all") {
    categoryIds = await resolveCategoryIds(options.category);
    if (categoryIds.length === 0) {
      return { products: [], total: 0, page, perPage, totalPages: 1 };
    }
  }

  // WHERE base
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    deletedAt: null,
    ...(categoryIds && { categoryId: { in: categoryIds } }),
    ...(options.franchise && { franchise: options.franchise }),
    ...(options.brand && { brand: options.brand }),
    ...(options.preorderOnly && { isPreOrder: true }),
    ...(options.q && {
      OR: [
        { name: { contains: options.q, mode: "insensitive" } },
        { brand: { contains: options.q, mode: "insensitive" } },
        { franchise: { contains: options.q, mode: "insensitive" } },
        { shortDescription: { contains: options.q, mode: "insensitive" } },
      ],
    }),
    ...(options.inStock && {
      variants: { some: { isActive: true, stock: { gt: 0 } } },
    }),
    ...(options.tcgLanguage?.length && {
      variants: { some: { tcgLanguage: { in: options.tcgLanguage } } },
    }),
    ...(options.tcgCondition?.length && {
      variants: { some: { tcgCondition: { in: options.tcgCondition } } },
    }),
    ...(options.tcgFoilOnly && { variants: { some: { tcgIsFoil: true } } }),
    ...(options.figureHasBox !== undefined && {
      variants: { some: { figureHasBox: options.figureHasBox } },
    }),
  };

  // Filtros de preço — feitos por basePrice (variantPrice override é tratado em app)
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    where.basePrice = {
      ...(options.minPrice !== undefined && { gte: options.minPrice }),
      ...(options.maxPrice !== undefined && { lte: options.maxPrice }),
    };
  }

  // ORDER BY
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "name-asc"
      ? [{ name: "asc" }]
      : sort === "price-asc"
        ? [{ basePrice: "asc" }]
        : sort === "price-desc"
          ? [{ basePrice: "desc" }]
          : sort === "newest"
            ? [{ createdAt: "desc" }]
            : [{ featured: "desc" }, { createdAt: "desc" }];

  const [total, dbProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        category: { select: { id: true, slug: true, name: true, type: true } },
        images: true,
        variants: true,
        tags: { include: { tag: true } },
      },
    }),
  ]);

  return {
    products: dbProducts.map(mapDbProductToProduct),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

// =====================================================================
// getProductBySlug
// =====================================================================

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!USE_DB) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
  const { prisma } = await import("@/lib/prisma");
  const dbProduct = await prisma.product.findUnique({
    where: { slug, deletedAt: null },
    include: {
      category: { select: { id: true, slug: true, name: true, type: true } },
      images: true,
      variants: true,
      tags: { include: { tag: true } },
    },
  });
  return dbProduct ? mapDbProductToProduct(dbProduct) : null;
}

// =====================================================================
// getFeaturedProducts
// =====================================================================

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (!USE_DB) {
    return DEMO_PRODUCTS.filter((p) => p.featured && p.status === "ACTIVE").slice(
      0,
      limit,
    );
  }
  const { prisma } = await import("@/lib/prisma");
  const products = await prisma.product.findMany({
    where: { featured: true, status: "ACTIVE", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: { select: { id: true, slug: true, name: true, type: true } },
      images: true,
      variants: true,
      tags: { include: { tag: true } },
    },
  });
  return products.map(mapDbProductToProduct);
}

// =====================================================================
// getProductsByType (TCG agrupa single + sealed)
// =====================================================================

export async function getProductsByType(
  type: ProductType,
  limit = 4,
): Promise<Product[]> {
  const matchTypes: ProductType[] =
    type === "TCG_SINGLE" || type === "TCG_SEALED"
      ? ["TCG_SINGLE", "TCG_SEALED"]
      : [type];

  if (!USE_DB) {
    return DEMO_PRODUCTS.filter(
      (p) => p.status === "ACTIVE" && matchTypes.includes(p.productType),
    ).slice(0, limit);
  }

  const { prisma } = await import("@/lib/prisma");
  const products = await prisma.product.findMany({
    where: {
      productType: { in: matchTypes },
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      category: { select: { id: true, slug: true, name: true, type: true } },
      images: true,
      variants: true,
      tags: { include: { tag: true } },
    },
  });
  return products.map(mapDbProductToProduct);
}

// =====================================================================
// getPreOrderProducts
// =====================================================================

export async function getPreOrderProducts(limit = 6): Promise<Product[]> {
  if (!USE_DB) {
    return DEMO_PRODUCTS.filter(
      (p) => p.isPreOrder && p.status === "ACTIVE",
    ).slice(0, limit);
  }
  const { prisma } = await import("@/lib/prisma");
  const products = await prisma.product.findMany({
    where: { isPreOrder: true, status: "ACTIVE", deletedAt: null },
    orderBy: { releaseDate: "asc" },
    take: limit,
    include: {
      category: { select: { id: true, slug: true, name: true, type: true } },
      images: true,
      variants: true,
      tags: { include: { tag: true } },
    },
  });
  return products.map(mapDbProductToProduct);
}

// =====================================================================
// getRelatedProducts
// =====================================================================

export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<Product[]> {
  if (!USE_DB) {
    const reference = DEMO_PRODUCTS.find((p) => p.id === productId);
    if (!reference) return [];
    return DEMO_PRODUCTS.filter(
      (p) =>
        p.id !== productId &&
        p.status === "ACTIVE" &&
        (p.category.slug === reference.category.slug ||
          p.franchise === reference.franchise),
    ).slice(0, limit);
  }

  const { prisma } = await import("@/lib/prisma");
  const reference = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, franchise: true },
  });
  if (!reference) return [];

  const products = await prisma.product.findMany({
    where: {
      id: { not: productId },
      status: "ACTIVE",
      deletedAt: null,
      OR: [
        { categoryId: reference.categoryId },
        ...(reference.franchise ? [{ franchise: reference.franchise }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: { select: { id: true, slug: true, name: true, type: true } },
      images: true,
      variants: true,
      tags: { include: { tag: true } },
    },
  });
  return products.map(mapDbProductToProduct);
}

// =====================================================================
// getFilterFacets
// =====================================================================

export async function getFilterFacets(
  scopeCategory?: string,
): Promise<FilterFacets> {
  if (!USE_DB) {
    const inScope =
      scopeCategory && scopeCategory !== "all"
        ? DEMO_PRODUCTS.filter(
            (p) =>
              p.category.slug === scopeCategory ||
              p.category.slug.startsWith(`${scopeCategory}-`),
          )
        : DEMO_PRODUCTS;

    return computeFacets(inScope);
  }

  const { prisma } = await import("@/lib/prisma");
  let categoryIds: string[] | null = null;
  if (scopeCategory && scopeCategory !== "all") {
    categoryIds = await resolveCategoryIds(scopeCategory);
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      ...(categoryIds && { categoryId: { in: categoryIds } }),
    },
    include: {
      category: { select: { id: true, slug: true, name: true, type: true } },
      images: true,
      variants: true,
      tags: { include: { tag: true } },
    },
  });

  return computeFacets(products.map(mapDbProductToProduct));
}

function computeFacets(products: ReadonlyArray<Product>): FilterFacets {
  const franchises = [
    ...new Set(products.map((p) => p.franchise).filter(Boolean) as string[]),
  ].sort();
  const brands = [
    ...new Set(products.map((p) => p.brand).filter(Boolean) as string[]),
  ].sort();

  const tcgLanguages = [
    ...new Set(
      products.flatMap((p) =>
        p.variants.map((v) => v.tcgLanguage).filter(Boolean),
      ) as TcgLanguage[],
    ),
  ];
  const tcgConditions = [
    ...new Set(
      products.flatMap((p) =>
        p.variants.map((v) => v.tcgCondition).filter(Boolean),
      ) as TcgCondition[],
    ),
  ];

  const prices = products.flatMap((p) =>
    p.variants.map((v) => variantPrice(v, p.basePrice)),
  );
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  return {
    franchises,
    brands,
    tcgLanguages,
    tcgConditions,
    priceRange: { min, max },
  };
}
