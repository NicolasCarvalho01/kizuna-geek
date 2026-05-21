<div align="center">

# 絆 Kizuna Geek

**E-commerce boutique de Action Figures, Colecionáveis e Trading Card Games.**
**Curadoria, pré-vendas e raridades — Itapetininga/SP.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-PIX_+_Cart%C3%A3o-635BFF?logo=stripe)](https://stripe.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com)

[🌐 **Live**](https://kizunageek.com.br) · [📦 Stack](#-stack) · [🏛️ Arquitetura](#%EF%B8%8F-arquitetura) · [⚡ Setup](#-setup-local)

</div>

> **絆 (Kizuna)** é a palavra japonesa pros laços invisíveis que se formam entre pessoas — e entre as pessoas e as coisas que decidem guardar. Toda peça desta loja existe por causa de um desses laços.

---

## ✨ O projeto

E-commerce **production-ready** construído do zero pro mercado brasileiro de cultura pop japonesa. Não é um clone do Magento nem template Shopify — é uma plataforma boutique com regras de negócio reais: pré-vendas com janela de prioridade, NF-e fiscalmente correta (emite no envio, não no pagamento), cotação de frete em tempo real e atendimento direto pelo lojista.

**Por que esse projeto importa:** combina o full-stack moderno (App Router, Server Actions, RSC, edge middleware) com as integrações que **realmente importam pra vender no Brasil** — Stripe BR (PIX/boleto/cartão), Melhor Envio (cart→checkout→generate→print), Focus NFe (modelo 55 com NCM/CFOP/ICMS Simples), Supabase Storage, Resend, Vercel Cron.

---

## 🎯 Features

### 🛍️ Storefront público

- **Home editorial** com kanji 絆 em SVG animado (KanjiVG, 11 strokes com `stroke-dashoffset`)
- **Catálogo** com filtros facetados (categoria, franquia, marca, idioma TCG, condição, preço, foil-only, em estoque) e busca textual
- **Página de produto** com galeria, variantes (SKU/idioma/condição/escala), specs, breadcrumb, JSON-LD `Product` com `AggregateOffer`
- **Carrinho persistente** (Zustand + localStorage, sincronizado com DB ao logar)
- **Checkout** PIX/cartão/boleto via Stripe Checkout, com pré-criação de Order PENDING e reconciliação automática se webhook atrasar
- **Conta do cliente**: pedidos com timeline visual, endereços, dados pessoais (LGPD-friendly), wishlist
- **Página /sobre** editorial com manifesto, pilares, linha do tempo
- **SEO**: sitemap.xml dinâmico (varre produtos+categorias do DB), robots.txt com bloqueio de bots de scraping, JSON-LD Organization/Website/Product/BreadcrumbList, metadata Open Graph

### 🎛️ Painel admin

- **Dashboard** com KPIs (LTV, receita, pedidos por status) + gráficos Recharts
- **Produtos** com CRUD completo, variantes dinâmicas (TCG vs Figure), upload de imagens via Supabase Storage (drag & drop, reorder), descrição rica via Tiptap (H2/H3, listas, blockquote, link, undo/redo)
- **Pedidos** com fluxo completo Melhor Envio: cotação → compra de etiqueta → impressão → marcar postado (com NF-e automática) → tracking
- **Cupons** percentual/valor fixo/frete grátis com regras (mínimo de pedido, primeira compra, limite de uso)
- **Clientes** com LTV calculado, histórico de pedidos, pré-vendas ativas
- **Pré-vendas** com painel dedicado, alertas de release próximo (7/3/1 dias), email automático ao chegar
- **NF-e** com lista de invoices, status SEFAZ, links DANFE/XML, re-emissão, cancelamento (com regra de 24h)

### 🇧🇷 Integrações brasileiras

| Integração | O que faz | Estado |
|---|---|---|
| **Stripe** | Checkout BR (PIX/cartão/boleto), webhooks idempotentes | ✅ Test + Live ready |
| **Melhor Envio** | Cotação real, cart→checkout→generate→print, OAuth + PAT | ✅ Sandbox + Prod ready |
| **Focus NFe** | Emissão NF-e modelo 55, cancelamento, webhook async | ✅ Stub mode + Prod ready |
| **Resend** | 10 templates React Email (welcome, payment, shipping, pre-order) | ✅ Stub mode + Prod ready |
| **Supabase Auth + DB + Storage** | Postgres + Auth + buckets de imagens | ✅ Produção |
| **Vercel Cron** | 3 jobs (preorder reminders, preorder released, abandoned carts) | ✅ Produção |
| **Sentry + Vercel Analytics** | Observabilidade com fallback graceful | ✅ Opt-in |

---

## 📦 Stack

**Frontend**
- Next.js 15 (App Router, Server Actions, RSC, Turbopack)
- React 19 (concurrent features, `useTransition`)
- TypeScript strict (zero `any`, validação Zod em todas as boundaries)
- Tailwind CSS v4 com `@theme` tokens (cream/gold/navy palette editorial)
- Radix UI (Dialog, Dropdown, Select, Toggle)
- Tiptap 3 (rich text)
- Recharts 3 (admin dashboard)
- Zustand 5 (cart/wishlist)
- Lucide React + custom SVG icons

**Backend**
- Prisma 6 + PostgreSQL (Supabase) — 16 enums, 21 models
- Auth.js v5 (beta) com Credentials + Google, JWT sessions, role-based access
- Server Actions com guards declarativos
- Edge middleware (x-pathname header propagation)
- API Routes pra webhooks (Stripe, Melhor Envio, Focus NFe) com validação HMAC

**Integrações & infra**
- Stripe API `2026-04-22.dahlia` (com webhook signature validation)
- Melhor Envio v2 (OAuth + PAT, sandbox + prod URLs, auto-refresh token)
- Focus NFe v2 (homologação + produção, regra fiscal pré-venda)
- Resend + React Email
- Supabase Storage (service_role server-side, bucket público)
- Vercel Cron (3 jobs) com auth via Bearer + `x-cron-key`
- Sentry (`@sentry/nextjs` 10) com instrumentation hook
- Vercel Analytics + Speed Insights

---

## 🏛️ Arquitetura

```
src/
├── app/                          # App Router
│   ├── (auth)/                   # rotas com layout próprio
│   ├── admin/                    # painel admin (RBAC ADMIN|STAFF)
│   ├── api/
│   │   ├── webhooks/             # Stripe, Melhor Envio, Focus NFe
│   │   └── cron/                 # Vercel Cron jobs
│   ├── catalogo/[category]/      # SSG com generateStaticParams
│   ├── produto/[slug]/           # JSON-LD Product injection
│   ├── sitemap.ts                # sitemap.xml dinâmico
│   └── robots.ts                 # robots.txt
├── components/
│   ├── admin/                    # forms, editors, dropzones, charts
│   ├── brand/                    # 絆 SVG calligraphy, marquee, social icons
│   ├── catalog/                  # cards, filters, paginator
│   ├── checkout/                 # multi-step flow + clear-cart hook
│   ├── product/                  # gallery, actions, CEP calculator
│   ├── seo/                      # JsonLd helper + factories
│   └── ui/                       # button, input, sheet, badge, eyebrow
├── emails/                       # 10 React Email templates
├── lib/                          # clients (stripe, ME, focus-nfe, resend, supabase-storage)
├── server/
│   ├── actions/                  # Server Actions (auth, cart, checkout, admin)
│   ├── queries/                  # DB queries (mapDbToShape pattern)
│   └── services/                 # orchestrators (emails, nfe)
└── instrumentation.ts            # Sentry init per runtime
```

### Decisões técnicas notáveis

- **Regra fiscal de pré-venda**: NF-e é emitida quando o admin marca o pedido como **postado**, não quando o pagamento é aprovado. Implementado em `admin-order-actions.ts:markAsPosted` → `emitInvoiceForOrder`. Crítico pra ficar conforme com SEFAZ em vendas de items que ainda não estão em estoque.
- **Idempotência em webhooks**: Stripe webhook valida assinatura HMAC + dedup por `event.id`. Melhor Envio webhook persiste todo evento em `MeWebhookEvent` antes de processar.
- **Reconciliação de checkout**: se o webhook Stripe atrasar, `/checkout/sucesso` lê `session.payment_status` direto da API e atualiza o Order — sem deixar cliente preso no PENDING.
- **Modo demo gracioso**: app roda end-to-end sem DATABASE_URL, RESEND_API_KEY, FOCUS_NFE_TOKEN, etc. Cada lib detecta falta de config e vira stub com logs claros. Acelera onboarding e CI.
- **Mock quotes pro Melhor Envio sandbox**: o sandbox ME só tem Jadlog. `buildMockQuotes` injeta PAC/SEDEX/Loggi pra UX coerente em dev.
- **CRLF de Windows**: dev no Windows, deploy no Linux — `.gitattributes` mantém line endings consistentes.
- **typedRoutes desligado intencionalmente**: filtros via query string (`?status=PENDING`, `?filter=low-stock`) conflitam com `Route` literal. Decisão documentada em `next.config.ts`.

---

## ⚡ Setup local

### Pré-requisitos
- Node.js 20+ (testado em 24)
- npm 10+
- Postgres (recomendo [Supabase free tier](https://supabase.com))

### Quick start

```bash
git clone https://github.com/NicolasCarvalho01/kizuna-geek.git
cd kizuna-geek
npm install                       # roda prisma generate via postinstall
cp .env.example .env.local        # preencha as vars (veja abaixo)
npm run db:migrate                # cria schema no Postgres
npm run db:seed                   # popula com categorias + produtos demo
npm run dev                       # http://localhost:3000
```

### Variáveis de ambiente mínimas pra rodar

```bash
# Obrigatórias
AUTH_SECRET=                      # openssl rand -base64 32
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=                     # Supabase pooler 6543
DIRECT_URL=                       # Supabase direct 5432

# Opcionais (sem essas, app vira stub em cada feature)
STRIPE_SECRET_KEY=                # sem isso, checkout não funciona
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
MELHOR_ENVIO_TOKEN=               # sem isso, mock quotes só
MELHOR_ENVIO_SANDBOX=true
MELHOR_ENVIO_ORIGIN_ZIPCODE=18200000
FOCUS_NFE_TOKEN=                  # sem isso, NF-e fica em stub
RESEND_API_KEY=                   # sem isso, emails só no console
SUPABASE_SERVICE_ROLE_KEY=        # sem isso, upload de imagens desligado
```

Lista completa em [`.env.example`](.env.example).

### Credenciais de dev (após seed)

Senha de todos: `Kizuna@2026`

- `admin@kizunageek.com.br` (ADMIN)
- `staff@kizunageek.com.br` (STAFF)
- `yuki@example.com`, `lucas@example.com`, `maria@example.com` (CUSTOMER)

### Scripts úteis

```bash
npm run dev          # Turbopack dev server
npm run build        # build de produção (48 rotas)
npm run typecheck    # tsc --noEmit
npm run db:studio    # Prisma Studio (GUI do banco)
npm run db:reset     # drop + migrate + seed
npm run me:auth      # OAuth dance do Melhor Envio (gera tokens)
```

---

## 🚀 Deploy

Deployado na **Vercel** com domínio próprio:

1. Push pro GitHub → Vercel detecta e faz build automático
2. Env vars configuradas em Production/Preview/Development
3. DNS Hostinger apontando A `@` → `216.198.79.1` e CNAME `www` → `vercel-dns-017.com`
4. SSL automático via Let's Encrypt
5. Vercel Cron rodando 3 jobs em horários configurados (`vercel.json`)

Estado dos serviços em produção:
- **Stripe**: webhook prod ativo escutando `checkout.session.completed`, `expired`, `payment_intent.payment_failed`, `charge.refunded`
- **Melhor Envio**: PAT sandbox ativo (migração pra prod aguarda CNPJ + saldo na conta ME prod)
- **NF-e**: aguarda certificado A1 (código pronto, em stub mode)

---

## 📊 Métricas

- **48 rotas** geradas no build
- **Zero erros** de TypeScript
- **171 arquivos** rastreados no git
- **16 enums** + **21 models** Prisma
- **10 templates** React Email
- **3 cron jobs** Vercel
- **6 webhooks** distintos (Stripe, ME x2, Focus NFe, ME callback OAuth, Stripe webhook)

---

## 🪪 License

Projeto pessoal — código disponível pra fins de estudo e portfolio. Marca **Kizuna Geek**, identidade visual e curadoria são da loja.

---

<div align="center">

絆 — *Os laços que escolhemos guardar.*

**Construído por [Nicolas Carvalho](https://github.com/NicolasCarvalho01)** · 2024-2026

</div>
