import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Cormorant_Garamond, Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { auth } from "@/auth";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoJp = Noto_Serif_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kizunageek.com.br"),
  title: {
    default: "Kizuna Geek — Action Figures, Colecionáveis e TCG",
    template: "%s · Kizuna Geek",
  },
  description:
    "Loja boutique de Action Figures, Colecionáveis e Trading Card Games em Itapetininga/SP. Pré-vendas, lançamentos e raridades. 絆 — os laços que colecionamos.",
  openGraph: {
    title: "Kizuna Geek",
    description:
      "Action Figures, Colecionáveis e TCG. Curadoria boutique, pré-vendas e raridades.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kizuna Geek",
    description:
      "Action Figures, Colecionáveis e TCG. Curadoria boutique, pré-vendas e raridades.",
  },
};

export const viewport: Viewport = {
  // Dark é o padrão da Kizuna — browser chrome (status bar mobile) acompanha.
  themeColor: "#1a1b3a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, h] = await Promise.all([auth(), headers()]);
  const pathname = h.get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  const headerUser = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${cormorant.variable} ${geist.variable} ${geistMono.variable} ${notoJp.variable}`}
    >
      <body className="grain">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {isAdmin ? (
            // Admin tem layout próprio (sidebar fixa, sem header/footer públicos)
            children
          ) : (
            <div className="flex min-h-svh flex-col">
              <SiteHeader user={headerUser} />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          )}
          <CartDrawer />
        </ThemeProvider>
        {/* Vercel Analytics + Speed Insights — no-op fora do Vercel */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
