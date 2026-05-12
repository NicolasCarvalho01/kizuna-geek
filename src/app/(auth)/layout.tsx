/**
 * Layout das páginas de auth — sem SiteHeader/SiteFooter pra dar foco ao form.
 * O AuthShell já renderiza brand + nav básica.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh -mb-[5rem]">{children}</div>;
}
