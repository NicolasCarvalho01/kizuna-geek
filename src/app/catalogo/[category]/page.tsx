import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, listAllCategories } from "@/server/queries/categories";
import CatalogPage from "../page";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  const all = await listAllCategories();
  return all.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria" };
  return {
    title: `${category.name} · Catálogo`,
    description: category.description ?? `${category.name} — curadoria Kizuna Geek.`,
  };
}

export default async function CategoryRoute(props: CategoryPageProps) {
  const { category: slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return <CatalogPage {...props} />;
}
