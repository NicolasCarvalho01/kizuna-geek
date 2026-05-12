import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe — só roda o callback `authorized` do authConfig.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // Toda lógica de redirect/autorização está no callback `authorized` do authConfig.
  // Este wrapper apenas garante que o callback rode em cada request.
  void req;
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
