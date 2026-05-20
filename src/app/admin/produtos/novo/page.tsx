import Link from "next/link";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageBack } from "@/components/shared/page-back";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Novo produto · Admin" };

const USE_DB = !!process.env.DATABASE_URL;

export default async function NewProductPage() {
  if (!USE_DB) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 text-center">
        <h2 className="display text-[1.5rem]">Modo demo</h2>
        <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
          Cadastrar produtos exige Supabase configurado.
        </p>
        <Link
          href="/admin/produtos"
          className="mt-4 inline-block text-[color:var(--color-gold)]"
        >
          Voltar
        </Link>
      </div>
    );
  }

  const { prisma } = await import("@/lib/prisma");
  const [categories, tags] = await Promise.all([
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

  if (categories.length === 0) {
    redirect("/admin/configuracoes?error=no-categories");
  }

  return (
    <div className="space-y-8">
      <header>
        <PageBack fallback="/admin/produtos" label="Voltar pra produtos" className="mb-5" />
        <Eyebrow index="—">Catálogo · novo</Eyebrow>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3rem)]">
          Novo{" "}
          <em className="display-italic text-[color:var(--color-gold)]">produto</em>
        </h1>
      </header>

      <ProductForm mode="create" categories={categories} tags={tags} />
    </div>
  );
}
