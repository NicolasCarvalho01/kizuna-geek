/**
 * Demo dataset — espelha o seed.ts e o shape do Prisma Client.
 *
 * Usado quando `DATABASE_URL` não está setado (ex: dev local sem Supabase).
 * O query layer detecta isso e troca pra Prisma automaticamente.
 *
 * Mantenha sincronizado com `prisma/seed.ts` ao mudar produtos reais.
 */

import type {
  ProductStatus,
  ProductType,
  CategoryType,
  TcgLanguage,
  TcgCondition,
  FigureBoxCondition,
} from "@prisma/client";

// =====================================================================
// TIPOS (shape "leve" para uso em componentes, sem todos os campos do Prisma)
// =====================================================================

export interface DemoVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  priceOverride: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl: string | null;
  tcgLanguage: TcgLanguage | null;
  tcgCondition: TcgCondition | null;
  tcgEdition: string | null;
  tcgRarity: string | null;
  tcgIsFoil: boolean | null;
  tcgCardNumber: string | null;
  figureHasBox: boolean | null;
  figureBoxCondition: FigureBoxCondition | null;
  figureScale: string | null;
  figureManufacturer: string | null;
}

export interface DemoImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface DemoCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  type: CategoryType;
  sortOrder: number;
  productCount: number;
}

export interface DemoTag {
  id: string;
  name: string;
  slug: string;
}

export interface DemoProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  categoryId: string;
  category: { id: string; slug: string; name: string; type: CategoryType };
  productType: ProductType;
  brand: string | null;
  franchise: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  status: ProductStatus;
  featured: boolean;
  isPreOrder: boolean;
  releaseDate: Date | null;
  preOrderEndsAt: Date | null;
  images: DemoImage[];
  variants: DemoVariant[];
  tags: DemoTag[];
}

// =====================================================================
// HELPERS
// =====================================================================

const img = (seed: string, w = 900, h = 1100) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

let _id = 0;
const id = (prefix: string) => `${prefix}_${++_id}`;

// =====================================================================
// CATEGORIAS
// =====================================================================

const catActionFigures: DemoCategory = {
  id: id("cat"), slug: "action-figures", name: "Action Figures",
  description: "Bonecos articulados e figuras colecionáveis.", imageUrl: img("cat-fig"),
  parentId: null, type: "ACTION_FIGURE", sortOrder: 0, productCount: 2,
};
const catTcg: DemoCategory = {
  id: id("cat"), slug: "tcg", name: "TCG",
  description: "Trading Card Games — cartas avulsas, boosters e selados.", imageUrl: img("cat-tcg"),
  parentId: null, type: "TCG", sortOrder: 1, productCount: 5,
};
const catCollectibles: DemoCategory = {
  id: id("cat"), slug: "colecionaveis", name: "Colecionáveis",
  description: "Funkos, estátuas, nendoroids e exclusivos.", imageUrl: img("cat-col"),
  parentId: null, type: "COLLECTIBLE", sortOrder: 2, productCount: 3,
};

