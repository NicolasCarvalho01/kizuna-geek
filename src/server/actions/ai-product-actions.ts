"use server";

import { auth } from "@/auth";
import type { ActionResult } from "@/server/actions/auth-actions";

/**
 * AI helper pra gerar copy de produto (descrição, tags, SEO).
 *
 * Usa Google Gemini API (modelo Flash) via REST direta — sem SDK pra
 * ficar leve. **GRATUITO** no free tier: 15 requests/min, 1500/dia.
 * Suficiente pra cadastro normal de catálogo (~50-100 produtos/dia
 * é tranquilo).
 *
 * Pra ativar:
 *  1. Cria conta em https://aistudio.google.com (Google, free)
 *  2. Gera API key em https://aistudio.google.com/apikey
 *  3. Adiciona `GEMINI_API_KEY` no Vercel + redeploy
 *
 * Sem a key configurada, retorna fallback genérico decente (sem AI).
 */

const GEMINI_MODEL = "gemini-2.5-flash"; // free tier, rápido, qualidade boa
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface AiProductCopyInput {
  name: string;
  brand?: string | null;
  franchise?: string | null;
  productType:
    | "ACTION_FIGURE"
    | "COLLECTIBLE"
    | "TCG_SINGLE"
    | "TCG_SEALED"
    | "OTHER";
  /** Categoria pai pra contexto (ex: "Action Figures · Anime") */
  category?: string | null;
  /** Notas extras opcionais — ex: "vem com 3 acessórios, lançamento exclusivo BR" */
  notes?: string | null;
}

export interface AiProductCopy {
  shortDescription: string;
  description: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Não autenticado." };
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return { ok: false as const, error: "Acesso negado." };
  }
  return { ok: true as const };
}

export async function generateProductCopy(
  input: AiProductCopyInput,
): Promise<ActionResult<AiProductCopy>> {
  const guard = await assertAdmin();
  if (!guard.ok) return guard;

  // Aceita GEMINI_API_KEY ou GOOGLE_API_KEY (Google usa os dois)
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    // Sem API key: retorna fallback decente (não bloqueia o admin)
    return {
      ok: true,
      data: buildFallbackCopy(input),
    };
  }

  const prompt = buildPrompt(input);

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1500,
          // Força resposta em JSON estruturado — economiza parse manual
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[ai-product] Gemini error:", res.status, errorBody);
      // Não falha o admin — devolve fallback
      return { ok: true, data: buildFallbackCopy(input) };
    }

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text =
      json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const parsed = parseAiResponse(text);
    if (!parsed) {
      console.warn("[ai-product] failed to parse:", text.slice(0, 200));
      return { ok: true, data: buildFallbackCopy(input) };
    }

    return { ok: true, data: parsed };
  } catch (err) {
    console.error("[ai-product] unexpected:", err);
    return { ok: true, data: buildFallbackCopy(input) };
  }
}

// ===========================================================================
// PROMPT ENGINEERING
// ===========================================================================

