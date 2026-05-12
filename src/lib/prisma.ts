import { PrismaClient } from "@prisma/client";

/**
 * Singleton do Prisma Client para evitar criar múltiplas conexões em dev
 * (Next.js hot-reload re-executa módulos a cada mudança).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
