/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PrismaClient,
  UserRole,
  CategoryType,
  ProductType,
  ProductStatus,
  TcgLanguage,
  TcgCondition,
  FigureBoxCondition,
  DiscountType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Kizuna@2026";

// =====================================================================
// HELPERS
// =====================================================================

function img(seed: string, w = 800, h = 800): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// =====================================================================
// LIMPEZA
// =====================================================================

async function clean() {
  // Ordem importa por causa das FKs.
  await prisma.meWebhookEvent.deleteMany();
  await prisma.shippingQuote.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
}

// =====================================================================
// USUÁRIOS
// =====================================================================

async function seedUsers() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@kizunageek.com.br",
      name: "Admin Kizuna",
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      marketingOptIn: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@kizunageek.com.br",
      name: "Staff Kizuna",
      passwordHash,
      role: UserRole.STAFF,
      emailVerified: new Date(),
      marketingOptIn: false,
    },
  });

  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: "yuki@example.com",
        name: "Yuki Tanaka",
        passwordHash,
        role: UserRole.CUSTOMER,
        emailVerified: new Date(),
        cpf: "12345678901",
        phone: "+5515999990001",
        marketingOptIn: true,
        addresses: {
          create: {
            label: "Casa",
            recipientName: "Yuki Tanaka",
            zipCode: "01310100",
            street: "Avenida Paulista",
            number: "1578",
            complement: "Apto 42",
            neighborhood: "Bela Vista",
            city: "São Paulo",
            state: "SP",
            isDefault: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "lucas@example.com",
        name: "Lucas Silva",
        passwordHash,
        role: UserRole.CUSTOMER,
        emailVerified: new Date(),
        cpf: "23456789012",
        phone: "+5515999990002",
        marketingOptIn: true,
        addresses: {
          create: {
            label: "Casa",
            recipientName: "Lucas Silva",
            zipCode: "18200000",
            street: "Rua XV de Novembro",
            number: "200",
            neighborhood: "Centro",
            city: "Itapetininga",
            state: "SP",
            isDefault: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "maria@example.com",
        name: "Maria Hoshino",
        passwordHash,
        role: UserRole.CUSTOMER,
        emailVerified: new Date(),
        cpf: "34567890123",
        phone: "+5511988880003",
        marketingOptIn: false,
        addresses: {
          create: {
            label: "Trabalho",
            recipientName: "Maria Hoshino",
            zipCode: "04538132",
            street: "Avenida Brigadeiro Faria Lima",
            number: "3477",
            complement: "14º andar",
            neighborhood: "Itaim Bibi",
            city: "São Paulo",
            state: "SP",
            isDefault: true,
          },
        },
      },
    }),
  ]);

  return { admin, staff, customers };
}

// =====================================================================
// CATEGORIAS
// =====================================================================

