import "server-only";

/**
 * ViaCEP — consulta gratuita de CEPs brasileiros.
 * Sem autenticação, sem rate limit publicado (na prática, ~30 req/min é seguro).
 *
 * Docs: https://viacep.com.br
 */

export interface ViaCepAddress {
  cep: string;
  street: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  ibge: string | null;
}

export type ViaCepResult =
  | { ok: true; address: ViaCepAddress }
  | { ok: false; error: "invalid_format" | "not_found" | "network_error" };

/**
 * Normaliza um CEP — remove tudo que não é dígito.
 */
export function normalizeCep(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Valida formato de CEP (8 dígitos numéricos).
 */
export function isValidCep(raw: string): boolean {
  const digits = normalizeCep(raw);
  return /^\d{8}$/.test(digits);
}

/**
 * Formata um CEP no padrão "00000-000".
 */
export function formatCep(raw: string): string {
  const d = normalizeCep(raw);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : raw;
}

/**
 * Busca um CEP no ViaCEP.
 * Retorna shape normalizado pro nosso domínio.
 */
export async function lookupCep(cep: string): Promise<ViaCepResult> {
  const digits = normalizeCep(cep);
  if (!isValidCep(digits)) {
    return { ok: false, error: "invalid_format" };
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      // CEPs raramente mudam — cachear no edge é seguro
      next: { revalidate: 60 * 60 * 24 * 7 }, // 7 dias
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return { ok: false, error: "network_error" };
    }

    const data = (await res.json()) as {
      cep?: string;
      logradouro?: string;
      complemento?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      ibge?: string;
      erro?: boolean;
    };

    if (data.erro) {
      return { ok: false, error: "not_found" };
    }

    return {
      ok: true,
      address: {
        cep: digits,
        street: data.logradouro?.trim() ?? "",
        complement: data.complemento?.trim() || null,
        neighborhood: data.bairro?.trim() ?? "",
        city: data.localidade?.trim() ?? "",
        state: data.uf?.trim() ?? "",
        ibge: data.ibge ?? null,
      },
    };
  } catch {
    return { ok: false, error: "network_error" };
  }
}
