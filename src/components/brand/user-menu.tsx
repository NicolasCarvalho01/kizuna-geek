"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, Package, Heart, MapPin, User2, LayoutDashboard } from "lucide-react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { signOutAction } from "@/server/actions/auth-actions";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <Link
        href="/entrar"
        className={cn(
          "inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius-pill)]",
          "text-[color:var(--color-fg-soft)]",
          "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
          "hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-fg)]",
        )}
        aria-label="Entrar na sua conta"
      >
        <User2 className="h-4 w-4" strokeWidth={1.5} />
      </Link>
    );
  }

  const initial = (user.name?.[0] ?? user.email?.[0] ?? "?").toUpperCase();
  const isAdmin = user.role === "ADMIN" || user.role === "STAFF";

  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Menu da conta"
          className={cn(
            "inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius-pill)]",
            "border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
            "text-[0.875rem] font-medium font-[var(--font-display)]",
            "text-[color:var(--color-fg)]",
            "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
            "hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]",
          )}
        >
          {initial}
        </button>
      </DropdownPrimitive.Trigger>

      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align="end"
          sideOffset={10}
          className={cn(
            "z-50 min-w-[16rem] rounded-[var(--radius-md)]",
            "border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
            "shadow-[var(--shadow-3)]",
            "p-1.5",
            "data-[state=open]:animate-[fade-up_var(--motion-base)_var(--ease-out-3)_forwards]",
          )}
        >
          {/* Header com identidade */}
          <div className="px-3 py-3 border-b border-[color:var(--color-hairline)] mb-1.5">
            <p className="eyebrow">Logado como</p>
            <p className="mt-1 font-[var(--font-display)] text-[1.0625rem] leading-tight text-[color:var(--color-fg)]">
              {user.name ?? "Cliente"}
            </p>
            {user.email && (
              <p className="mt-0.5 text-[var(--text-caption)] text-[color:var(--color-fg-soft)] truncate">
                {user.email}
              </p>
            )}
          </div>

          <MenuItem href="/conta" Icon={User2}>
            Minha conta
          </MenuItem>
          <MenuItem href="/conta/pedidos" Icon={Package}>
            Pedidos
          </MenuItem>
          <MenuItem href="/favoritos" Icon={Heart}>
            Favoritos
          </MenuItem>
          <MenuItem href="/conta/enderecos" Icon={MapPin}>
            Endereços
          </MenuItem>

          {isAdmin && (
            <>
              <DropdownPrimitive.Separator className="my-1.5 h-px bg-[color:var(--color-hairline)]" />
              <MenuItem href="/admin" Icon={LayoutDashboard} accent>
                Painel admin
              </MenuItem>
            </>
          )}

          <DropdownPrimitive.Separator className="my-1.5 h-px bg-[color:var(--color-hairline)]" />

          <DropdownPrimitive.Item
            asChild
            onSelect={(e) => e.preventDefault()}
            className="outline-none"
          >
            <form action={signOutAction}>
              <button
                type="submit"
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)]",
                  "text-[0.875rem] text-[color:var(--color-fg-soft)]",
                  "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                  "hover:bg-[color:var(--color-vermilion)]/8 hover:text-[color:var(--color-vermilion)]",
                )}
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                Sair
              </button>
            </form>
          </DropdownPrimitive.Item>
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}

interface MenuItemProps {
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  accent?: boolean;
}

function MenuItem({ href, Icon, children, accent }: MenuItemProps) {
  return (
    <DropdownPrimitive.Item asChild>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] outline-none",
          "text-[0.875rem]",
          "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
          accent
            ? "text-[color:var(--color-gold)] hover:bg-[color:var(--color-gold)]/10"
            : "text-[color:var(--color-fg)] hover:bg-[color:var(--color-bg-sunken)] focus:bg-[color:var(--color-bg-sunken)]",
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {children}
      </Link>
    </DropdownPrimitive.Item>
  );
}