async function seedCategories() {
  const actionFigures = await prisma.category.create({
    data: {
      name: "Action Figures",
      slug: "action-figures",
      description: "Bonecos articulados e figuras colecionáveis.",
      type: CategoryType.ACTION_FIGURE,
      sortOrder: 0,
      imageUrl: img("cat-action-figures"),
    },
  });

  const tcg = await prisma.category.create({
    data: {
      name: "TCG",
      slug: "tcg",
      description: "Trading Card Games — cartas avulsas, boosters e produtos selados.",
      type: CategoryType.TCG,
      sortOrder: 1,
      imageUrl: img("cat-tcg"),
    },
  });

  const collectibles = await prisma.category.create({
    data: {
      name: "Colecionáveis",
      slug: "colecionaveis",
      description: "Funkos, estátuas, nendoroids e itens exclusivos.",
      type: CategoryType.COLLECTIBLE,
      sortOrder: 2,
      imageUrl: img("cat-collectibles"),
    },
  });

  // Subcategorias
  const [anime, marvel, dc] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Anime",
        slug: "action-figures-anime",
        parentId: actionFigures.id,
        type: CategoryType.ACTION_FIGURE,
        sortOrder: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: "Marvel",
        slug: "action-figures-marvel",
        parentId: actionFigures.id,
        type: CategoryType.ACTION_FIGURE,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "DC",
        slug: "action-figures-dc",
        parentId: actionFigures.id,
        type: CategoryType.ACTION_FIGURE,
        sortOrder: 2,
      },
    }),
  ]);

  const [pokemon, magic, yugioh, onepieceTcg] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Pokémon",
        slug: "tcg-pokemon",
        parentId: tcg.id,
        type: CategoryType.TCG,
        sortOrder: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: "Magic: The Gathering",
        slug: "tcg-magic",
        parentId: tcg.id,
        type: CategoryType.TCG,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Yu-Gi-Oh!",
        slug: "tcg-yugioh",
        parentId: tcg.id,
        type: CategoryType.TCG,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "One Piece TCG",
        slug: "tcg-one-piece",
        parentId: tcg.id,
        type: CategoryType.TCG,
        sortOrder: 3,
      },
    }),
  ]);

  const [funko, statues, nendoroid] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Funko Pop",
        slug: "colecionaveis-funko",
        parentId: collectibles.id,
        type: CategoryType.COLLECTIBLE,
        sortOrder: 0,
      },
    }),
    prisma.category.create({
      data: {
        name: "Estátuas",
        slug: "colecionaveis-estatuas",
        parentId: collectibles.id,
        type: CategoryType.COLLECTIBLE,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Nendoroid",
        slug: "colecionaveis-nendoroid",
        parentId: collectibles.id,
        type: CategoryType.COLLECTIBLE,
        sortOrder: 2,
      },
    }),
  ]);

  return {
    actionFigures, tcg, collectibles,
    anime, marvel, dc,
    pokemon, magic, yugioh, onepieceTcg,
    funko, statues, nendoroid,
  };
}

// =====================================================================
// TAGS
// =====================================================================

const TAG_NAMES = [
  "lançamento",
  "promoção",
  "raro",
  "japonês",
  "inglês",
  "selado",
  "pré-venda",
  "exclusivo",
] as const;

type TagName = (typeof TAG_NAMES)[number];

async function seedTags(): Promise<Record<TagName, { id: string }>> {
  const slugify = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const tags = {} as Record<TagName, { id: string }>;
  for (const name of TAG_NAMES) {
    const tag = await prisma.tag.create({
      data: { name, slug: slugify(name) },
    });
    tags[name] = tag;
  }
  return tags;
}

// =====================================================================
// PRODUTOS
// =====================================================================

interface SeedContext {
  categories: Awaited<ReturnType<typeof seedCategories>>;
  tags: Awaited<ReturnType<typeof seedTags>>;
}