function buildPrompt(input: AiProductCopyInput): string {
  const typeLabels = {
    ACTION_FIGURE: "action figure / boneco articulado colecionável",
    COLLECTIBLE: "colecionável (Funko Pop, estatueta, etc.)",
    TCG_SINGLE: "carta avulsa de Trading Card Game (TCG)",
    TCG_SEALED: "produto lacrado de TCG (booster pack, box, ETB)",
    OTHER: "produto de cultura pop / colecionável",
  };

  return `Você é o copywriter da Kizuna Geek, uma loja boutique brasileira de Action Figures, Colecionáveis e TCG em Itapetininga/SP. Voz da marca: editorial, descontraída, conhecedora — fala com colecionador que sabe do assunto, sem ser pedante. Português brasileiro coloquial mas culto.

Gere copy pra este produto:

- **Nome:** ${input.name}
- **Tipo:** ${typeLabels[input.productType]}
${input.brand ? `- **Marca:** ${input.brand}` : ""}
${input.franchise ? `- **Franquia:** ${input.franchise}` : ""}
${input.category ? `- **Categoria:** ${input.category}` : ""}
${input.notes ? `- **Notas extras:** ${input.notes}` : ""}

Responda EXATAMENTE neste formato JSON, sem markdown, sem texto antes ou depois:

{
  "shortDescription": "Uma frase de até 140 caracteres pro card do catálogo. Tom direto, sem clichê tipo 'incrível', 'imperdível', 'lindo'.",
  "description": "Descrição completa em 2-3 parágrafos curtos. Inclua: contexto da personagem/série (1 frase), o que essa peça tem de especial (escala, articulação, acessórios, pose característica), e por que vale guardar (raridade, qualidade da licença, lançamento). Sem repetir o nome do produto. Sem chamar de 'produto'. Use 'a peça', 'a figure', 'a estatueta', 'a carta', conforme o tipo.",
  "tags": ["3-7 tags em slug-com-hifens, lowercase, sem acentos, focadas em busca: franquia, personagem, série, gênero, estilo, edição. Exemplo: ['naruto', 'shippuden', 'anime', 'action-figure']"],
  "metaTitle": "Título SEO até 60 chars. Inclui produto + marca/franquia + 'Kizuna Geek'.",
  "metaDescription": "Meta description SEO até 155 chars. Convida ao clique sem clickbait. Inclui benefício (frete, parcelamento, etc) só se sobrar espaço."
}

Regras:
- NÃO use emojis no description ou shortDescription
- NÃO use ponto de exclamação seguido — máximo 1 por copy
- NÃO escreva "Adquira já!", "Não perca!" ou clichês de varejo
- Mantenha o tom de gente que coleciona — não de vendedor pressionando
- Português brasileiro
- Se faltar info crítica, faça inferência razoável; NÃO invente acessórios específicos que você não tem certeza`;
}

function parseAiResponse(text: string): AiProductCopy | null {
  try {
    // Extrai o primeiro objeto JSON do texto (caso a IA tenha posto texto extra)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<AiProductCopy>;
    if (
      typeof parsed.shortDescription === "string" &&
      typeof parsed.description === "string" &&
      Array.isArray(parsed.tags) &&
      typeof parsed.metaTitle === "string" &&
      typeof parsed.metaDescription === "string"
    ) {
      return {
        shortDescription: parsed.shortDescription.slice(0, 500),
        description: parsed.description,
        tags: parsed.tags
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.toLowerCase().trim())
          .filter(Boolean)
          .slice(0, 10),
        metaTitle: parsed.metaTitle.slice(0, 200),
        metaDescription: parsed.metaDescription.slice(0, 500),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ===========================================================================
// FALLBACK (sem API key)
// ===========================================================================

function buildFallbackCopy(input: AiProductCopyInput): AiProductCopy {
  const typeWord = {
    ACTION_FIGURE: "action figure",
    COLLECTIBLE: "colecionável",
    TCG_SINGLE: "carta",
    TCG_SEALED: "produto",
    OTHER: "peça",
  }[input.productType];

  const franchisePart = input.franchise ? ` de ${input.franchise}` : "";
  const brandPart = input.brand ? ` ${input.brand}` : "";

  const shortDescription =
    `${input.name}${franchisePart} — ${typeWord}${brandPart} oficial.`.slice(0, 140);

  const description =
    `${input.name}${franchisePart}. ${typeWord.charAt(0).toUpperCase() + typeWord.slice(1)}${brandPart} oficial, com qualidade e licenciamento confirmados.

Pra mais detalhes específicos desta peça, fala com a gente pelo formulário de contato — temos sempre fotos atualizadas e podemos enviar antes da compra.`;

  const tags = [
    input.brand?.toLowerCase().replace(/\s+/g, "-"),
    input.franchise?.toLowerCase().replace(/\s+/g, "-"),
    input.productType.toLowerCase().replace(/_/g, "-"),
  ].filter((t): t is string => Boolean(t));

  const metaTitle = `${input.name}${brandPart}`.slice(0, 60);
  const metaDescription =
    `${input.name}${franchisePart} ${brandPart} disponível na Kizuna Geek. Curadoria boutique de colecionáveis em Itapetininga/SP.`.slice(
      0,
      155,
    );

  return {
    shortDescription,
    description,
    tags,
    metaTitle,
    metaDescription,
  };
}
