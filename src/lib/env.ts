import { z } from "zod";

/**
 * Validação centralizada de variáveis de ambiente.
 * Falha no startup se faltar var crítica — melhor quebrar cedo do que em produção.
 */
const envSchema = z.object({
  // -------- Node --------
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // -------- Database (Supabase) --------
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // -------- Auth.js v5 --------
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET deve ter pelo menos 32 caracteres"),
  AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  // -------- Stripe --------
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),

  // -------- Melhor Envio --------
  MELHOR_ENVIO_CLIENT_ID: z.string().optional(),
  MELHOR_ENVIO_CLIENT_SECRET: z.string().optional(),
  MELHOR_ENVIO_REDIRECT_URI: z.string().url().optional(),
  MELHOR_ENVIO_TOKEN: z.string().optional(),
  MELHOR_ENVIO_SANDBOX: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  MELHOR_ENVIO_ORIGIN_ZIPCODE: z
    .string()
    .regex(/^\d{8}$/, "CEP de origem deve ter 8 dígitos"),

  // -------- Focus NFe --------
  FOCUS_NFE_TOKEN: z.string().optional(),
  FOCUS_NFE_SANDBOX: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),

  // -------- Resend (e-mail) --------
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Kizuna Geek <contato@kizunageek.com.br>"),

  // -------- UploadThing --------
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),

  // -------- App --------
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Variáveis de ambiente inválidas:\n",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  throw new Error("Variáveis de ambiente inválidas. Confira `.env.example`.");
}

export const env: Env = parsed.data;
