import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AccountSidebar } from "@/components/account/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar?from=/conta");

  return (
    <div className="wrap pt-12 lg:pt-16 pb-24 lg:pb-32">
      <header className="mb-12 lg:mb-16">
        <Eyebrow index="—">Conta</Eyebrow>
        <h1 className="display mt-4 text-[clamp(2.25rem,5vw,3.75rem)]">
          Olá,{" "}
          <em className="display-italic text-[color:var(--color-gold)]">
            {session.user.name?.split(" ")[0] ?? "viajante"}
          </em>
          .
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-10 lg:gap-12">
        <AccountSidebar
          user={{
            name: session.user.name,
            email: session.user.email ?? "",
            role: session.user.role,
          }}
        />
        <div>{children}</div>
      </div>
    </div>
  );
}
