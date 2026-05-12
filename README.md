# Kizuna Geek 絆

E-commerce de **Action Figures, Colecionáveis e TCG** — Itapetininga/SP.

> *Kizuna* (絆) = "laços inquebráveis entre pessoas". Esta é a fundação técnica do projeto.

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript strict**
- **Tailwind CSS v4** (PostCSS plugin)
- **Prisma 6** + **PostgreSQL** (Supabase)
- **Auth.js v5** (NextAuth) + Prisma adapter
- **Zod** para validação (env, formulários, payloads)
- **Stripe** para pagamentos
- **Melhor Envio** para frete e etiquetas
- **Focus NFe** para nota fiscal eletrônica
- **Resend** para e-mails transacionais
- **UploadThing** para uploads

---

## Setup local — passo a passo

### 1. Pré-requisitos

- Node.js **20+** (testado em 24)
- npm **10+**
- Conta no [Supabase](https://supabase.com) (free tier)
- Conta no [Melhor Envio sandbox](https://sandbox.melhorenvio.com.br) (homologação)
- Conta no [Focus NFe](https://focusnfe.com.br) (homologação)
- Conta no [Stripe](https://stripe.com) (test mode)

### 2. Banco de dados no Supabase

1. Crie um novo projeto em <https://app.supabase.com>.
2. Em **Project Settings → Database → Connection string**, copie:
   - **Connection pooling** (`?pgbouncer=true`, porta `6543`) → `DATABASE_URL`
   - **Direct connection** (porta `5432`) → `DIRECT_URL`
3. Substitua `[YOUR-PASSWORD]` pela senha do banco.

> O Prisma usa `DATABASE_URL` em runtime e `DIRECT_URL` apenas para migrations.

### 3. Melhor Envio sandbox

1. Crie uma conta em <https://sandbox.melhorenvio.com.br>.
2. **Painel → Gerenciar → Tokens → Aplicativos**.
3. Crie um app. Defina `redirect_uri = http://localhost:3000/api/melhor-envio/callback`.
4. Anote `client_id` e `client_secret`.
5. Para acelerar dev: gere um **token pessoal** direto (atalho, sem OAuth) e use em `MELHOR_ENVIO_TOKEN`.

### 4. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` preenchendo:
- `DATABASE_URL` e `DIRECT_URL` (Supabase)
- `AUTH_SECRET` — gere com `openssl rand -base64 32`
- `MELHOR_ENVIO_*` (do passo 3)
- demais credenciais conforme for ativando features

### 5. Instalar dependências

```bash
npm install
```

O `postinstall` roda `prisma generate` automaticamente.

### 6. Migrations + seed

```bash
npm run db:migrate   # cria a primeira migration e aplica
npm run db:seed      # popula com dados realistas
```

Ou, para resetar tudo do zero:

```bash
npm run db:reset     # drop + migrate + seed
```

### 7. Dev server

```bash
npm run dev
```

App roda em <http://localhost:3000>. Prisma Studio (GUI do banco): `npm run db:studio`.

---

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Next.js em modo dev (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:reset` | Drop + migrate + seed |
| `npm run db:seed` | Popula com dados de seed |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:generate` | Regenera o Prisma Client |

---

## Credenciais de desenvolvimento (após seed)

Senha de **todos**: `Kizuna@2026`

- `admin@kizunageek.com.br` — ADMIN
- `staff@kizunageek.com.br` — STAFF
- `yuki@example.com` — CUSTOMER
- `lucas@example.com` — CUSTOMER
- `maria@example.com` — CUSTOMER

---

## Estrutura do projeto

```
.
├── prisma/
│   ├── schema.prisma     # Schema completo (12 enums, 21 modelos)
│   └── seed.ts           # Dados realistas para dev
├── src/
│   ├── app/              # App Router (layout, pages)
│   └── lib/
│       ├── env.ts        # Validação Zod das env vars
│       └── prisma.ts     # Singleton do Prisma Client
├── .env.example          # Template de env vars
└── next.config.ts
```

---

## Próximos passos

A próxima fase implementará:

1. Auth.js v5 com Google OAuth + credenciais
2. Catálogo público (listagem, filtros, busca, detalhe)
3. Carrinho persistente (guests e logados)
4. Checkout com Stripe + Melhor Envio
5. Emissão de NF-e via Focus NFe (com regra especial para pré-vendas)
6. Painel administrativo

絆 — Fundação sólida = laços inquebráveis.
