import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata = {
  title: "Dados pessoais",
};

const USE_DEMO = !process.env.DATABASE_URL;

export default async function PersonalDataPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Carrega do DB quando disponível — fonte canônica (evita stale JWT).
  // Em modo demo, cai pra session direto.
  let profile = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    phone: "",
    cpf: "",
    birthDate: "",
    marketingOptIn: false,
  };

  if (!USE_DEMO) {
    const { prisma } = await import("@/lib/prisma");
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        cpf: true,
        birthDate: true,
        marketingOptIn: true,
      },
    });
    if (dbUser) {
      profile = {
        name: dbUser.name ?? "",
        email: dbUser.email,
        phone: dbUser.phone ?? "",
        cpf: dbUser.cpf ?? "",
        birthDate: dbUser.birthDate
          ? dbUser.birthDate.toISOString().slice(0, 10)
          : "",
        marketingOptIn: dbUser.marketingOptIn,
      };
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow index="—">Dados pessoais</Eyebrow>
        <h2 className="display mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">
          Suas informações
        </h2>
        <p className="mt-3 text-[var(--text-body)] text-[color:var(--color-fg-soft)] max-w-2xl leading-[var(--leading-relaxed)]">
          Estes dados são usados pra emissão de NF-e, comunicação sobre pedidos e
          recuperação de conta. Tudo é tratado conforme LGPD.
        </p>
      </div>

      <ProfileForm initial={profile} />
    </div>
  );
}
