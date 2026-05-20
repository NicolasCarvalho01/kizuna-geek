"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Tag,
  Settings,
  Users,
  FileText,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { signOutAction } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
};

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Visão geral",
    items: [{ href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Operação",
    items: [
      { href: "/admin/pedidos", label: "Pedidos", Icon: ShoppingBag },
      { href: "/admin/pre-vendas", label: "Pré-vendas", Icon: Calendar },
      { href: "/admin/nfe", label: "NF-e", Icon: FileText },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/produtos", label: "Produtos", Icon: Package },
      { href: "/admin/cupons", label: "Cupons", Icon: Tag },
    ],
  },
  {
    label: "Pessoas",
    items: [{ href: "/admin/clientes", label: "Clientes", Icon: Users }],
  },
  {
    label: "Configuração",
    items: [{ href: "/admin/configuracoes", label: "Loja & integrações", Icon: Settings }],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const initial = (user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase();

  return (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 border-b border-[color:var(--color-hairline)]">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] font-[var(--font-jp)] text-[1.25rem] font-black"
          >
            絆
          </span>
          <div>
            <p className="font-[var(--font-display)] text-[1rem] leading-none">Kizuna Geek</p>
            <p className="eyebrow mt-1.5">Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <p className="eyebrow px-3 mb-2">{group.label}</p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-[0.875rem]",
                        "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                        active
                          ? "bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]"
                          : "text-[color:var(--color-fg-soft)] hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-fg)]",
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card / Sign out */}
      <div className="border-t border-[color:var(--color-hairline)] p-3">
        <div className="px-3 py-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-gold)] text-[color:var(--color-gold)] text-[0.75rem] font-medium font-[var(--font-display)]">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.875rem] font-medium text-[color:var(--color-fg)] truncate">
                {user.name ?? "Admin"}
              </p>
              <p className="text-[10px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-gold)]">
                {user.role}
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-fg-soft)] hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-fg)] transition-colors"
        >
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          Ver loja pública
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-[0.8125rem] text-[color:var(--color-fg-soft)] hover:bg-[color:var(--color-vermilion)]/8 hover:text-[color:var(--color-vermilion)] transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
