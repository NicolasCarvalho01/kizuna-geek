import type { MetadataRoute } from "next";

const USE_DB = !!process.env.DATABASE_URL;
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://kizunageek.com.br").replace(
  /\/$/,
  "",
);

// Sitemap.xml dinâmico: páginas estáticas + categorias + produtos do DB.
// Next.js gera /sitemap.xml automaticamente a partir desse arquivo.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ---- Páginas estáticas ----
  const staticRoutes: MetadataRoute.Sitemap = [
    // === Páginas principais ===
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    {
      url: `${BASE_URL}/catalogo`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/lancamentos`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pre-venda`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },

    // === Páginas institucionais ===
    {
      url: `${BASE_URL}/sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contato`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/perguntas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/entrega`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/trocas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },

    // === Auth ===
    {
      url: `${BASE_URL}/entrar`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cadastrar`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    // === Legal (LGPD) — indexar pra mostrar transparência ===
    {
      url: `${BASE_URL}/privacidade`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/termos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Sem DB? devolve só as rotas estáticas — válido pra demo/local sem banco.
  if (!USE_DB) return staticRoutes;

  try {
    const { prisma } = await import("@/lib/prisma");

    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, deletedAt: null },
        select: { slug: true, updatedAt: true, parentId: true },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", deletedAt: null },
        select: { slug: true, updatedAt: true, featured: true, isPreOrder: true },
        // Cap pra evitar sitemap de 50k+ URLs (limite Google = 50k por arquivo)
        take: 45000,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories
      // Só raiz vai pro sitemap principal — subcategorias entram via filtros
      .filter((c) => !c.parentId)
      .map((c) => ({
        url: `${BASE_URL}/catalogo/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/produto/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: p.isPreOrder ? ("weekly" as const) : ("monthly" as const),
      priority: p.featured ? 0.8 : 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (err) {
    console.error("[sitemap] DB fetch failed, returning static only:", err);
    return staticRoutes;
  }
}
