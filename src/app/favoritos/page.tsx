import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { PageBack } from "@/components/shared/page-back";
import { FavoritesList } from "@/components/account/favorites-list";
import { DEMO_PRODUCTS } from "@/server/demo-data";

export const metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar?from=/favoritos");

  // Lista completa de produtos disponíveis — o componente client filtra
  // baseado na wishlist store.
  const products = DEMO_PRODUCTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    franchise: p.franchise,
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    isPreOrder: p.isPreOrder,
    releaseDate: p.releaseDate?.toISOString() ?? null,
    image: p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? null,
    stock: p.variants.reduce((acc, v) => acc + v.stock, 0),
  }));

  return (
    <div className="wrap pt-12 lg:pt-16 pb-24 lg:pb-32">
      <header className="mb-12 lg:mb-16">
        <PageBack fallback="/conta" label="Voltar" className="mb-6" />
        <Eyebrow index="—">Favoritos</Eyebrow>
        <h1 className="display mt-4 text-[clamp(2.25rem,5vw,3.75rem)]">
          Sua{" "}
          <em className="display-italic text-[color:var(--color-gold)]">wishlist</em>{" "}
          curada.
        </h1>
        <p className="mt-5 max-w-2xl text-[var(--text-body)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
          Itens que você marcou pra acompanhar. Ative o sino 🔔 em cada um pra ser
          avisado quando voltar ao estoque ou sair da pré-venda.
        </p>
      </header>

      <FavoritesList products={products} />

      <div className="mt-16 pt-10 border-t border-[color:var(--color-hairline)] flex items-center justify-between">
        <p className="eyebrow">Você pode favoritar até 200 itens</p>
        <Button asChild variant="outline">
          <Link href="/catalogo">Explorar o catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
