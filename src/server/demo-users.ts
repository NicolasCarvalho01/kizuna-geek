/**
 * Usuários de demo — mirror do seed.ts.
 * Usado quando `DATABASE_URL` não está setada (sem Supabase configurado).
 *
 * Senha de todos: `Kizuna@2026`.
 * O hash é calculado uma vez no module load — custo ~80ms one-time.
 */

import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

const DEMO_PASSWORD = "Kizuna@2026";
const DEMO_PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10);

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cpf: string | null;
  phone: string | null;
  passwordHash: string;
  emailVerified: Date | null;
  image: string | null;
}

export const DEMO_USERS: ReadonlyArray<DemoUser> = [
  {
    id: "demo_admin",
    email: "admin@kizunageek.com.br",
    name: "Admin Kizuna",
    role: "ADMIN",
    cpf: null,
    phone: null,
    passwordHash: DEMO_PASSWORD_HASH,
    emailVerified: new Date(),
    image: null,
  },
  {
    id: "demo_staff",
    email: "staff@kizunageek.com.br",
    name: "Staff Kizuna",
    role: "STAFF",
    cpf: null,
    phone: null,
    passwordHash: DEMO_PASSWORD_HASH,
    emailVerified: new Date(),
    image: null,
  },
  {
    id: "demo_yuki",
    email: "yuki@example.com",
    name: "Yuki Tanaka",
    role: "CUSTOMER",
    cpf: "12345678901",
    phone: "+5515999990001",
    passwordHash: DEMO_PASSWORD_HASH,
    emailVerified: new Date(),
    image: null,
  },
  {
    id: "demo_lucas",
    email: "lucas@example.com",
    name: "Lucas Silva",
    role: "CUSTOMER",
    cpf: "23456789012",
    phone: "+5515999990002",
    passwordHash: DEMO_PASSWORD_HASH,
    emailVerified: new Date(),
    image: null,
  },
  {
    id: "demo_maria",
    email: "maria@example.com",
    name: "Maria Hoshino",
    role: "CUSTOMER",
    cpf: "34567890123",
    phone: "+5511988880003",
    passwordHash: DEMO_PASSWORD_HASH,
    emailVerified: new Date(),
    image: null,
  },
];

export function findDemoUserByEmail(email: string): DemoUser | null {
  const normalized = email.trim().toLowerCase();
  return DEMO_USERS.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export function findDemoUserById(id: string): DemoUser | null {
  return DEMO_USERS.find((u) => u.id === id) ?? null;
}
