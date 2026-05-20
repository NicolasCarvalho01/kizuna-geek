import "server-only";
import Stripe from "stripe";

/**
 * Cliente Stripe — singleton server-side.
 * `apiVersion` fixa pra evitar breaking changes inesperados.
 */
const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    appInfo: {
      name: "Kizuna Geek",
      version: "0.1.0",
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}

/** Indica se o Stripe está configurado (existe chave secreta real) */
export const stripeConfigured =
  !!process.env.STRIPE_SECRET_KEY &&
  process.env.STRIPE_SECRET_KEY.startsWith("sk_");
