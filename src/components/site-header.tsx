"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Search, ShoppingBag, Menu } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { UserMenu } from "@/components/brand/user-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from "@/components/ui/sheet";
import { useCart, cartItemCount } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/catalogo/action-figures", label: "Action Figures" },
  { href: "/catalogo/tcg", label: "TCG" },
  { href: "/catalogo/colecionaveis", label: "Colecionáveis" },
  { href: "/pre-venda", label: "Pré-venda", emphasis: true },
  { href: "/sobre", label: "Sobre" },
];

interface SiteHeaderProps {
  /** Estado de auth — vem do layout (server component) */
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "transition-[background-color,border-color,backdrop-filter] duration-[var(--motion-base)] ease-[var(--ease-out-3)]",
        scrolled
          ? "bg-[color:var(--color-bg)]/85 backdrop-blur-lg border-b border-[color:var(--color-hairline)]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="wrap flex h-20 items-center gap-6">
        {/* Logo */}
        <Logo size="md" className="shrink-0" />

        {/* Nav desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-7 ml-12"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative text-[0.875rem] tracking-[var(--tracking-snug)]",
                "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                item.emphasis
                  ? "text-[color:var(--color-gold)] hover:text-[color:var(--color-gold-soft)]"
                  : "text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]",
                "after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:scale-x-0 after:origin-left",
                "after:bg-[color:var(--color-gold)] after:transition-transform after:duration-[var(--motion-base)] after:ease-[var(--ease-out-3)]",
                "hover:after:scale-x-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />

          <IconButton href="/buscar" label="Buscar" className="hidden sm:inline-flex">
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </IconButton>

          <IconButton href="/favoritos" label="Favoritos" className="hidden md:inline-flex">
            <Heart className="h-4 w-4" strokeWidth={1.5} />
          </IconButton>

          <UserMenu user={user} />

          <CartButton />

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className={cn(
                  "lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius-pill)]",
                  "border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
                  "text-[color:var(--color-fg)] transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                  "hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
                )}
              >
                <Menu className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Navegação</SheetTitle>
                <SheetDescription>Explore o catálogo da Kizuna Geek.</SheetDescription>
              </SheetHeader>
              <nav className="flex-1 overflow-auto px-7 py-6">
                <ul className="flex flex-col gap-1">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block py-3 text-[1.25rem] font-[var(--font-display)]",
                          "border-b border-[color:var(--color-hairline)]",
                          "transition-colors duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
                          item.emphasis
                            ? "text-[color:var(--color-gold)]"
                            : "text-[color:var(--color-fg)] hover:text-[color:var(--color-gold)]",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex items-center justify-between">
                  <span className="eyebrow">Tema</span>
                  <ThemeToggle variant="pill" />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center h-10 w-10 rounded-[var(--radius-pill)]",
        "text-[color:var(--color-fg-soft)]",
        "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
        "hover:bg-[color:var(--color-bg-elevated)] hover:text-[color:var(--color-fg)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function CartButton() {
  const open = useCart((s) => s.open);
  const count = useCart(cartItemCount);
  const lastAddedAt = useCart((s) => s.lastAddedAt);
  const [bumping, setBumping] = React.useState(false);

  // Pulso dourado no contador quando um item é adicionado
  React.useEffect(() => {
    if (!lastAddedAt) return;
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 600);
    return () => clearTimeout(t);
  }, [lastAddedAt]);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Abrir sacola — ${count} ${count === 1 ? "item" : "itens"}`}
      className={cn(
        "relative inline-flex items-center justify-center h-10 px-3 sm:h-10 sm:w-10 rounded-[var(--radius-pill)]",
        "border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]",
        "text-[color:var(--color-fg)] transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
        "hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
      )}
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
      {count > 0 && (
        <span
          aria-hidden
          className={cn(
            "absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full",
            "bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)]",
            "text-[10px] font-medium font-[var(--font-mono)]",
            "inline-flex items-center justify-center",
            "transition-transform duration-[var(--motion-base)] ease-[var(--ease-out-5)]",
            bumping && "scale-125",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
