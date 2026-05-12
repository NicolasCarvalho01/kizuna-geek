import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata = {
  title: "Dados pessoais",
};

export default async function PersonalDataPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Em modo demo, carregamos da session direto. Com DB: buscar do Prisma com tudo.
  const userData = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    phone: "",
    cpf: "",
    birthDate: "",
    marketingOptIn: false,
  };

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

      <ProfileForm initial={userData} />
    </div>
  );
}
