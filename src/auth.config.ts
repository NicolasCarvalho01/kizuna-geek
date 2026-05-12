import type { NextAuthConfig } from "next-auth";

/**
 * Configuração Edge-safe — sem importar Prisma, bcrypt ou Node-only APIs.
 * Usada pelo middleware (que roda em Edge runtime).
 *
 * Os providers reais ficam em `auth.ts`, que roda em Node.
 */
export const authConfig = {
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24, // refresh a cada 24h
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      // Rotas que exigem login
      const protectedPaths = ["/conta", "/favoritos", "/checkout"];
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p),
      );

      // Rotas exclusivas de admin/staff
      const isAdmin = nextUrl.pathname.startsWith("/admin");

      if (isAdmin) {
        if (!isLoggedIn) {
          const url = new URL("/entrar", nextUrl);
          url.searchParams.set("from", nextUrl.pathname);
          return Response.redirect(url);
        }
        if (role !== "ADMIN" && role !== "STAFF") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isProtected) {
        if (isLoggedIn) return true;
        const url = new URL("/entrar", nextUrl);
        url.searchParams.set("from", nextUrl.pathname);
        return Response.redirect(url);
      }

      // Páginas de auth — se já logado, redireciona pra conta
      const authPages = ["/entrar", "/cadastrar"];
      if (isLoggedIn && authPages.includes(nextUrl.pathname)) {
        return Response.redirect(new URL("/conta", nextUrl));
      }

      return true;
    },
  },
  providers: [], // preenchido em auth.ts
} satisfies NextAuthConfig;