async function seedProducts({ categories, tags }: SeedContext) {
  // ---------- 1. Nendoroid Naruto Uzumaki ----------
  await prisma.product.create({
    data: {
      slug: "nendoroid-naruto-uzumaki",
      sku: "NEN-NARUTO-001",
      name: "Nendoroid Naruto Uzumaki",
      shortDescription: "Nendoroid #682 — Naruto Shippuden, by Good Smile Company.",
      description:
        "Figura colecionável estilo chibi de Naruto Uzumaki, com 3 faces intercambiáveis, kunai, shuriken e efeito de Rasengan.",
      categoryId: categories.nendoroid.id,
      productType: ProductType.COLLECTIBLE,
      brand: "Good Smile Company",
      franchise: "Naruto",
      basePrice: 449.9,
      compareAtPrice: 549.9,
      cost: 280.0,
      weight: 320,
      dimensions: { length: 14, width: 14, height: 12 },
      status: ProductStatus.ACTIVE,
      featured: true,
      isPreOrder: false,
      metaTitle: "Nendoroid Naruto Uzumaki | Kizuna Geek",
      metaDescription: "Nendoroid #682 oficial Good Smile Company. Frete para todo o Brasil.",
      images: {
        create: [
          { url: img("naruto-1"), altText: "Naruto Nendoroid frontal", sortOrder: 0, isPrimary: true },
          { url: img("naruto-2"), altText: "Naruto com kunai", sortOrder: 1 },
          { url: img("naruto-3"), altText: "Embalagem original", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "NEN-NARUTO-001-MINT",
            name: "Com caixa (mint)",
            priceOverride: 449.9,
            stock: 8,
            figureHasBox: true,
            figureBoxCondition: FigureBoxCondition.MINT,
            figureScale: "Nendoroid",
            figureManufacturer: "Good Smile Company",
          },
          {
            sku: "NEN-NARUTO-001-LOOSE",
            name: "Sem caixa (loose)",
            priceOverride: 329.9,
            stock: 3,
            figureHasBox: false,
            figureBoxCondition: FigureBoxCondition.NO_BOX,
            figureScale: "Nendoroid",
            figureManufacturer: "Good Smile Company",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["raro"].id } } },
          { tag: { connect: { id: tags["japonês"].id } } },
        ],
      },
    },
  });

  // ---------- 2. Charizard Base Set ----------
  await prisma.product.create({
    data: {
      slug: "charizard-base-set",
      sku: "TCG-PKM-CHARI-001",
      name: "Charizard Holo — Base Set #4/102",
      shortDescription: "Carta icônica do Set Base original do Pokémon TCG.",
      description:
        "Charizard holográfico, raridade Holo Rare, do Base Set lançado em 1999. Estado avaliado por especialista. Item de colecionador.",
      categoryId: categories.pokemon.id,
      productType: ProductType.TCG_SINGLE,
      brand: "The Pokémon Company",
      franchise: "Pokémon",
      basePrice: 4500.0,
      cost: 2800.0,
      weight: 20,
      dimensions: { length: 9, width: 6, height: 0.5 },
      status: ProductStatus.ACTIVE,
      featured: true,
      isPreOrder: false,
      metaTitle: "Charizard Holo Base Set | Kizuna Geek",
      images: {
        create: [
          { url: img("charizard-1"), altText: "Charizard Base Set", sortOrder: 0, isPrimary: true },
          { url: img("charizard-2"), altText: "Verso da carta", sortOrder: 1 },
          { url: img("charizard-3"), altText: "Detalhe holográfico", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "TCG-PKM-CHARI-001-EN-NM-FOIL",
            name: "Inglês · Near Mint · Foil",
            priceOverride: 4500.0,
            stock: 1,
            tcgLanguage: TcgLanguage.EN,
            tcgCondition: TcgCondition.NEAR_MINT,
            tcgEdition: "Base Set",
            tcgRarity: "Holo Rare",
            tcgIsFoil: true,
            tcgCardNumber: "004/102",
          },
          {
            sku: "TCG-PKM-CHARI-001-EN-LP-NONFOIL",
            name: "Inglês · Lightly Played · Non-foil",
            priceOverride: 2300.0,
            stock: 2,
            tcgLanguage: TcgLanguage.EN,
            tcgCondition: TcgCondition.LIGHTLY_PLAYED,
            tcgEdition: "Base Set",
            tcgRarity: "Holo Rare",
            tcgIsFoil: false,
            tcgCardNumber: "004/102",
          },
          {
            sku: "TCG-PKM-CHARI-001-JP-NM-FOIL",
            name: "Japonês · Near Mint · Foil",
            priceOverride: 3800.0,
            stock: 1,
            tcgLanguage: TcgLanguage.JP,
            tcgCondition: TcgCondition.NEAR_MINT,
            tcgEdition: "Base Set",
            tcgRarity: "Holo Rare",
            tcgIsFoil: true,
            tcgCardNumber: "004/102",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["raro"].id } } },
          { tag: { connect: { id: tags["inglês"].id } } },
          { tag: { connect: { id: tags["japonês"].id } } },
          { tag: { connect: { id: tags["exclusivo"].id } } },
        ],
      },
    },
  });

  // ---------- 3. Booster Box Scarlet & Violet 151 (PRÉ-VENDA) ----------
  await prisma.product.create({
    data: {
      slug: "booster-box-pokemon-sv-151",
      sku: "TCG-PKM-SV151-BB",
      name: "Booster Box — Pokémon Scarlet & Violet 151",
      shortDescription: "Display selado com 36 booster packs.",
      description:
        "Display oficial do Scarlet & Violet 151. Pré-venda — entrega prevista após o lançamento oficial.",
      categoryId: categories.pokemon.id,
      productType: ProductType.TCG_SEALED,
      brand: "The Pokémon Company",
      franchise: "Pokémon",
      basePrice: 1299.9,
      compareAtPrice: 1499.9,
      cost: 900.0,
      weight: 1200,
      dimensions: { length: 30, width: 20, height: 12 },
      status: ProductStatus.ACTIVE,
      featured: true,
      isPreOrder: true,
      releaseDate: daysFromNow(75),
      preOrderEndsAt: daysFromNow(60),
      images: {
        create: [
          { url: img("sv151-1"), altText: "Booster Box S&V 151", sortOrder: 0, isPrimary: true },
          { url: img("sv151-2"), altText: "Conteúdo do display", sortOrder: 1 },
          { url: img("sv151-3"), altText: "Embalagem lateral", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "TCG-PKM-SV151-BB-EN",
            name: "Inglês · Selado",
            priceOverride: 1299.9,
            stock: 30,
            tcgLanguage: TcgLanguage.EN,
            tcgCondition: TcgCondition.MINT,
            tcgEdition: "Scarlet & Violet 151",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["pré-venda"].id } } },
          { tag: { connect: { id: tags["selado"].id } } },
          { tag: { connect: { id: tags["inglês"].id } } },
          { tag: { connect: { id: tags["lançamento"].id } } },
        ],
      },
    },
  });

  // ---------- 4. Funko Pop Goku Ultra Instinct ----------
  await prisma.product.create({
    data: {
      slug: "funko-pop-goku-ultra-instinct",
      sku: "FUNKO-GOKU-UI",
      name: "Funko Pop! Goku Ultra Instinct #386",
      shortDescription: "Dragon Ball Super — Funko Pop Animation.",
      description:
        "Funko Pop oficial do Goku no estado Ultra Instinct. Vinyl figure de 10cm.",
      categoryId: categories.funko.id,
      productType: ProductType.COLLECTIBLE,
      brand: "Funko",
      franchise: "Dragon Ball",
      basePrice: 159.9,
      cost: 90.0,
      weight: 220,
      dimensions: { length: 10, width: 10, height: 14 },
      status: ProductStatus.ACTIVE,
      featured: false,
      images: {
        create: [
          { url: img("goku-1"), altText: "Funko Goku Ultra Instinct", sortOrder: 0, isPrimary: true },
          { url: img("goku-2"), altText: "Caixa frontal", sortOrder: 1 },
          { url: img("goku-3"), altText: "Detalhe do cabelo prateado", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "FUNKO-GOKU-UI-DEFAULT",
            name: "Padrão",
            stock: 15,
            figureHasBox: true,
            figureBoxCondition: FigureBoxCondition.MINT,
            figureManufacturer: "Funko",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["promoção"].id } } },
        ],
      },
    },
  });

  // ---------- 5. S.H. Figuarts Luffy Gear 5 ----------
  await prisma.product.create({
    data: {
      slug: "sh-figuarts-luffy-gear-5",
      sku: "SHF-LUFFY-G5",
      name: "S.H. Figuarts Monkey D. Luffy — Gear 5",
      shortDescription: "Figura articulada Bandai Tamashii Nations.",
      description:
        "Luffy em sua forma Gear 5 (Joy Boy). Múltiplas mãos intercambiáveis, expressões e efeitos. Escala S.H. Figuarts.",
      categoryId: categories.anime.id,
      productType: ProductType.ACTION_FIGURE,
      brand: "Bandai",
      franchise: "One Piece",
      basePrice: 899.9,
      cost: 520.0,
      weight: 450,
      dimensions: { length: 22, width: 16, height: 8 },
      status: ProductStatus.ACTIVE,
      featured: true,
      images: {
        create: [
          { url: img("luffy-1"), altText: "Luffy Gear 5 pose", sortOrder: 0, isPrimary: true },
          { url: img("luffy-2"), altText: "Acessórios", sortOrder: 1 },
          { url: img("luffy-3"), altText: "Caixa original", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "SHF-LUFFY-G5-DEFAULT",
            name: "Padrão (com caixa)",
            stock: 6,
            figureHasBox: true,
            figureBoxCondition: FigureBoxCondition.MINT,
            figureScale: "S.H. Figuarts",
            figureManufacturer: "Bandai",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["lançamento"].id } } },
          { tag: { connect: { id: tags["japonês"].id } } },
        ],
      },
    },
  });

  // ---------- 6. Black Lotus Alpha ----------
  await prisma.product.create({
    data: {
      slug: "black-lotus-alpha",
      sku: "TCG-MTG-BLOTUS-ALPHA",
      name: "Black Lotus — Alpha Edition",
      shortDescription: "Power Nine — a carta mais icônica do Magic.",
      description:
        "Black Lotus original do conjunto Alpha (1993). Item de altíssima raridade. Inclui certificação de autenticidade.",
      categoryId: categories.magic.id,
      productType: ProductType.TCG_SINGLE,
      brand: "Wizards of the Coast",
      franchise: "Magic: The Gathering",
      basePrice: 250000.0,
      cost: 180000.0,
      weight: 5,
      dimensions: { length: 9, width: 6, height: 0.5 },
      status: ProductStatus.ACTIVE,
      featured: true,
      images: {
        create: [
          { url: img("black-lotus-1"), altText: "Black Lotus frontal", sortOrder: 0, isPrimary: true },
          { url: img("black-lotus-2"), altText: "Verso", sortOrder: 1 },
          { url: img("black-lotus-3"), altText: "Certificado", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "TCG-MTG-BLOTUS-ALPHA-EN-NM",
            name: "Inglês · Near Mint",
            stock: 1,
            tcgLanguage: TcgLanguage.EN,
            tcgCondition: TcgCondition.NEAR_MINT,
            tcgEdition: "Alpha",
            tcgRarity: "Rare",
            tcgIsFoil: false,
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["raro"].id } } },
          { tag: { connect: { id: tags["exclusivo"].id } } },
          { tag: { connect: { id: tags["inglês"].id } } },
        ],
      },
    },
  });

  // ---------- 7. Yu-Gi-Oh! Dark Magician ----------
  await prisma.product.create({
    data: {
      slug: "yugioh-dark-magician-lob",
      sku: "TCG-YGO-DM-LOB",
      name: "Dark Magician — Legend of Blue Eyes",
      shortDescription: "Carta clássica do primeiro set inglês do Yu-Gi-Oh!.",
      description:
        "Dark Magician do set LOB (Legend of Blue Eyes White Dragon), edição original de 2002.",
      categoryId: categories.yugioh.id,
      productType: ProductType.TCG_SINGLE,
      brand: "Konami",
      franchise: "Yu-Gi-Oh!",
      basePrice: 320.0,
      cost: 180.0,
      weight: 15,
      dimensions: { length: 9, width: 6, height: 0.5 },
      status: ProductStatus.ACTIVE,
      featured: false,
      images: {
        create: [
          { url: img("dm-1"), altText: "Dark Magician", sortOrder: 0, isPrimary: true },
          { url: img("dm-2"), altText: "Verso", sortOrder: 1 },
          { url: img("dm-3"), altText: "Detalhe arte", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "TCG-YGO-DM-LOB-EN-NM",
            name: "Inglês · Near Mint",
            stock: 4,
            tcgLanguage: TcgLanguage.EN,
            tcgCondition: TcgCondition.NEAR_MINT,
            tcgEdition: "Legend of Blue Eyes White Dragon",
            tcgRarity: "Ultra Rare",
            tcgIsFoil: true,
            tcgCardNumber: "LOB-005",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["raro"].id } } },
          { tag: { connect: { id: tags["inglês"].id } } },
        ],
      },
    },
  });

  // ---------- 8. One Piece TCG OP-01 Booster Box (PRÉ-VENDA) ----------
  await prisma.product.create({
    data: {
      slug: "one-piece-tcg-op01-booster-box",
      sku: "TCG-OP-OP01-BB",
      name: "One Piece TCG — OP-01 Romance Dawn Booster Box",
      shortDescription: "Display selado com 24 boosters.",
      description:
        "Lançamento oficial do primeiro set do One Piece TCG em inglês. Pré-venda com data confirmada.",
      categoryId: categories.onepieceTcg.id,
      productType: ProductType.TCG_SEALED,
      brand: "Bandai",
      franchise: "One Piece",
      basePrice: 749.9,
      cost: 480.0,
      weight: 900,
      dimensions: { length: 28, width: 18, height: 11 },
      status: ProductStatus.ACTIVE,
      featured: true,
      isPreOrder: true,
      releaseDate: daysFromNow(90),
      preOrderEndsAt: daysFromNow(75),
      images: {
        create: [
          { url: img("op01-1"), altText: "OP-01 Booster Box", sortOrder: 0, isPrimary: true },
          { url: img("op01-2"), altText: "Boosters internos", sortOrder: 1 },
          { url: img("op01-3"), altText: "Verso da caixa", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "TCG-OP-OP01-BB-EN",
            name: "Inglês · Selado",
            priceOverride: 749.9,
            stock: 20,
            tcgLanguage: TcgLanguage.EN,
            tcgCondition: TcgCondition.MINT,
            tcgEdition: "OP-01 Romance Dawn",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["pré-venda"].id } } },
          { tag: { connect: { id: tags["selado"].id } } },
          { tag: { connect: { id: tags["lançamento"].id } } },
        ],
      },
    },
  });

  // ---------- 9. Estátua Saitama Resin ----------
  await prisma.product.create({
    data: {
      slug: "estatua-saitama-one-punch-man",
      sku: "STATUE-OPM-SAITAMA",
      name: "Estátua Saitama Serious Punch — Resin 1/6",
      shortDescription: "Estátua em resina, 35cm, edição limitada.",
      description:
        "Estátua de Saitama executando o Serious Punch. Resina de alta qualidade, base com paisagem destruída. Edição numerada.",
      categoryId: categories.statues.id,
      productType: ProductType.COLLECTIBLE,
      brand: "Studio Custom",
      franchise: "One Punch Man",
      basePrice: 2899.9,
      cost: 1800.0,
      weight: 4500,
      dimensions: { length: 35, width: 35, height: 38 },
      status: ProductStatus.ACTIVE,
      featured: true,
      images: {
        create: [
          { url: img("saitama-1"), altText: "Saitama Serious Punch frontal", sortOrder: 0, isPrimary: true },
          { url: img("saitama-2"), altText: "Vista lateral", sortOrder: 1 },
          { url: img("saitama-3"), altText: "Detalhe da base", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "STATUE-OPM-SAITAMA-DEFAULT",
            name: "Edição numerada",
            stock: 2,
            figureHasBox: true,
            figureBoxCondition: FigureBoxCondition.MINT,
            figureScale: "1/6",
            figureManufacturer: "Studio Custom",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["raro"].id } } },
          { tag: { connect: { id: tags["exclusivo"].id } } },
          { tag: { connect: { id: tags["lançamento"].id } } },
        ],
      },
    },
  });

  // ---------- 10. Funko Pop Spider-Man ----------
  await prisma.product.create({
    data: {
      slug: "funko-pop-spider-man-no-way-home",
      sku: "FUNKO-SPIDER-NWH",
      name: "Funko Pop! Spider-Man (No Way Home) #1158",
      shortDescription: "Marvel — Spider-Man uniforme dourado e azul.",
      description:
        "Funko Pop oficial do Spider-Man no filme No Way Home, com o uniforme final.",
      categoryId: categories.marvel.id,
      productType: ProductType.COLLECTIBLE,
      brand: "Funko",
      franchise: "Marvel",
      basePrice: 189.9,
      compareAtPrice: 229.9,
      cost: 110.0,
      weight: 230,
      dimensions: { length: 10, width: 10, height: 14 },
      status: ProductStatus.ACTIVE,
      featured: false,
      images: {
        create: [
          { url: img("spider-1"), altText: "Spider-Man frontal", sortOrder: 0, isPrimary: true },
          { url: img("spider-2"), altText: "Caixa", sortOrder: 1 },
          { url: img("spider-3"), altText: "Verso da figura", sortOrder: 2 },
        ],
      },
      variants: {
        create: [
          {
            sku: "FUNKO-SPIDER-NWH-DEFAULT",
            name: "Padrão",
            stock: 25,
            figureHasBox: true,
            figureBoxCondition: FigureBoxCondition.MINT,
            figureManufacturer: "Funko",
          },
        ],
      },
      tags: {
        create: [
          { tag: { connect: { id: tags["promoção"].id } } },
          { tag: { connect: { id: tags["inglês"].id } } },
        ],
      },
    },
  });
}

