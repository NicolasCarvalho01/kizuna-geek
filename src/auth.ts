import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validators/auth";
import { findDemoUserByEmail } from "@/server/demo-users";
import type { UserRole } from "@prisma/client";

/** Detecção de modo: sem DATABASE_URL = demo users do seed funcionam */
const USE_DEMO = !process.env.DATABASE_URL;

// =====================================================================
// PROVIDERS
// =====================================================================

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      let user: {
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        role: UserRole;
        passwordHash: string | null;
      } | null = null;

      if (USE_DEMO) {
        const demo = findDemoUserByEmail(email);
        if (demo) {
          user = {
            id: demo.id,
            email: demo.email,
            name: demo.name,
            image: demo.image,
            role: demo.role,
            passwordHash: demo.passwordHash,
          };
        }
      } else {
        // Prisma path — TODO Fase 5: importação dinâmica para evitar Node em Edge
        const { prisma } = await import("@/lib/prisma");
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true, email: true, name: true, image: true, role: true,
            passwordHash: true, deletedAt: true,
          },
        });
        if (dbUser && !dbUser.deletedAt) {
          user = {
            id: dbUser.id, email: dbUser.email, name: dbUser.name,
            image: dbUser.image, role: dbUser.role, passwordHash: dbUser.passwordHash,
          };
        }
      }

      if (!user || !user.passwordHash) return null;

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

// Google OAuth — só ativa se credenciais configuradas
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

// =====================================================================
// NextAuth
// =====================================================================

export const { auth, signIn, signOut, handlers, unstable_update } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Para OAuth (Google): cria/atualiza usuário no DB se houver,
      // ou aceita o login direto em demo (sem persistência)
      if (account?.provider === "google") {
        if (!user.email) return false;
        if (USE_DEMO) return true;
        const { prisma } = await import("@/lib/prisma");
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            emailVerified: new Date(),
            lastLoginAt: new Date(),
          },
          create: {
            email: user.email,
            name: user.name ?? "Usuário",
            image: user.image ?? null,
            emailVerified: new Date(),
            role: "CUSTOMER",
            lastLoginAt: new Date(),
          },
        });
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // No sign-in inicial: popular o token com dados do usuário
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }

      // Quando o cliente/server chama `unstable_update`, o trigger é "update"
      // e `session` contém os campos alterados — propagar pro token.
      if (trigger === "update" && session?.user) {
        if (typeof session.user.name === "string") token.name = session.user.name;
        if (typeof session.user.email === "string") token.email = session.user.email;
        if (typeof session.user.image === "string") token.picture = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        // Garantir que name/email/image do token (atualizados via unstable_update) cheguem na session
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },
});
