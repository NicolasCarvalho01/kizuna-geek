import type { ProductType } from "@prisma/client";

/**
 * Templates de produto — aplicáveis no admin form pra acelerar cadastro.
 *
 * Cada template pré-preenche os campos mais chatos de digitar:
 *  - Tipo (ProductType)
 *  - Marca padrão
 *  - Peso médio em gramas
 *  - Dimensões de embalagem em cm
 *  - Sugestões de tags
 *  - Defaults da variante (escala figure, manufacturer, condition TCG, etc.)
 *
 * Valores baseados em medições reais da indústria. Conferir antes de
 * comprar etiqueta se for produto MUITO fora do padrão (ex: Funko 10in
 * vez do padrão 4in).
 */

export interface ProductTemplate {
  /** Slug identificador */
  id: string;
  /** Nome amigável no dropdown */
  label: string;
  /** Grupo no menu (Action Figures / Funko / TCG / etc.) */
  group: "Funko" | "Anime / Action Figures" | "Trading Card Games" | "Outros";

  /** ProductType da Prisma */
  productType: ProductType;

  /** Pré-preenche o campo Marca */
  brand?: string;
  /** Peso da peça embalada em gramas (incluindo caixa) */
  weight: number;
  /** Dimensões da embalagem em cm */
  dimensions: { length: number; width: number; height: number };

  /** Tags sugeridas (slug) — admin pode escolher quais aplicar */
  suggestedTags?: string[];