const catAnime: DemoCategory = {
  id: id("cat"), slug: "action-figures-anime", name: "Anime",
  description: null, imageUrl: null, parentId: catActionFigures.id,
  type: "ACTION_FIGURE", sortOrder: 0, productCount: 1,
};
const catPokemon: DemoCategory = {
  id: id("cat"), slug: "tcg-pokemon", name: "Pokémon",
  description: null, imageUrl: null, parentId: catTcg.id,
  type: "TCG", sortOrder: 0, productCount: 2,
};
const catMagic: DemoCategory = {
  id: id("cat"), slug: "tcg-magic", name: "Magic: The Gathering",
  description: null, imageUrl: null, parentId: catTcg.id,
  type: "TCG", sortOrder: 1, productCount: 1,
};
const catYugioh: DemoCategory = {
  id: id("cat"), slug: "tcg-yugioh", name: "Yu-Gi-Oh!",
  description: null, imageUrl: null, parentId: catTcg.id,
  type: "TCG", sortOrder: 2, productCount: 1,
};
const catOnePieceTcg: DemoCategory = {
  id: id("cat"), slug: "tcg-one-piece", name: "One Piece TCG",
  description: null, imageUrl: null, parentId: catTcg.id,
  type: "TCG", sortOrder: 3, productCount: 1,
};
const catFunko: DemoCategory = {
  id: id("cat"), slug: "colecionaveis-funko", name: "Funko Pop",
  description: null, imageUrl: null, parentId: catCollectibles.id,
  type: "COLLECTIBLE", sortOrder: 0, productCount: 2,
};
const catStatues: DemoCategory = {
  id: id("cat"), slug: "colecionaveis-estatuas", name: "Estátuas",
  description: null, imageUrl: null, parentId: catCollectibles.id,
  type: "COLLECTIBLE", sortOrder: 1, productCount: 1,
};
const catNendoroid: DemoCategory = {
  id: id("cat"), slug: "colecionaveis-nendoroid", name: "Nendoroid",
  description: null, imageUrl: null, parentId: catCollectibles.id,
  type: "COLLECTIBLE", sortOrder: 2, productCount: 1,
};
const catMarvel: DemoCategory = {
  id: id("cat"), slug: "action-figures-marvel", name: "Marvel",
  description: null, imageUrl: null, parentId: catActionFigures.id,
  type: "ACTION_FIGURE", sortOrder: 1, productCount: 1,
};

export const DEMO_CATEGORIES: ReadonlyArray<DemoCategory> = [
  catActionFigures, catTcg, catCollectibles,
  catAnime, catMarvel,
  catPokemon, catMagic, catYugioh, catOnePieceTcg,
  catFunko, catStatues, catNendoroid,
];

// =====================================================================
// TAGS
// =====================================================================

const TAGS = {
  launch: { id: id("tag"), name: "lançamento", slug: "lancamento" },
  promo: { id: id("tag"), name: "promoção", slug: "promocao" },
  rare: { id: id("tag"), name: "raro", slug: "raro" },
  jp: { id: id("tag"), name: "japonês", slug: "japones" },
  en: { id: id("tag"), name: "inglês", slug: "ingles" },
  sealed: { id: id("tag"), name: "selado", slug: "selado" },
  preorder: { id: id("tag"), name: "pré-venda", slug: "pre-venda" },
  exclusive: { id: id("tag"), name: "exclusivo", slug: "exclusivo" },
};
export const DEMO_TAGS = Object.values(TAGS);

// =====================================================================
// PRODUTOS
// =====================================================================

function mk(p: Omit<DemoProduct, "id" | "category"> & { categoryId: string }): DemoProduct {
  const cat = DEMO_CATEGORIES.find((c) => c.id === p.categoryId);
  if (!cat) throw new Error(`Demo data: categoria ${p.categoryId} não encontrada`);
  return {
    id: id("prod"),
    ...p,
    category: { id: cat.id, slug: cat.slug, name: cat.name, type: cat.type },
  };
}

