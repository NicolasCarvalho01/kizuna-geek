import Link from "next/link";
import { auth } from "@/auth";
import { ArrowUpRight, Heart, MapPin, Package, ShoppingBag } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

export default async function AccountDashboardPage() {
  const session = await auth();
  const role = session?.user?.role ?? "CUSTOMER";

  return (
    <div className="space-y-12">
      {/* KPIs */}
      <section>
        <Eyebrow index="01">Resumo</Eyebrow>
        <ul className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Pedidos", value: "0", Icon: Package, href: "/conta/pedidos" },
            { label: "Favoritos", value: "0", Icon: Heart, href: "/favoritos" },
            { label: "Endereços", value: "0", Icon: MapPin, href: "/conta/enderecos" },
            { label: "Sacola", value: "—", Icon: ShoppingBag, href: "/carrinho" },
          ].map(({ label, value, Icon, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="group flex flex-col gap-4 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5 hover:border-[color:var(--color-gold)] transition-colors"
              >
                <Icon className="h-4 w-4 text-[color:var(--color-gold)]" strokeWidth={1.5} />
                <div>
                  <p className="font-[var(--font-display)] text-[1.75rem] leading-none">
                    {value}
                  </p>
                  <p className="mt-1.5 eyebrow">{label}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Próximas ações */}
      <section>
        <Eyebrow index="02">Próximos passos</Eyebrow>
        <ul className="mt-5 space-y-2">
          {[
            { label: "Adicione um endereço de entrega", href: "/conta/enderecos", done: false },
            { label: "Complete seus dados pessoais", href: "/conta/dados", done: false },
            { label: "Adicione produtos aos favoritos", href: "/catalogo", done: false },
          ].map((step) => (
            <li key={step.label}>
              <Link
                href={step.href}
                className="group flex items-center justify-between py-4 px-5 rounded-[var(--radius-md)] border border-[color:var(--color-hairline)] hover:border-[color:var(--color-gold)] transition-colors"
              >
                <span className="flex items-center gap-3 text-[var(--text-body)] text-[color:var(--color-fg)]">
                  <span
                    className={
                      step.done
                        ? "h-2 w-2 rounded-full bg-[color:var(--color-gold)]"
                        : "h-2 w-2 rounded-full border border-[color:var(--color-fg-mute)]"
                    }
                  />
                  {step.label}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 text-[color:var(--color-fg-mute)] group-hover:text-[color:var(--color-gold)] group-hover:translate-x-0.5 transition-all"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {role !== "CUSTOMER" && (
        <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/8 p-6 lg:p-8">
          <Eyebrow index="—">Painel administrativo</Eyebrow>
          <h2 className="display mt-3 text-[1.5rem]">
            Acesso de {role.toLowerCase()}
          </h2>
          <p className="mt-2 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
            Seu nível tem acesso ao painel admin — gerenciamento de produtos, pedidos
            e métricas. O painel será disponibilizado na Fase 5.
          </p>
        </section>
      )}
    </div>
  );
}
