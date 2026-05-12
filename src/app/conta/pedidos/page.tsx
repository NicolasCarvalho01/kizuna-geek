import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Meus pedidos",
};

export default async function OrdersPage() {
  // Pedidos reais entram na Fase 4 (checkout) — por enquanto, empty state honesto
  const orders: never[] = [];

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow index="—">Pedidos</Eyebrow>
        <h2 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">
          Histórico de compras
        </h2>
      </div>

      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <ul>{/* Lista virá com checkout funcionando */}</ul>
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-border-strong)] p-10 lg:p-14 text-center">
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[5rem] leading-none font-black text-[color:var(--color-gold)]/40"
      >
        箱
      </span>
      <h3 className="display text-[1.5rem] mt-5">Nenhum pedido ainda</h3>
      <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] max-w-md mx-auto leading-[var(--leading-relaxed)]">
        Quando você fechar a primeira compra, ela vai aparecer aqui com timeline de
        status, link de rastreio e NF-e pra download.
      </p>
      <Button asChild className="mt-6">
        <Link href="/catalogo">Explorar o catálogo</Link>
      </Button>
    </div>
  );
}