export const DEMO_PRODUCTS: ReadonlyArray<DemoProduct> = [
  // 1. Nendoroid Naruto
  mk({
    slug: "nendoroid-naruto-uzumaki",
    sku: "NEN-NARUTO-001",
    name: "Nendoroid Naruto Uzumaki",
    shortDescription: "Nendoroid #682 — Naruto Shippuden, by Good Smile Company.",
    description:
      "Figura colecionável estilo chibi com 3 faces intercambiáveis, kunai, shuriken e efeito de Rasengan. Edição licenciada Good Smile Company.",
    categoryId: catNendoroid.id,
    productType: "COLLECTIBLE",
    brand: "Good Smile Company",
    franchise: "Naruto",
    basePrice: 449.9,
    compareAtPrice: 549.9,
    weight: 320,
    dimensions: { length: 14, width: 14, height: 12 },
    status: "ACTIVE",
    featured: true,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("naruto-1"), altText: "Naruto Nendoroid frontal", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("naruto-2"), altText: "Naruto com kunai", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("naruto-3"), altText: "Embalagem original", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "NEN-NARUTO-001-MINT",
        name: "Com caixa (mint)", priceOverride: 449.9, stock: 8, lowStockThreshold: 5,
        isActive: true, imageUrl: null,
        tcgLanguage: null, tcgCondition: null, tcgEdition: null, tcgRarity: null,
        tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: true, figureBoxCondition: "MINT",
        figureScale: "Nendoroid", figureManufacturer: "Good Smile Company",
      },
      {
        id: id("var"), productId: "_", sku: "NEN-NARUTO-001-LOOSE",
        name: "Sem caixa (loose)", priceOverride: 329.9, stock: 3, lowStockThreshold: 5,
        isActive: true, imageUrl: null,
        tcgLanguage: null, tcgCondition: null, tcgEdition: null, tcgRarity: null,
        tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: false, figureBoxCondition: "NO_BOX",
        figureScale: "Nendoroid", figureManufacturer: "Good Smile Company",
      },
    ],
    tags: [TAGS.rare, TAGS.jp],
  }),

  // 2. Charizard Base Set
  mk({
    slug: "charizard-base-set",
    sku: "TCG-PKM-CHARI-001",
    name: "Charizard Holo — Base Set #4/102",
    shortDescription: "Carta icônica do Set Base original do Pokémon TCG.",
    description:
      "Charizard holográfico do Base Set lançado em 1999. Avaliado por especialista. Item de colecionador com proveniência rastreável.",
    categoryId: catPokemon.id,
    productType: "TCG_SINGLE",
    brand: "The Pokémon Company",
    franchise: "Pokémon",
    basePrice: 4500,
    compareAtPrice: null,
    weight: 20,
    dimensions: { length: 9, width: 6, height: 0.5 },
    status: "ACTIVE",
    featured: true,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("charizard-1"), altText: "Charizard Base Set", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("charizard-2"), altText: "Verso da carta", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("charizard-3"), altText: "Detalhe holográfico", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "TCG-PKM-CHARI-001-EN-NM-FOIL",
        name: "Inglês · Near Mint · Foil", priceOverride: 4500, stock: 1, lowStockThreshold: 1,
        isActive: true, imageUrl: null,
        tcgLanguage: "EN", tcgCondition: "NEAR_MINT", tcgEdition: "Base Set",
        tcgRarity: "Holo Rare", tcgIsFoil: true, tcgCardNumber: "004/102",
        figureHasBox: null, figureBoxCondition: null, figureScale: null, figureManufacturer: null,
      },
      {
        id: id("var"), productId: "_", sku: "TCG-PKM-CHARI-001-EN-LP-NONFOIL",
        name: "Inglês · Lightly Played", priceOverride: 2300, stock: 2, lowStockThreshold: 1,
        isActive: true, imageUrl: null,
        tcgLanguage: "EN", tcgCondition: "LIGHTLY_PLAYED", tcgEdition: "Base Set",
        tcgRarity: "Holo Rare", tcgIsFoil: false, tcgCardNumber: "004/102",
        figureHasBox: null, figureBoxCondition: null, figureScale: null, figureManufacturer: null,
      },
      {
        id: id("var"), productId: "_", sku: "TCG-PKM-CHARI-001-JP-NM-FOIL",
        name: "Japonês · Near Mint · Foil", priceOverride: 3800, stock: 1, lowStockThreshold: 1,
        isActive: true, imageUrl: null,
        tcgLanguage: "JP", tcgCondition: "NEAR_MINT", tcgEdition: "Base Set",
        tcgRarity: "Holo Rare", tcgIsFoil: true, tcgCardNumber: "004/102",
        figureHasBox: null, figureBoxCondition: null, figureScale: null, figureManufacturer: null,
      },
    ],
    tags: [TAGS.rare, TAGS.en, TAGS.jp, TAGS.exclusive],
  }),

  // 3. Booster Box Scarlet & Violet 151 (PRÉ-VENDA)
  mk({
    slug: "booster-box-pokemon-sv-151",
    sku: "TCG-PKM-SV151-BB",
    name: "Booster Box — Pokémon S&V 151",
    shortDescription: "Display selado com 36 booster packs. Entrega após o lançamento.",
    description:
      "Display oficial do Scarlet & Violet 151. Pré-venda — entrega prevista para após o lançamento internacional.",
    categoryId: catPokemon.id,
    productType: "TCG_SEALED",
    brand: "The Pokémon Company",
    franchise: "Pokémon",
    basePrice: 1299.9,
    compareAtPrice: 1499.9,
    weight: 1200,
    dimensions: { length: 30, width: 20, height: 12 },
    status: "ACTIVE",
    featured: true,
    isPreOrder: true,
    releaseDate: daysFromNow(75),
    preOrderEndsAt: daysFromNow(60),
    images: [
      { id: id("img"), url: img("sv151-1"), altText: "Booster Box S&V 151", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("sv151-2"), altText: "Conteúdo do display", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("sv151-3"), altText: "Embalagem lateral", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "TCG-PKM-SV151-BB-EN",
        name: "Inglês · Selado", priceOverride: 1299.9, stock: 30, lowStockThreshold: 10,
        isActive: true, imageUrl: null,
        tcgLanguage: "EN", tcgCondition: "MINT", tcgEdition: "Scarlet & Violet 151",
        tcgRarity: null, tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: null, figureBoxCondition: null, figureScale: null, figureManufacturer: null,
      },
    ],
    tags: [TAGS.preorder, TAGS.sealed, TAGS.en, TAGS.launch],
  }),

  // 4. Funko Goku Ultra Instinct
  mk({
    slug: "funko-pop-goku-ultra-instinct",
    sku: "FUNKO-GOKU-UI",
    name: "Funko Pop! Goku Ultra Instinct #386",
    shortDescription: "Dragon Ball Super — Funko Pop Animation.",
    description: "Funko Pop oficial do Goku no estado Ultra Instinct. Vinyl figure de 10cm.",
    categoryId: catFunko.id,
    productType: "COLLECTIBLE",
    brand: "Funko",
    franchise: "Dragon Ball",
    basePrice: 159.9,
    compareAtPrice: null,
    weight: 220,
    dimensions: { length: 10, width: 10, height: 14 },
    status: "ACTIVE",
    featured: false,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("goku-1"), altText: "Funko Goku Ultra Instinct", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("goku-2"), altText: "Caixa frontal", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("goku-3"), altText: "Detalhe", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "FUNKO-GOKU-UI-DEFAULT",
        name: "Padrão", priceOverride: null, stock: 15, lowStockThreshold: 5,
        isActive: true, imageUrl: null,
        tcgLanguage: null, tcgCondition: null, tcgEdition: null, tcgRarity: null,
        tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: true, figureBoxCondition: "MINT",
        figureScale: null, figureManufacturer: "Funko",
      },
    ],
    tags: [TAGS.promo],
  }),

  // 5. S.H. Figuarts Luffy Gear 5
  mk({
    slug: "sh-figuarts-luffy-gear-5",
    sku: "SHF-LUFFY-G5",
    name: "S.H. Figuarts Monkey D. Luffy — Gear 5",
    shortDescription: "Figura articulada Bandai Tamashii Nations.",
    description: "Luffy em sua forma Gear 5 (Joy Boy). Múltiplas mãos intercambiáveis, expressões e efeitos.",
    categoryId: catAnime.id,
    productType: "ACTION_FIGURE",
    brand: "Bandai",
    franchise: "One Piece",
    basePrice: 899.9,
    compareAtPrice: null,
    weight: 450,
    dimensions: { length: 22, width: 16, height: 8 },
    status: "ACTIVE",
    featured: true,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("luffy-1"), altText: "Luffy Gear 5", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("luffy-2"), altText: "Acessórios", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("luffy-3"), altText: "Caixa", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "SHF-LUFFY-G5-DEFAULT",
        name: "Padrão (com caixa)", priceOverride: null, stock: 6, lowStockThreshold: 3,
        isActive: true, imageUrl: null,
        tcgLanguage: null, tcgCondition: null, tcgEdition: null, tcgRarity: null,
        tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: true, figureBoxCondition: "MINT",
        figureScale: "S.H. Figuarts", figureManufacturer: "Bandai",
      },
    ],
    tags: [TAGS.launch, TAGS.jp],
  }),

  // 6. Black Lotus
  mk({
    slug: "black-lotus-alpha",
    sku: "TCG-MTG-BLOTUS-ALPHA",
    name: "Black Lotus — Alpha Edition",
    shortDescription: "Power Nine — a carta mais icônica do Magic.",
    description: "Black Lotus original do Alpha (1993). Item de altíssima raridade com certificação.",
    categoryId: catMagic.id,
    productType: "TCG_SINGLE",
    brand: "Wizards of the Coast",
    franchise: "Magic: The Gathering",
    basePrice: 250000,
    compareAtPrice: null,
    weight: 5,
    dimensions: { length: 9, width: 6, height: 0.5 },
    status: "ACTIVE",
    featured: true,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("blotus-1"), altText: "Black Lotus", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("blotus-2"), altText: "Verso", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("blotus-3"), altText: "Certificado", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "TCG-MTG-BLOTUS-ALPHA-EN-NM",
        name: "Inglês · Near Mint", priceOverride: null, stock: 1, lowStockThreshold: 1,
        isActive: true, imageUrl: null,
        tcgLanguage: "EN", tcgCondition: "NEAR_MINT", tcgEdition: "Alpha",
        tcgRarity: "Rare", tcgIsFoil: false, tcgCardNumber: null,
        figureHasBox: null, figureBoxCondition: null, figureScale: null, figureManufacturer: null,
      },
    ],
    tags: [TAGS.rare, TAGS.exclusive, TAGS.en],
  }),

  // 7. Yu-Gi-Oh Dark Magician
  mk({
    slug: "yugioh-dark-magician-lob",
    sku: "TCG-YGO-DM-LOB",
    name: "Dark Magician — LOB",
    shortDescription: "Carta clássica do primeiro set inglês do Yu-Gi-Oh!.",
    description: "Dark Magician do set LOB (Legend of Blue Eyes White Dragon), edição original de 2002.",
    categoryId: catYugioh.id,
    productType: "TCG_SINGLE",
    brand: "Konami",
    franchise: "Yu-Gi-Oh!",
    basePrice: 320,
    compareAtPrice: null,
    weight: 15,
    dimensions: { length: 9, width: 6, height: 0.5 },
    status: "ACTIVE",
    featured: false,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("dm-1"), altText: "Dark Magician", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("dm-2"), altText: "Verso", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("dm-3"), altText: "Detalhe arte", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "TCG-YGO-DM-LOB-EN-NM",
        name: "Inglês · Near Mint", priceOverride: null, stock: 4, lowStockThreshold: 2,
        isActive: true, imageUrl: null,
        tcgLanguage: "EN", tcgCondition: "NEAR_MINT", tcgEdition: "Legend of Blue Eyes",
        tcgRarity: "Ultra Rare", tcgIsFoil: true, tcgCardNumber: "LOB-005",
        figureHasBox: null, figureBoxCondition: null, figureScale: null, figureManufacturer: null,
      },
    ],
    tags: [TAGS.rare, TAGS.en],
  }),

  // 8. One Piece OP-01 Booster Box (PRÉ-VENDA)
  mk({
    slug: "one-piece-tcg-op01-booster-box",
    sku: "TCG-OP-OP01-BB",
    name: "One Piece TCG — OP-01 Romance Dawn",
    shortDescription: "Display selado com 24 boosters.",
    description: "Primeiro set do One Piece TCG em inglês. Pré-venda com data confirmada.",
    categoryId: catOnePieceTcg.id,
    productType: "TCG_SEALED",
    brand: "Bandai",
    franchise: "One Piece",
    basePrice: 749.9,
    compareAtPrice: null,
    weight: 900,
    dimensions: { length: 28, width: 18, height: 11 },
    status: "ACTIVE",
    featured: true,
    isPreOrder: true,
    releaseDate: daysFromNow(90),
    preOrderEndsAt: daysFromNow(75),
    images: [
      { id: id("img"), url: img("op01-1"), altText: "OP-01 Booster Box", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("op01-2"), altText: "Boosters internos", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("op01-3"), altText: "Verso", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "TCG-OP-OP01-BB-EN",
        name: "Inglês · Selado", priceOverride: 749.9, stock: 20, lowStockThreshold: 8,
        isActive: true, imageUrl: null,
        tcgLanguage: "EN", tcgCondition: "MINT", tcgEdition: "OP-01 Romance Dawn",
        tcgRarity: null, tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: null, figureBoxCondition: null, figureScale: null, figureManufacturer: null,
      },
    ],
    tags: [TAGS.preorder, TAGS.sealed, TAGS.launch],
  }),

  // 9. Saitama Resin Statue
  mk({
    slug: "estatua-saitama-one-punch-man",
    sku: "STATUE-OPM-SAITAMA",
    name: "Estátua Saitama Serious Punch — Resin 1/6",
    shortDescription: "Estátua em resina, 35cm, edição limitada.",
    description: "Estátua de Saitama executando o Serious Punch. Resina, base com paisagem destruída. Numerada.",
    categoryId: catStatues.id,
    productType: "COLLECTIBLE",
    brand: "Studio Custom",
    franchise: "One Punch Man",
    basePrice: 2899.9,
    compareAtPrice: null,
    weight: 4500,
    dimensions: { length: 35, width: 35, height: 38 },
    status: "ACTIVE",
    featured: true,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("saitama-1"), altText: "Saitama Resin", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("saitama-2"), altText: "Vista lateral", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("saitama-3"), altText: "Base", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "STATUE-OPM-SAITAMA-DEFAULT",
        name: "Edição numerada", priceOverride: null, stock: 2, lowStockThreshold: 1,
        isActive: true, imageUrl: null,
        tcgLanguage: null, tcgCondition: null, tcgEdition: null, tcgRarity: null,
        tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: true, figureBoxCondition: "MINT",
        figureScale: "1/6", figureManufacturer: "Studio Custom",
      },
    ],
    tags: [TAGS.rare, TAGS.exclusive, TAGS.launch],
  }),

  // 10. Funko Spider-Man
  mk({
    slug: "funko-pop-spider-man-no-way-home",
    sku: "FUNKO-SPIDER-NWH",
    name: "Funko Pop! Spider-Man (No Way Home) #1158",
    shortDescription: "Marvel — Spider-Man uniforme dourado e azul.",
    description: "Funko Pop oficial do Spider-Man no filme No Way Home.",
    categoryId: catMarvel.id,
    productType: "COLLECTIBLE",
    brand: "Funko",
    franchise: "Marvel",
    basePrice: 189.9,
    compareAtPrice: 229.9,
    weight: 230,
    dimensions: { length: 10, width: 10, height: 14 },
    status: "ACTIVE",
    featured: false,
    isPreOrder: false,
    releaseDate: null,
    preOrderEndsAt: null,
    images: [
      { id: id("img"), url: img("spider-1"), altText: "Spider-Man frontal", sortOrder: 0, isPrimary: true },
      { id: id("img"), url: img("spider-2"), altText: "Caixa", sortOrder: 1, isPrimary: false },
      { id: id("img"), url: img("spider-3"), altText: "Verso", sortOrder: 2, isPrimary: false },
    ],
    variants: [
      {
        id: id("var"), productId: "_", sku: "FUNKO-SPIDER-NWH-DEFAULT",
        name: "Padrão", priceOverride: null, stock: 25, lowStockThreshold: 5,
        isActive: true, imageUrl: null,
        tcgLanguage: null, tcgCondition: null, tcgEdition: null, tcgRarity: null,
        tcgIsFoil: null, tcgCardNumber: null,
        figureHasBox: true, figureBoxCondition: "MINT",
        figureScale: null, figureManufacturer: "Funko",
      },
    ],
    tags: [TAGS.promo, TAGS.en],
  }),
];

// Backfill productId nos variants
DEMO_PRODUCTS.forEach((p) => {
  p.variants.forEach((v) => {
    v.productId = p.id;
  });
});
