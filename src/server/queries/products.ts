import "server-only";
import {
  DEMO_PRODUCTS,
  type DemoProduct,
  type DemoVariant,
} from "@/server/demo-data";
import type { ProductType, TcgLanguage, TcgCondition } from "@prisma/client";

// Detecção do datasource: enquanto não há DATABASE_URL, servimos demo data.
// Fase 5 troca pra Prisma real quando o Supabase estiver configurado.
const USE_DEMO = !process.env.DATABASE_URL;

export type Product = DemoProduct;
export type Variant = DemoVariant;

// =====================================================================
// FILTROS
// =====================================================================

export interface ProductFilters {
  /** slug da categoria (raiz ou subcategoria) */
  category?: string;
  /** texto livre — busca em name, brand, franchise */
  q?: string;
  /** franquia exata */
  franchise?: string;
  /** marca exata */
  brand?: string;
  /** apenas produtos com pré-venda */
  preorderOnly?: boolean;
  /** faixa de preço */
  minPrice?: number;
  maxPrice?: number;
  /** filtros TCG */
  tcgLanguage?: TcgLanguage[];
  tcgCondition?: TcgCondition[];
  tcgFoilOnly?: boolean;
  /** filtros figure */
  figureHasBox?: boolean;
  /** apenas em estoque */
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

// =====================================================================
// HELPERS para demo
// =====================================================================

function variantPrice(v: Variant, base: number): number {
  return v.priceOverride ?? base;
}

function isAvailableProduct(p: Product, opts: ProductFilters): boolean {
  if (p.status !== "ACTIVE") return false;

  if (opts.category && opts.category !== "all") {
    // Aceita match na categoria do produto OU em categoria-pai
    // Em produção, fariamos JOIN com a árvore; em demo, basta comparar slug raiz.
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
      return copy.reverse(); // demo: ordem inversa da declaração
    case "featured":
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export async function listProducts(
  options: ListOptions = {},
): Promise<PaginatedProducts> {
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.max(1, Math.min(48, options.perPage ?? 12));
  const sort: SortKey = options.sort ?? "featured";

  if (USE_DEMO) {
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

  // Caminho Prisma — ativado quando DATABASE_URL existe.
  // Implementado em Fase 5 com queries reais; por enquanto fallback pra demo.
  return listProducts({ ...options, page, perPage });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (USE_DEMO) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
  // TODO Fase 5: trocar pra Prisma
  return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (USE_DEMO) {
    return DEMO_PRODUCTS.filter((p) => p.featured && p.status === "ACTIVE").slice(
      0,
      limit,
    );
  }
  return DEMO_PRODUCTS.filter((p) => p.featured).slice(0, limit);
}

export async function getProductsByType(
  type: ProductType,
  limit = 4,
): Promise<Product[]> {
  const filter = (p: Product) =>
    p.status === "ACTIVE" && (type === "TCG_SINGLE" || type === "TCG_SEALED"
      ? p.productType === "TCG_SINGLE" || p.productType === "TCG_SEALED"
      : p.productType === type);

  if (USE_DEMO) {
    return DEMO_PRODUCTS.filter(filter).slice(0, limit);
  }
  return DEMO_PRODUCTS.filter(filter).slice(0, limit);
}

export async function getPreOrderProducts(limit = 6): Promise<Product[]> {
  return DEMO_PRODUCTS.filter(
    (p) => p.isPreOrder && p.status === "ACTIVE",
  ).slice(0, limit);
}

export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<Product[]> {
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

/**
 * Coleta valores únicos pra popular dropdowns de filtro (franquias, marcas, etc).
 */
export interface FilterFacets {
  franchises: string[];
  brands: string[];
  tcgLanguages: TcgLanguage[];
  tcgConditions: TcgCondition[];
  priceRange: { min: number; max: number };
}

export async function getFilterFacets(
  scopeCategory?: string,
): Promise<FilterFacets> {
  const inScope = scopeCategory && scopeCategory !== "all"
    ? DEMO_PRODUCTS.filter(
        (p) =>
          p.category.slug === scopeCategory ||
          p.category.slug.startsWith(`${scopeCategory}-`),
      )
    : DEMO_PRODUCTS;

  const franchises = [
    ...new Set(inScope.map((p) => p.franchise).filter(Boolean) as string[]),
  ].sort();
  const brands = [
    ...new Set(inScope.map((p) => p.brand).filter(Boolean) as string[]),
  ].sort();

  const tcgLanguages = [
    ...new Set(
      inScope.flatMap((p) =>
        p.variants.map((v) => v.tcgLanguage).filter(Boolean),
      ) as TcgLanguage[],
    ),
  ];
  const tcgConditions = [
    ...new Set(
      inScope.flatMap((p) =>
        p.variants.map((v) => v.tcgCondition).filter(Boolean),
      ) as TcgCondition[],
    ),
  ];

  const prices = inScope.flatMap((p) =>
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
