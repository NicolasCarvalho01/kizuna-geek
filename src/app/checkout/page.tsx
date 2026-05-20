import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PageBack } from "@/components/shared/page-back";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata = {
  title: "Finalizar compra",
};

const USE_DB = !!process.env.DATABASE_URL;

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/entrar?from=/checkout");
  }

  let addresses: Array<{
    id: string;
    label: string;
    recipientName: string;
    zipCode: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    isDefault: boolean;
  }> = [];

  if (USE_DB) {
    const { prisma } = await import("@/lib/prisma");
    addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, label: true, recipientName: true, zipCode: true,
        street: true, number: true, complement: true, neighborhood: true,
        city: true, state: true, isDefault: true,
      },
    });
  }

  return (
    <div className="wrap pt-12 lg:pt-16 pb-24 lg:pb-32">
      <header className="mb-10">
        <PageBack fallback="/carrinho" label="Voltar pra sacola" className="mb-6" />
        <Eyebrow index="—">Checkout</Eyebrow>
        <h1 className="display mt-4 text-[clamp(2.25rem,5vw,3.75rem)]">
          Finalizar{" "}
          <em className="display-italic text-[color:var(--color-gold)]">compra</em>
          .
        </h1>
      </header>

      <CheckoutFlow addresses={addresses} demoMode={!USE_DB} />
    </div>
  );
}