  /** Defaults da primeira variante */
  variantDefaults?: {
    /** Pra figures */
    figureManufacturer?: string;
    figureScale?: string;
    figureHasBox?: boolean;
    figureBoxCondition?: "MINT" | "NEAR_MINT" | "GOOD" | "DAMAGED";
    /** Pra TCG */
    tcgLanguage?: "PT" | "EN" | "JP" | "ES" | "FR" | "DE" | "IT" | "KO" | "ZH";
    tcgCondition?: "NM" | "LP" | "MP" | "HP" | "DMG";
    tcgIsFoil?: boolean;
  };
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  // =====================================================================
  // FUNKO POP
  // =====================================================================
  {
    id: "funko-pop",
    label: "Funko Pop! padrão (4 inch)",
    group: "Funko",
    productType: "COLLECTIBLE",
    brand: "Funko",
    weight: 230,
    dimensions: { length: 16, width: 11, height: 11 },
    suggestedTags: ["funko", "vinyl-figure", "pop"],
    variantDefaults: {
      figureManufacturer: "Funko",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },
  {
    id: "funko-pop-deluxe",
    label: "Funko Pop! Deluxe / Rides",
    group: "Funko",
    productType: "COLLECTIBLE",
    brand: "Funko",
    weight: 380,
    dimensions: { length: 20, width: 15, height: 16 },
    suggestedTags: ["funko", "deluxe", "rides"],
    variantDefaults: {
      figureManufacturer: "Funko",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },
  {
    id: "funko-pop-10in",
    label: "Funko Pop! Super Sized (10 inch)",
    group: "Funko",
    productType: "COLLECTIBLE",
    brand: "Funko",
    weight: 650,
    dimensions: { length: 28, width: 20, height: 20 },
    suggestedTags: ["funko", "super-sized", "10in"],
    variantDefaults: {
      figureManufacturer: "Funko",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },

  // =====================================================================
  // ANIME / ACTION FIGURES
  // =====================================================================
  {
    id: "nendoroid",
    label: "Nendoroid (Good Smile Company)",
    group: "Anime / Action Figures",
    productType: "ACTION_FIGURE",
    brand: "Good Smile Company",
    weight: 250,
    dimensions: { length: 14, width: 14, height: 16 },
    suggestedTags: ["nendoroid", "good-smile-company", "chibi"],
    variantDefaults: {
      figureManufacturer: "Good Smile Company",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },
  {
    id: "figma",
    label: "figma (Max Factory)",
    group: "Anime / Action Figures",
    productType: "ACTION_FIGURE",
    brand: "Max Factory",
    weight: 280,
    dimensions: { length: 15, width: 11, height: 17 },
    suggestedTags: ["figma", "max-factory", "articulated"],
    variantDefaults: {
      figureManufacturer: "Max Factory",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },
  {
    id: "scale-1-7",
    label: "Scale Figure 1/7",
    group: "Anime / Action Figures",
    productType: "ACTION_FIGURE",
    weight: 1500,
    dimensions: { length: 28, width: 22, height: 32 },
    suggestedTags: ["scale-figure", "1-7"],
    variantDefaults: {
      figureScale: "1/7",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },
  {
    id: "scale-1-8",
    label: "Scale Figure 1/8",
    group: "Anime / Action Figures",
    productType: "ACTION_FIGURE",
    weight: 1200,
    dimensions: { length: 25, width: 20, height: 28 },
    suggestedTags: ["scale-figure", "1-8"],
    variantDefaults: {
      figureScale: "1/8",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },
  {
    id: "shf-figuarts",
    label: "S.H. Figuarts (Bandai)",
    group: "Anime / Action Figures",
    productType: "ACTION_FIGURE",
    brand: "Bandai",
    weight: 380,
    dimensions: { length: 22, width: 14, height: 16 },
    suggestedTags: ["sh-figuarts", "bandai", "articulated"],
    variantDefaults: {
      figureManufacturer: "Bandai",
      figureHasBox: true,
      figureBoxCondition: "MINT",
    },
  },

  // =====================================================================
  // TCG
  // =====================================================================
  {
    id: "tcg-single",
    label: "TCG Single — carta avulsa",
    group: "Trading Card Games",
    productType: "TCG_SINGLE",
    weight: 5,
    dimensions: { length: 14, width: 9, height: 1 },
    suggestedTags: ["tcg", "single"],
    variantDefaults: {
      tcgLanguage: "PT",
      tcgCondition: "NM",
      tcgIsFoil: false,
    },
  },
  {
    id: "tcg-booster-pack",
    label: "TCG Booster Pack (10 cartas)",
    group: "Trading Card Games",
    productType: "TCG_SEALED",
    weight: 30,
    dimensions: { length: 12, width: 7, height: 2 },
    suggestedTags: ["tcg", "sealed", "booster"],
  },
  {
    id: "tcg-booster-box",
    label: "TCG Booster Box (36 packs)",
    group: "Trading Card Games",
    productType: "TCG_SEALED",
    weight: 700,
    dimensions: { length: 27, width: 17, height: 10 },
    suggestedTags: ["tcg", "sealed", "booster-box"],
  },
  {
    id: "tcg-etb",
    label: "TCG Elite Trainer Box (ETB)",
    group: "Trading Card Games",
    productType: "TCG_SEALED",
    weight: 1200,
    dimensions: { length: 30, width: 26, height: 10 },
    suggestedTags: ["tcg", "sealed", "etb"],
  },
  {
    id: "tcg-collection-box",
    label: "TCG Collection Box / Tin",
    group: "Trading Card Games",
    productType: "TCG_SEALED",
    weight: 500,
    dimensions: { length: 22, width: 18, height: 8 },
    suggestedTags: ["tcg", "sealed", "tin"],
  },

  // =====================================================================
  // OUTROS
  // =====================================================================
  {
    id: "manga-volume",
    label: "Mangá / HQ — volume avulso",
    group: "Outros",
    productType: "OTHER",
    weight: 200,
    dimensions: { length: 18, width: 13, height: 2 },
    suggestedTags: ["manga", "leitura"],
  },
  {
    id: "art-book",
    label: "Art Book / Artbook",
    group: "Outros",
    productType: "OTHER",
    weight: 800,
    dimensions: { length: 30, width: 22, height: 3 },
    suggestedTags: ["artbook", "ilustracao"],
  },
];

/**
 * Agrupa os templates pra renderizar no `<select>` ou dropdown agrupado.
 */
export function getTemplatesByGroup() {
  const groups = new Map<string, ProductTemplate[]>();
  for (const tpl of PRODUCT_TEMPLATES) {
    const list = groups.get(tpl.group) ?? [];
    list.push(tpl);
    groups.set(tpl.group, list);
  }
  return Array.from(groups.entries());
}

export function getTemplateById(id: string): ProductTemplate | undefined {
  return PRODUCT_TEMPLATES.find((t) => t.id === id);
}
