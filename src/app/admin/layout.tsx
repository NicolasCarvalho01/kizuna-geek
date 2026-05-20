import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin · Kizuna Geek",
};

/**
 * Layout do painel admin.
 *
 * — Protegido por middleware (auth.config.ts já bloqueia roles != ADMIN/STAFF)
 * — SiteHeader/SiteFooter NÃO renderizam aqui (admin tem layout próprio)
 *
 * O layout root (`app/layout.tsx`) ainda envolve esta árvore com `<html>` + fonts
 * + ThemeProvider + grain — apenas o header/footer do site público fica fora.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar?from=/admin");
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/");
  }

  return (
    <div className="min-h-svh flex bg-[color:var(--color-bg)]">
      {/* Sidebar fixa */}
      <div className="hidden lg:flex w-64 shrink-0 border-r border-[color:var(--color-hairline)] bg-[color:var(--color-bg-sunken)] sticky top-0 h-svh">
        <div className="w-full">
          <AdminSidebar
            user={{
              name: session.user.name,
              email: session.user.email,
              role: session.user.role,
            }}
          />
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="px-6 py-8 lg:px-10 lg:py-10 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
