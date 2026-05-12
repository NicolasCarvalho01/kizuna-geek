import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AddressManager } from "@/components/account/address-manager";

export const metadata = { title: "Endereços" };

const USE_DEMO = !process.env.DATABASE_URL;

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Em modo demo, sem persistência — lista vazia. Com DB: prisma.address.findMany.
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

  if (!USE_DEMO) {
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
    <div className="space-y-8">
      <div>
        <Eyebrow index="—">Endereços</Eyebrow>
        <h2 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">
          Seus endereços de entrega
        </h2>
        <p className="mt-3 text-[var(--text-body)] text-[color:var(--color-fg-soft)] max-w-2xl leading-[var(--leading-relaxed)]">
          Cadastre endereços pra checkout mais rápido. Apenas um pode ser marcado
          como padrão por vez.
        </p>
      </div>

      <AddressManager initial={addresses} demoMode={USE_DEMO} />
    </div>
  );
}
