import "server-only";
import { DEMO_CATEGORIES, type DemoCategory } from "@/server/demo-data";
import type { Prisma } from "@prisma/client";

const USE_DB = !!process.env.DATABASE_URL;

export type Category = DemoCategory;

export interface CategoryWithChildren extends Category {
  children: Category[];
}

type DbCategory = Prisma.CategoryGetPayload<object>;

function mapDbCategory(c: DbCategory, productCount = 0): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    type: c.type,
    sortOrder: c.sortOrder,
    productCount,
  };
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!USE_DB) {
    return DEMO_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }
  const { prisma } = await import("@/lib/prisma");
  const cat = await prisma.category.findUnique({ where: { slug, deletedAt: null } });
  return cat ? mapDbCategory(cat) : null;
}

export async function listRootCategories(): Promise<CategoryWithChildren[]> {
  if (!USE_DB) {
    const roots = DEMO_CATEGORIES.filter((c) => !c.parentId).sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    return roots.map((root) => ({
      ...root,
      children: DEMO_CATEGORIES.filter((c) => c.parentId === root.id).sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    }));
  }

  const { prisma } = await import("@/lib/prisma");
  const roots = await prisma.category.findMany({
    where: { parentId: null, deletedAt: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        where: { deletedAt: null, isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return roots.map((root) => ({
    ...mapDbCategory(root),
    children: root.children.map((c) => mapDbCategory(c)),
  }));
}

export async function listAllCategories(): Promise<Category[]> {
  if (!USE_DB) {
    return [...DEMO_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const { prisma } = await import("@/lib/prisma");
  const cats = await prisma.category.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return cats.map((c) => mapDbCategory(c));
}
