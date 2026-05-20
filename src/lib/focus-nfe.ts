import "server-only";

/**
 * Cliente Focus NFe — emissão e cancelamento de NF-e.
 *
 * Docs: https://focusnfe.com.br/doc/
 *
 * Stub fallback: se `FOCUS_NFE_TOKEN` não estiver setada, gera resposta mockada
 * que permite testar o fluxo end-to-end sem provider real.
 *
 * Em produção: usa homologação (`FOCUS_NFE_SANDBOX=true`) durante testes,
 * troca pra produção (`=false`) só após validar certificado A1 + dados fiscais.
 */

const TOKEN = process.env.FOCUS_NFE_TOKEN;
const SANDBOX = process.env.FOCUS_NFE_SANDBOX !== "false"; // default true

const BASE_URL = SANDBOX
  ? "https://homologacao.focusnfe.com.br"
  : "https://api.focusnfe.com.br";

export const focusNfeConfigured = !!TOKEN;

// =====================================================================
// TIPOS
// =====================================================================

export interface NfeEmitInput {
  /** Referência única do pedido — idempotência */
  ref: string;
  /** Dados básicos da NF-e */
  natureza_operacao: string;
  data_emissao: string; // ISO
  tipo_documento: "1"; // 1 = saída
  finalidade_emissao: "1"; // 1 = normal
  presenca_comprador: "2"; // 2 = não presencial pela internet

  /** Emitente (a loja) */
  cnpj_emitente: string;
  inscricao_estadual_emitente: string;
  nome_emitente: string;
  nome_fantasia_emitente?: string;
  logradouro_emitente: string;
  numero_emitente: string;
  bairro_emitente: string;
  municipio_emitente: string;
  uf_emitente: string;
  cep_emitente: string;
  regime_tributario_emitente: "1" | "2" | "3"; // 1=Simples, 3=Normal

  /** Destinatário (cliente) */
  nome_destinatario: string;
  cpf_destinatario?: string;
  cnpj_destinatario?: string;
  email_destinatario: string;
  logradouro_destinatario: string;
  numero_destinatario: string;
  complemento_destinatario?: string;
  bairro_destinatario: string;
  municipio_destinatario: string;
  uf_destinatario: string;
  cep_destinatario: string;
  pais_destinatario: string;

  /** Itens */
  items: NfeItem[];

  /** Totais */
  valor_frete?: string;
  valor_desconto?: string;
  valor_seguro?: string;
}

export interface NfeItem {
  numero_item: string;
  codigo_produto: string;
  descricao: string;
  cfop: string; // ex: "5102" (venda dentro do estado)
  unidade_comercial: string; // "UN"
  quantidade_comercial: string;
  valor_unitario_comercial: string;
  valor_bruto: string;
  unidade_tributavel: string;
  quantidade_tributavel: string;
  valor_unitario_tributavel: string;
  ncm: string; // Nomenclatura Comum do Mercosul
  origem: string; // "0" = nacional
  /** ICMS (Simples Nacional) */
  icms_situacao_tributaria?: string;
}

export interface NfeResponse {
  ref: string;
  status: "autorizado" | "processando_autorizacao" | "erro_autorizacao" | "cancelado";
  status_sefaz?: string;
  mensagem_sefaz?: string;
  numero?: string;
  serie?: string;
  chave_nfe?: string;
  caminho_xml_nota_fiscal?: string;
  caminho_danfe?: string;
  url?: string;
}

// =====================================================================
// API
// =====================================================================

class FocusNfeError extends Error {
  constructor(public status: number, public body: unknown, message: string) {
    super(message);
    this.name = "FocusNfeError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  if (!TOKEN) {
    throw new FocusNfeError(0, null, "Focus NFe não configurado.");
  }

  const auth = "Basic " + Buffer.from(`${TOKEN}:`).toString("base64");

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new FocusNfeError(res.status, data, `Focus NFe ${res.status}: ${path}`);
  }

  return data as T;
}

/**
 * Emite uma NF-e. A operação é assíncrona — retorna `processando_autorizacao`
 * inicialmente. O status final vem por webhook OU polling em `getNfe(ref)`.
 *
 * Em modo stub (sem token): retorna response mockada com status `autorizado`.
 */
export async function emitNfe(input: NfeEmitInput): Promise<NfeResponse> {
  if (!focusNfeConfigured) {
    console.info(`[nfe-stub] Would emit NF-e for ref=${input.ref}`);
    return {
      ref: input.ref,
      status: "autorizado",
      numero: "STUB-" + Math.floor(Math.random() * 1000000),
      serie: "1",
      chave_nfe: "0".repeat(44),
      caminho_xml_nota_fiscal: `/stub/nfe-${input.ref}.xml`,
      caminho_danfe: `/stub/nfe-${input.ref}.pdf`,
      mensagem_sefaz: "Stub mode (sem token Focus NFe configurado).",
    };
  }

  return request<NfeResponse>("POST", `/v2/nfe?ref=${input.ref}`, input);
}

/**
 * Consulta o status de uma NF-e pela `ref`.
 */
export async function getNfe(ref: string): Promise<NfeResponse> {
  if (!focusNfeConfigured) {
    return { ref, status: "autorizado", numero: "STUB" };
  }
  return request<NfeResponse>("GET", `/v2/nfe/${ref}`);
}

/**
 * Cancela uma NF-e (regra fiscal: até 24h após autorização).
 */
export async function cancelNfe(
  ref: string,
  justificativa: string,
): Promise<NfeResponse> {
  if (!focusNfeConfigured) {
    return { ref, status: "cancelado", mensagem_sefaz: "Stub cancel." };
  }
  return request<NfeResponse>("DELETE", `/v2/nfe/${ref}`, {
    justificativa,
  });
}

export { FocusNfeError };
