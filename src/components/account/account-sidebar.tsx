"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
  LogOut,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { signOutAction } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/conta", label: "Painel", Icon: LayoutDashboard, exact: true },
  { href: "/conta/pedidos", label: "Pedidos", Icon: Package },
  { href: "/conta/enderecos", label: "Endereços", Icon: MapPin },
  { href: "/favoritos", label: "Favoritos", Icon: Heart },
  { href: "/conta/dados", label: "Dados pessoais", Icon: User },
];

interface AccountSidebarProps {
  user: {
    name?: string | null;
    email: string;
    role?: string | null;
  };
}

export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      {/* Card do usuário */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 mb-8">
        <Eyebrow index="—">Logado como</Eyebrow>
        <p className="mt-3 font-[var(--font-display)] text-[1.25rem] leading-snug text-[color:var(--color-fg)]">
          {user.name ?? user.email}
        </p>
        <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] truncate">
          {user.email}
        </p>
        {user.role && user.role !== "CUSTOMER" && (
          <span className="mt-3 inline-block px-2 py-0.5 rounded-[var(--radius-pill)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)] text-[10px] font-[var(--font-mono)] uppercase tracking-[var(--tracking-eyebrow)] border border-[color:var(--color-gold)]/30">
            {user.role}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav aria-label="Painel da conta">
        <ul className="flex flex-col gap-1">
          {NAV.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]",
                    "text-[0.9375rem]",
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

        <form action={signOutAction} className="mt-2">
          <button
            type="submit"
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)]",
              "text-[0.9375rem] text-[color:var(--color-fg-soft)]",
              "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
              "hover:bg-[color:var(--color-vermilion)]/8 hover:text-[color:var(--color-vermilion)]",
            )}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sair
          </button>
        </form>
      </nav>
    </aside>
  );
}