// =====================================================================
// CUPONS
// =====================================================================

async function seedCoupons() {
  await prisma.coupon.createMany({
    data: [
      {
        code: "BEMVINDO10",
        description: "10% off na primeira compra",
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        maxUsesPerUser: 1,
        startsAt: new Date(),
        expiresAt: daysFromNow(365),
        isActive: true,
        appliesToPreOrders: false,
      },
      {
        code: "FRETEGRATIS",
        description: "Frete grátis para compras acima de R$ 200",
        discountType: DiscountType.FREE_SHIPPING,
        discountValue: 0,
        minimumPurchase: 200,
        startsAt: new Date(),
        expiresAt: daysFromNow(180),
        isActive: true,
        appliesToPreOrders: true,
      },
      {
        code: "KIZUNA50",
        description: "R$ 50 off em compras acima de R$ 300",
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 50,
        minimumPurchase: 300,
        startsAt: new Date(),
        expiresAt: daysFromNow(90),
        isActive: true,
        appliesToPreOrders: true,
        maxUses: 500,
      },
    ],
  });
}

// =====================================================================
// FAVORITOS (WISHLIST)
// =====================================================================

async function seedWishlists() {
  // Cliente Yuki favorita 3 produtos, com notifyOnRestock no Booster Box em pré-venda.
  const yuki = await prisma.user.findUniqueOrThrow({ where: { email: "yuki@example.com" } });
  const lucas = await prisma.user.findUniqueOrThrow({ where: { email: "lucas@example.com" } });

  const wantedYuki = await prisma.product.findMany({
    where: {
      slug: { in: ["booster-box-pokemon-sv-151", "nendoroid-naruto-uzumaki", "charizard-base-set"] },
    },
    select: { id: true, slug: true, isPreOrder: true, variants: { select: { stock: true } } },
  });

  const wantedLucas = await prisma.product.findMany({
    where: { slug: { in: ["sh-figuarts-luffy-gear-5", "one-piece-tcg-op01-booster-box"] } },
    select: { id: true, slug: true, isPreOrder: true },
  });

  await prisma.wishlistItem.createMany({
    data: [
      ...wantedYuki.map((p) => ({
        userId: yuki.id,
        productId: p.id,
        // notifyOnRestock true para pré-venda OU produto com estoque baixo.
        notifyOnRestock:
          p.isPreOrder || p.variants.every((v) => v.stock <= 2),
      })),
      ...wantedLucas.map((p) => ({
        userId: lucas.id,
        productId: p.id,
        notifyOnRestock: p.isPreOrder,
      })),
    ],
  });
}

// =====================================================================
// MAIN
// =====================================================================

async function main() {
  console.log("🧹 Limpando dados existentes…");
  await clean();

  console.log("👤 Criando usuários…");
  await seedUsers();

  console.log("🏷️  Criando categorias…");
  const categories = await seedCategories();

  console.log("🔖 Criando tags…");
  const tags = await seedTags();

  console.log("📦 Criando produtos…");
  await seedProducts({ categories, tags });

  console.log("🎟️  Criando cupons…");
  await seedCoupons();

  console.log("⭐ Criando favoritos de exemplo…");
  await seedWishlists();

  console.log("\n✅ Seed concluído com sucesso!\n");
  console.log("Credenciais (senha: " + DEFAULT_PASSWORD + "):");
  console.log("  · admin@kizunageek.com.br  (ADMIN)");
  console.log("  · staff@kizunageek.com.br  (STAFF)");
  console.log("  · yuki@example.com         (CUSTOMER)");
  console.log("  · lucas@example.com        (CUSTOMER)");
  console.log("  · maria@example.com        (CUSTOMER)\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
