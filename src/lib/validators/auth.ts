import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "E-mail obrigatório" })
    .trim()
    .toLowerCase()
    .email("E-mail inválido"),
  password: z
    .string({ required_error: "Senha obrigatória" })
    .min(1, "Senha obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z
      .string({ required_error: "Nome obrigatório" })
      .trim()
      .min(2, "Nome muito curto")
      .max(120, "Nome muito longo"),
    email: z
      .string({ required_error: "E-mail obrigatório" })
      .trim()
      .toLowerCase()
      .email("E-mail inválido"),
    password: z
      .string({ required_error: "Senha obrigatória" })
      .min(8, "Mínimo 8 caracteres")
      .max(128, "Senha muito longa")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
      .regex(/[a-z]/, "Inclua ao menos uma letra minúscula")
      .regex(/[0-9]/, "Inclua ao menos um número"),
    confirmPassword: z.string(),
    marketingOptIn: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Senhas não conferem",
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
});

export const passwordResetSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula")
      .regex(/[a-z]/, "Inclua ao menos uma letra minúscula")
      .regex(/[0-9]/, "Inclua ao menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Senhas não conferem",
  });
