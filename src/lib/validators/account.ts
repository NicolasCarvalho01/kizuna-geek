import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{10,20}$/, "Telefone inválido")
    .optional()
    .or(z.literal("")),
  cpf: z
    .string()
    .trim()
    .regex(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .optional()
    .or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  marketingOptIn: z.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Apelido obrigatório").max(40),
  recipientName: z.string().trim().min(2, "Nome do destinatário obrigatório").max(120),
  zipCode: z
    .string()
    .trim()
    .regex(/^\d{8}$|^\d{5}-\d{3}$/, "CEP inválido (8 dígitos)")
    .transform((v) => v.replace(/\D/g, "")),
  street: z.string().trim().min(2, "Logradouro obrigatório"),
  number: z.string().trim().min(1, "Número obrigatório"),
  complement: z.string().trim().max(80).optional().or(z.literal("")),
  neighborhood: z.string().trim().min(2, "Bairro obrigatório"),
  city: z.string().trim().min(2, "Cidade obrigatória"),
  state: z
    .string()
    .trim()
    .length(2, "UF (2 letras)")
    .transform((v) => v.toUpperCase()),
  country: z.string().trim().default("BR"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
