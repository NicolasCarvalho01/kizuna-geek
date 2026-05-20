import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase pra Storage (uploads de imagens de produto).
 *
 * Usa o `service_role` key — server-only. Permissões totais; a action de
 * upload faz o guard de admin antes de chamar.
 *
 * Bucket esperado:
 *   - Nome: `products` (público)
 *   - Cache-Control: public, max-age=31536000, immutable
 *
 * Como criar o bucket (Supabase Dashboard → Storage):
 *   1. New bucket → name: products, public: ON
 *   2. Policies: insert/update/delete só com service_role (default)
 *   3. RLS pode ficar OFF — a key service_role bypassa RLS
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseStorageConfigured = !!(URL && SERVICE_KEY);

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!URL || !SERVICE_KEY) {
    throw new Error(
      "Supabase Storage não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local",
    );
  }
  if (!_client) {
    _client = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export const PRODUCTS_BUCKET = "products";

export interface UploadResult {
  path: string; // ex: "produtos/2026/abc123-uuid.webp"
  url: string; // URL pública pronta pra <Image>
}

const ALLOWED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Faz upload de uma imagem pro bucket `products`. Gera filename único.
 * Retorna a URL pública pronta pra usar em <Image src=...>.
 */
export async function uploadProductImage(
  file: File,
  opts: { folder?: string } = {},
): Promise<UploadResult> {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error(
      `Tipo de arquivo não suportado: ${file.type || "desconhecido"}. Use JPG, PNG, WebP, AVIF ou GIF.`,
    );
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new Error(`Arquivo grande demais (${mb} MB). Máximo: 8 MB.`);
  }

  const client = getClient();
  const folder = opts.folder ?? "produtos";

  // Filename único — evita colisões e cache-busting trivial
  const ext = guessExtension(file.type, file.name);
  const year = new Date().getFullYear();
  const uuid = crypto.randomUUID();
  const path = `${folder}/${year}/${uuid}.${ext}`;

  const buffer = await file.arrayBuffer();

  const { error } = await client.storage
    .from(PRODUCTS_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000, immutable",
      upsert: false,
    });

  if (error) {
    throw new Error(`Falha no upload: ${error.message}`);
  }

  const { data } = client.storage.from(PRODUCTS_BUCKET).getPublicUrl(path);

  return { path, url: data.publicUrl };
}

/**
 * Deleta uma imagem do bucket. Útil quando remove a foto do produto.
 * Tenta extrair o path da URL pública se receber URL completa.
 */
export async function deleteProductImage(pathOrUrl: string): Promise<void> {
  const client = getClient();
  const path = pathOrUrl.includes("/storage/v1/object/public/")
    ? pathOrUrl.split(`/storage/v1/object/public/${PRODUCTS_BUCKET}/`)[1]
    : pathOrUrl;

  if (!path) return;

  const { error } = await client.storage.from(PRODUCTS_BUCKET).remove([path]);
  if (error) {
    // Não joga — delete é fire-and-forget normalmente
    console.warn(`[storage] delete failed for ${path}:`, error.message);
  }
}

function guessExtension(mime: string, filename: string): string {
  const fromMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  if (fromMime[mime]) return fromMime[mime];
  const dot = filename.lastIndexOf(".");
  if (dot >= 0) return filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
  return "bin";
}
