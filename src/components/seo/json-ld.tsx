import * as React from "react";
import type { Product as ProductData } from "@/server/queries/products";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://kizunageek.com.br").replace(
  /\/$/,
  "",
);

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Injeta um bloco JSON-LD no <head>. Use uma vez por página, com o objeto
 * estruturado já montado (ou array de objetos).
 *
 * Por segurança, escapamos `<` (XSS via fechamento de tag) — string normal
 * JSON.stringify não escapa isso por padrão.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

// ---------------------------------------------------------------------------
// FACTORIES — schemas tipados pra cada situação
// ---------------------------------------------------------------------------

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Kizuna Geek",
    alternateName: "絆 Kizuna Geek",
    description:
      "Loja boutique de Action Figures, Colecionáveis e Trading Card Games. Curadoria, pré-vendas e raridades.",
    url: BASE_URL,
    logo: `${BASE_URL}/kizuna-logo.svg`,
    image: `${BASE_URL}/kizuna-logo.svg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Itapetininga",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    sameAs: [
      // Preencher quando tiver Instagram/YouTube oficiais
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kizuna Geek",
    url: BASE_URL,
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: ProductData) {
  const variants = product.variants.filter((v) => v.isActive);
  const prices = variants.map((v) => v.priceOverride ?? product.basePrice);
  const lowPrice = prices.length ? Math.min(...prices) : product.basePrice;
  const highPrice = prices.length ? Math.max(...prices) : product.basePrice;
  const hasStock = variants.some((v) => v.stock > 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.shortDescription ?? undefined,
    sku: product.sku,
    mpn: product.sku,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    category: product.category.name,
    image: product.images.map((img) => img.url),
    url: `${BASE_URL}/produto/${product.slug}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BRL",
      lowPrice: lowPrice.toFixed(2),
      highPrice: highPrice.toFixed(2),
      offerCount: variants.length || 1,
      availability: product.isPreOrder
        ? "https://schema.org/PreOrder"
        : hasStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Kizuna Geek",
      },
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
