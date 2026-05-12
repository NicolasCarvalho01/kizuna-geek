import "server-only";
import { DEMO_CATEGORIES, type DemoCategory } from "@/server/demo-data";

const USE_DEMO = !process.env.DATABASE_URL;

export type Category = DemoCategory;

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (USE_DEMO) {
    return DEMO_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }
  return DEMO_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export async function listRootCategories(): Promise<CategoryWithChildren[]> {
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

export async function listAllCategories(): Promise<Category[]> {
  return [...DEMO_CATEGORIES].sort((a, b) => a.sortOrder - b.sortOrder);
}
