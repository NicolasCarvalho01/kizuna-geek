import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Edge-safe — só roda o callback `authorized` do authConfig + injeta x-pathname.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // Propaga o pathname pro server component root layout poder decidir se renderiza
  // SiteHeader/SiteFooter (público) ou só o AdminLayout (admin).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: [
    /*
     * Match all request paths exceto:
     * - api routes (Auth.js trata sozinho)
     * - _next/static, _next/image
     * - favicon e arquivos públicos
     */
    "/((?!api|_next/static|_next/image|favicon.ico|kizuna-logo.svg).*)",
  ],
};
