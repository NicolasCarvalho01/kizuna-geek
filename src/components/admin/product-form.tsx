"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageDropzone } from "@/components/admin/image-dropzone";
import {
  createProduct,
  updateProduct,
} from "@/server/actions/admin-product-actions";
import { generateProductCopy } from "@/server/actions/ai-product-actions";
import {
  PRODUCT_TEMPLATES,
  getTemplateById,
  getTemplatesByGroup,
} from "@/lib/product-templates";
import { cn } from "@/lib/utils";
import type { ProductType, ProductStatus, CategoryType } from "@prisma/client";

interface VariantFormData {
  id?: string;
  sku: string;
  name: string;
  priceOverride: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl: string | null;
  tcgLanguage: string | null;
  tcgCondition: string | null;
  tcgEdition: string | null;
  tcgRarity: string | null;
  tcgIsFoil: boolean | null;
  tcgCardNumber: string | null;
  figureHasBox: boolean | null;
  figureBoxCondition: string | null;
  figureScale: string | null;
  figureManufacturer: string | null;
}

interface ProductFormValues {
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  productType: ProductType;
  brand: string;
  franchise: string;
  basePrice: number;
  compareAtPrice: number | null;
  cost: number | null;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  status: ProductStatus;
  featured: boolean;
  isPreOrder: boolean;
  releaseDate: string;
  preOrderEndsAt: string;
  metaTitle: string;
  metaDescription: string;
  imageUrls: string[];
  tagIds: string[];
  variants: VariantFormData[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  categories: Array<{ id: string; name: string; type: CategoryType; parentId: string | null }>;
  tags: Array<{ id: string; name: string }>;
  initialValues?: ProductFormValues;
}

const TCG_LANGUAGES = ["PT", "EN", "JP", "ES", "KR", "CN", "FR", "DE", "IT"];
const TCG_CONDITIONS = ["MINT", "NEAR_MINT", "LIGHTLY_PLAYED", "MODERATELY_PLAYED", "HEAVILY_PLAYED", "DAMAGED"];
const FIGURE_BOX_CONDITIONS = ["MINT", "GOOD", "FAIR", "DAMAGED", "NO_BOX"];

const emptyVariant: VariantFormData = {
  sku: "",
  name: "Padrão",
  priceOverride: null,
  stock: 0,
  lowStockThreshold: 5,
  isActive: true,
  imageUrl: null,
  tcgLanguage: null,
  tcgCondition: null,
  tcgEdition: null,
  tcgRarity: null,
  tcgIsFoil: null,
  tcgCardNumber: null,
  figureHasBox: null,
  figureBoxCondition: null,
  figureScale: null,
  figureManufacturer: null,
};

const defaultValues: ProductFormValues = {
  slug: "",
  sku: "",
  name: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  productType: "COLLECTIBLE",
  brand: "",
  franchise: "",
  basePrice: 0,
  compareAtPrice: null,
  cost: null,
  weight: 300,
  dimensions: { length: 15, width: 15, height: 10 },
  status: "DRAFT",
  featured: false,
  isPreOrder: false,
  releaseDate: "",
  preOrderEndsAt: "",
  metaTitle: "",
  metaDescription: "",
  imageUrls: [],
  tagIds: [],
  variants: [{ ...emptyVariant }],
};

export function ProductForm({
  mode,
  productId,
  categories,
  tags,
  initialValues,
}: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = React.useState<ProductFormValues>(
    initialValues ?? defaultValues,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, startSubmit] = React.useTransition();

  const isTcg =
    values.productType === "TCG_SINGLE" || values.productType === "TCG_SEALED";
  const isFigure =
    values.productType === "ACTION_FIGURE" || values.productType === "COLLECTIBLE";

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function updateVariant(idx: number, partial: Partial<VariantFormData>) {
    setValues((v) => ({
      ...v,
      variants: v.variants.map((variant, i) =>
        i === idx ? { ...variant, ...partial } : variant,
      ),
    }));
  }

  function addVariant() {
    setValues((v) => ({
      ...v,
      variants: [...v.variants, { ...emptyVariant, name: `Variante ${v.variants.length + 1}` }],
    }));
  }

  function removeVariant(idx: number) {
    if (values.variants.length === 1) {
      setError("Pelo menos uma variante é obrigatória.");
      return;
    }
    setValues((v) => ({
      ...v,
      variants: v.variants.filter((_, i) => i !== idx),
    }));
  }

  function toggleTag(tagId: string) {
    setValues((v) => ({
      ...v,
      tagIds: v.tagIds.includes(tagId)
        ? v.tagIds.filter((id) => id !== tagId)
        : [...v.tagIds, tagId],
    }));
  }

  function addImageUrl(url: string) {
    if (!url.trim()) return;
    setValues((v) => ({ ...v, imageUrls: [...v.imageUrls, url.trim()] }));
  }

  function removeImageUrl(idx: number) {
    setValues((v) => ({
      ...v,
      imageUrls: v.imageUrls.filter((_, i) => i !== idx),
    }));
  }

  function moveImageUrl(idx: number, direction: "up" | "down") {
    setValues((v) => {
      const next = [...v.imageUrls];
      const to = direction === "up" ? idx - 1 : idx + 1;
      if (to < 0 || to >= next.length) return v;
      const [item] = next.splice(idx, 1);
      if (item) next.splice(to, 0, item);
      return { ...v, imageUrls: next };
    });
  }

  // ===================================================================
  // ATALHOS — templates por tipo + IA pra descrição
  // ===================================================================

  const [aiGenerating, startAiGeneration] = React.useTransition();
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [appliedTemplate, setAppliedTemplate] = React.useState<string>("");

  function applyTemplate(templateId: string) {
    const tpl = getTemplateById(templateId);
    if (!tpl) return;
    setAppliedTemplate(templateId);
    setError(null);

    setValues((v) => {
      // Mescla tags do template com as já selecionadas (sem duplicar)
      // Tags sugeridas SÓ entram se já existem cadastradas — admin pode
      // criar tags faltantes em /admin/tags depois.
      const suggestedTagIds = (tpl.suggestedTags ?? [])
        .map((slug) =>
          tags.find((t) => t.name.toLowerCase() === slug.toLowerCase())?.id,
        )
        .filter((id): id is string => Boolean(id));
      const mergedTagIds = Array.from(new Set([...v.tagIds, ...suggestedTagIds]));

      // Aplica defaults da variante na primeira variante (mantém as outras)
      const updatedVariants = v.variants.map((variant, idx) =>
        idx === 0 && tpl.variantDefaults
          ? {
              ...variant,
              figureManufacturer:
                tpl.variantDefaults.figureManufacturer ??
                variant.figureManufacturer,
              figureScale:
                tpl.variantDefaults.figureScale ?? variant.figureScale,
              figureHasBox:
                tpl.variantDefaults.figureHasBox ?? variant.figureHasBox,
              figureBoxCondition:
                tpl.variantDefaults.figureBoxCondition ?? variant.figureBoxCondition,
              tcgLanguage:
                tpl.variantDefaults.tcgLanguage ?? variant.tcgLanguage,
              tcgCondition:
                tpl.variantDefaults.tcgCondition ?? variant.tcgCondition,
              tcgIsFoil:
                tpl.variantDefaults.tcgIsFoil ?? variant.tcgIsFoil,
            }
          : variant,
      );

      return {
        ...v,
        productType: tpl.productType,
        brand: tpl.brand ?? v.brand,
        weight: tpl.weight,
        dimensions: tpl.dimensions,
        tagIds: mergedTagIds,
        variants: updatedVariants,
      };
    });
  }

  async function generateAiCopy() {
    if (!values.name.trim()) {
      setAiError("Informe o nome do produto antes de gerar.");
      return;
    }
    setAiError(null);

    const categoryName = categories.find((c) => c.id === values.categoryId)?.name;

    startAiGeneration(async () => {
      const res = await generateProductCopy({
        name: values.name,
        brand: values.brand || undefined,
        franchise: values.franchise || undefined,
        productType: values.productType,
        category: categoryName,
      });

      if (!res.ok || !res.data) {
        setAiError(res.error ?? "Erro ao gerar copy.");
        return;
      }

      // Sobrescreve sempre — usuário pediu pra gerar
      setValues((v) => ({
        ...v,
        shortDescription: res.data!.shortDescription,
        description: res.data!.description,
        metaTitle: res.data!.metaTitle || v.metaTitle,
        metaDescription: res.data!.metaDescription || v.metaDescription,
        // Tags: adiciona as sugeridas se existirem cadastradas
        tagIds: Array.from(
          new Set([
            ...v.tagIds,
            ...res.data!.tags
              .map((slug) =>
                tags.find((t) => t.name.toLowerCase() === slug.toLowerCase())?.id,
              )
              .filter((id): id is string => Boolean(id)),
          ]),
        ),
      }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validações simples client-side
    if (!values.name.trim()) {
      setError("Nome obrigatório.");
      return;
    }
    if (!values.slug.trim() || !/^[a-z0-9-]+$/.test(values.slug)) {
      setError("Slug obrigatório (letras minúsculas, números, hífens).");
      return;
    }
    if (!values.sku.trim()) {
      setError("SKU obrigatório.");
      return;
    }
    if (values.basePrice <= 0) {
      setError("Preço base deve ser positivo.");
      return;
    }
    if (values.weight <= 0) {
      setError("Peso (em gramas) deve ser positivo.");
      return;
    }
    if (values.variants.length === 0) {
      setError("Pelo menos uma variante é obrigatória.");
      return;
    }
    for (const v of values.variants) {
      if (!v.sku.trim()) {
        setError("Todas as variantes precisam de SKU.");
        return;
      }
    }

    startSubmit(async () => {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(values));

      const res = mode === "create"
        ? await createProduct(null, fd)
        : await updateProduct(productId!, null, fd);

      if (!res.ok) {
        setError(res.error ?? "Erro ao salvar.");
        return;
      }

      if (mode === "create" && res.data) {
        router.push(`/admin/produtos/${(res.data as { id: string }).id}`);
      } else {
        router.refresh();
      }
    });
  }

  // Slug auto-suggestion
  function suggestSlug() {
    if (values.slug) return;
    const slug = values.name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (slug) update("slug", slug);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Atalhos — templates + IA */}
      {mode === "create" && (
        <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-gold)]/30 bg-[color:var(--color-gold)]/5 p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles
              className="h-4 w-4 text-[color:var(--color-gold)]"
              strokeWidth={1.5}
            />
            <h3 className="font-[var(--font-display)] text-[1.0625rem] text-[color:var(--color-fg)]">
              Atalhos pra acelerar
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template */}
            <div>
              <label className="eyebrow mb-2 block">
                1 · Aplicar template
              </label>
              <select
                value={appliedTemplate}
                onChange={(e) => {
                  if (e.target.value) applyTemplate(e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)] bg-transparent text-[0.875rem] focus:outline-none focus:border-[color:var(--color-gold)]"
              >
                <option value="">
                  Selecione um tipo de produto…
                </option>
                {getTemplatesByGroup().map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-2 text-[0.75rem] text-[color:var(--color-fg-soft)] leading-snug">
                Pré-preenche tipo, marca, peso, dimensões e tags sugeridas.
                Você ajusta o que for diferente.
              </p>
            </div>

            {/* IA */}
            <div>
              <label className="eyebrow mb-2 block">
                2 · Gerar descrição com IA
              </label>
              <Button
                type="button"
                onClick={generateAiCopy}
                disabled={aiGenerating || !values.name.trim()}
                variant="outline"
                className="w-full"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    Gerando…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" strokeWidth={1.5} />
                    Gerar copy completa
                  </>
                )}
              </Button>
              <p className="mt-2 text-[0.75rem] text-[color:var(--color-fg-soft)] leading-snug">
                Preenche shortDescription, description, tags e meta SEO.
                Precisa de nome (e idealmente franquia/marca) preenchidos.
              </p>
              {aiError && (
                <p
                  role="alert"
                  className="mt-2 text-[var(--text-caption)] text-[color:var(--color-vermilion)]"
                >
                  {aiError}
                </p>
              )}
            </div>
          </div>

          {appliedTemplate && (
            <p className="mt-4 inline-flex items-center gap-2 text-[0.8125rem] text-[color:var(--color-gold)]">
              <Check className="h-3 w-3" strokeWidth={2} />
              Template &ldquo;
              {PRODUCT_TEMPLATES.find((t) => t.id === appliedTemplate)?.label}
              &rdquo; aplicado
            </p>
          )}
        </section>
      )}

      {/* Identidade */}
      <Section title="Identidade">
        <FieldGrid>
          <Field label="Nome*" className="col-span-12 md:col-span-8">
            <Input
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={suggestSlug}
              placeholder="Nendoroid Naruto Uzumaki"
              required
            />
          </Field>
          <Field label="Status" className="col-span-12 md:col-span-4">
            <Select
              value={values.status}
              onChange={(v) => update("status", v as ProductStatus)}
              options={[
                { value: "DRAFT", label: "Rascunho" },
                { value: "ACTIVE", label: "Ativo (publicado)" },
                { value: "ARCHIVED", label: "Arquivado" },
              ]}
            />
          </Field>

          <Field label="Slug* (URL)" hint="Letras minúsculas, números e hífens" className="col-span-12 md:col-span-6">
            <Input
              value={values.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase())}
              placeholder="nendoroid-naruto-uzumaki"
              required
            />
          </Field>
          <Field label="SKU pai*" className="col-span-12 md:col-span-6">
            <Input
              value={values.sku}
              onChange={(e) => update("sku", e.target.value)}
              placeholder="NEN-NARUTO-001"
              required
            />
          </Field>

          <Field label="Descrição curta" className="col-span-12">
            <Input
              value={values.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              placeholder="Aparece nos cards de catálogo"
              maxLength={500}
            />
          </Field>

          <Field
            label="Descrição completa"
            hint="HTML renderizado na página do produto. Formatação: títulos, listas, citações e links."
            className="col-span-12"
          >
            <RichTextEditor
              value={values.description}
              onChange={(html) => update("description", html)}
              placeholder="Conte a história do produto — origem, raridade, condição, escala, série…"
            />
          </Field>
        </FieldGrid>
      </Section>

      {/* Categorização */}
      <Section title="Categorização">
        <FieldGrid>
          <Field label="Tipo*" className="col-span-12 md:col-span-4">
            <Select
              value={values.productType}
              onChange={(v) => update("productType", v as ProductType)}
              options={[
                { value: "ACTION_FIGURE", label: "Action Figure" },
                { value: "TCG_SINGLE", label: "TCG Single (carta avulsa)" },
                { value: "TCG_SEALED", label: "TCG Selado (booster/box)" },
                { value: "COLLECTIBLE", label: "Colecionável" },
                { value: "OTHER", label: "Outros" },
              ]}
            />
          </Field>
          <Field label="Categoria*" className="col-span-12 md:col-span-8">
            <Select
              value={values.categoryId}
              onChange={(v) => update("categoryId", v)}
              options={categories.map((c) => ({
                value: c.id,
                label: c.parentId ? `   ↳ ${c.name}` : c.name,
              }))}
              placeholder="Selecione..."
            />
          </Field>

          <Field label="Marca / Fabricante" className="col-span-12 md:col-span-6">
            <Input
              value={values.brand}
              onChange={(e) => update("brand", e.target.value)}
              placeholder="Good Smile Company, Bandai, Konami..."
            />
          </Field>
          <Field label="Franquia / IP" className="col-span-12 md:col-span-6">
            <Input
              value={values.franchise}
              onChange={(e) => update("franchise", e.target.value)}
              placeholder="Naruto, Pokémon, One Piece..."
            />
          </Field>

          <Field label="Tags" hint="Selecione as que se aplicam" className="col-span-12">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const active = values.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "px-3 py-1.5 text-[0.8125rem] rounded-[var(--radius-pill)] border transition-all",
                      active
                        ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/10 text-[color:var(--color-gold)]"
                        : "border-[color:var(--color-border)] text-[color:var(--color-fg-soft)] hover:border-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)]",
                    )}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </Field>
        </FieldGrid>
      </Section>

      {/* Preço */}
      <Section title="Preço & estoque">
        <FieldGrid>
          <Field label="Preço base* (R$)" className="col-span-12 md:col-span-4">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={values.basePrice}
              onChange={(e) => update("basePrice", Number(e.target.value))}
              required
            />
          </Field>
          <Field label='Preço "de" (riscado)' className="col-span-12 md:col-span-4">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={values.compareAtPrice ?? ""}
              onChange={(e) =>
                update("compareAtPrice", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Opcional"
            />
          </Field>
          <Field label="Custo (visível só p/ admin)" className="col-span-12 md:col-span-4">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={values.cost ?? ""}
              onChange={(e) =>
                update("cost", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Opcional"
            />
          </Field>

          <Field label="Peso* (gramas)" hint="Crítico pro Melhor Envio" className="col-span-12 md:col-span-3">
            <Input
              type="number"
              min="1"
              value={values.weight}
              onChange={(e) => update("weight", Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Comprimento (cm)" className="col-span-4 md:col-span-3">
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={values.dimensions.length}
              onChange={(e) =>
                update("dimensions", {
                  ...values.dimensions,
                  length: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Largura (cm)" className="col-span-4 md:col-span-3">
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={values.dimensions.width}
              onChange={(e) =>
                update("dimensions", {
                  ...values.dimensions,
                  width: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Altura (cm)" className="col-span-4 md:col-span-3">
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={values.dimensions.height}
              onChange={(e) =>
                update("dimensions", {
                  ...values.dimensions,
                  height: Number(e.target.value),
                })
              }
            />
          </Field>
        </FieldGrid>
      </Section>

      {/* Pré-venda */}
      <Section title="Pré-venda">
        <FieldGrid>
          <Field label="" className="col-span-12">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.isPreOrder}
                onChange={(e) => update("isPreOrder", e.target.checked)}
                className="h-4 w-4 accent-[color:var(--color-gold)]"
              />
              <span className="text-[0.9375rem]">Este produto é pré-venda</span>
            </label>
          </Field>

          {values.isPreOrder && (
            <>
              <Field label="Data prevista de lançamento" className="col-span-12 md:col-span-6">
                <Input
                  type="date"
                  value={values.releaseDate}
                  onChange={(e) => update("releaseDate", e.target.value)}
                />
              </Field>
              <Field label="Pré-venda encerra em" className="col-span-12 md:col-span-6">
                <Input
                  type="date"
                  value={values.preOrderEndsAt}
                  onChange={(e) => update("preOrderEndsAt", e.target.value)}
                />
              </Field>
            </>
          )}

          <Field label="" className="col-span-12">
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 accent-[color:var(--color-gold)]"
              />
              <span className="text-[0.9375rem]">Destacar na home (Featured)</span>
            </label>
          </Field>
        </FieldGrid>
      </Section>

      {/* Imagens */}
      <Section title={`Imagens (${values.imageUrls.length})`}>
        <ImageDropzone
          urls={values.imageUrls}
          onAdd={addImageUrl}
          onRemove={removeImageUrl}
          onMove={moveImageUrl}
        />
      </Section>

      {/* Variantes */}
      <Section
        title={`Variantes (${values.variants.length})`}
        action={
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Adicionar variante
          </Button>
        }
      >
        <div className="space-y-4">
          {values.variants.map((variant, idx) => (
            <VariantBlock
              key={idx}
              index={idx}
              variant={variant}
              isTcg={isTcg}
              isFigure={isFigure}
              onChange={(p) => updateVariant(idx, p)}
              onRemove={() => removeVariant(idx)}
              canRemove={values.variants.length > 1}
            />
          ))}
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <FieldGrid>
          <Field label="Meta title" className="col-span-12">
            <Input
              value={values.metaTitle}
              onChange={(e) => update("metaTitle", e.target.value)}
              placeholder="Padrão: Nome do produto"
              maxLength={200}
            />
          </Field>
          <Field label="Meta description" className="col-span-12">
            <textarea
              value={values.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-transparent text-[0.9375rem] resize-y focus:outline-none focus:border-[color:var(--color-gold)]"
            />
          </Field>
        </FieldGrid>
      </Section>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 bg-[color:var(--color-bg)]/95 backdrop-blur border-t border-[color:var(--color-hairline)] flex items-center justify-between gap-3 z-10">
        {error ? (
          <p
            role="alert"
            className="text-[var(--text-caption)] text-[color:var(--color-vermilion)]"
          >
            {error}
          </p>
        ) : (
          <p className="eyebrow">
            {mode === "create" ? "Novo produto" : "Editando produto"}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                Salvando…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" strokeWidth={1.5} />
                {mode === "create" ? "Criar produto" : "Salvar alterações"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// =====================================================================
// SUB-COMPONENTES
// =====================================================================

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-[var(--font-display)] text-[1.25rem] leading-none">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-12 gap-4">{children}</div>;
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && <span className="eyebrow">{label}</span>}
      {children}
      {hint && (
        <span className="text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
          {hint}
        </span>
      )}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 pr-10 rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-transparent text-[0.9375rem] appearance-none focus:outline-none focus:border-[color:var(--color-gold)]"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60 pointer-events-none"
        strokeWidth={1.5}
      />
    </div>
  );
}

function VariantBlock({
  index,
  variant,
  isTcg,
  isFigure,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  variant: VariantFormData;
  isTcg: boolean;
  isFigure: boolean;
  onChange: (p: Partial<VariantFormData>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-hairline)] p-4 lg:p-5 bg-[color:var(--color-bg)]">
      <div className="flex items-center justify-between mb-4">
        <p className="font-[var(--font-mono)] text-[0.75rem] uppercase tracking-[var(--tracking-eyebrow)] text-[color:var(--color-gold)]">
          Variante {String(index + 1).padStart(2, "0")}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remover variante"
            className="text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-vermilion)] transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <FieldGrid>
        <Field label="Nome*" className="col-span-12 md:col-span-6">
          <Input
            value={variant.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Padrão, Com caixa..."
            required
          />
        </Field>
        <Field label="SKU*" className="col-span-12 md:col-span-6">
          <Input
            value={variant.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
            placeholder="SKU único"
            required
          />
        </Field>

        <Field label="Preço (override)" hint="Vazio = usa preço base do produto" className="col-span-6 md:col-span-3">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={variant.priceOverride ?? ""}
            onChange={(e) =>
              onChange({
                priceOverride: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </Field>
        <Field label="Estoque*" className="col-span-6 md:col-span-3">
          <Input
            type="number"
            min="0"
            value={variant.stock}
            onChange={(e) => onChange({ stock: Number(e.target.value) })}
            required
          />
        </Field>
        <Field label="Alerta de baixo estoque" className="col-span-6 md:col-span-3">
          <Input
            type="number"
            min="0"
            value={variant.lowStockThreshold}
            onChange={(e) => onChange({ lowStockThreshold: Number(e.target.value) })}
          />
        </Field>
        <Field label="Ativa?" className="col-span-6 md:col-span-3">
          <label className="inline-flex items-center gap-2 h-11">
            <input
              type="checkbox"
              checked={variant.isActive}
              onChange={(e) => onChange({ isActive: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--color-gold)]"
            />
            <span className="text-[0.875rem]">Visível na loja</span>
          </label>
        </Field>

        <Field label="URL da imagem específica" hint="Opcional — sobrescreve imagem principal nesta variante" className="col-span-12">
          <Input
            type="url"
            value={variant.imageUrl ?? ""}
            onChange={(e) => onChange({ imageUrl: e.target.value || null })}
            placeholder="Opcional"
          />
        </Field>

        {/* TCG fields */}
        {isTcg && (
          <>
            <Field label="Idioma" className="col-span-6 md:col-span-3">
              <Select
                value={variant.tcgLanguage ?? ""}
                onChange={(v) => onChange({ tcgLanguage: v || null })}
                options={[
                  { value: "", label: "—" },
                  ...TCG_LANGUAGES.map((l) => ({ value: l, label: l })),
                ]}
              />
            </Field>
            <Field label="Condição" className="col-span-6 md:col-span-3">
              <Select
                value={variant.tcgCondition ?? ""}
                onChange={(v) => onChange({ tcgCondition: v || null })}
                options={[
                  { value: "", label: "—" },
                  ...TCG_CONDITIONS.map((c) => ({ value: c, label: c.replace(/_/g, " ") })),
                ]}
              />
            </Field>
            <Field label="Set / Edição" className="col-span-6 md:col-span-3">
              <Input
                value={variant.tcgEdition ?? ""}
                onChange={(e) => onChange({ tcgEdition: e.target.value || null })}
                placeholder="Base Set, Alpha..."
              />
            </Field>
            <Field label="Raridade" className="col-span-6 md:col-span-3">
              <Input
                value={variant.tcgRarity ?? ""}
                onChange={(e) => onChange({ tcgRarity: e.target.value || null })}
                placeholder="Holo Rare, Common..."
              />
            </Field>
            <Field label="Foil?" className="col-span-6 md:col-span-3">
              <label className="inline-flex items-center gap-2 h-11">
                <input
                  type="checkbox"
                  checked={variant.tcgIsFoil ?? false}
                  onChange={(e) => onChange({ tcgIsFoil: e.target.checked })}
                  className="h-4 w-4 accent-[color:var(--color-gold)]"
                />
                <span className="text-[0.875rem]">Foil</span>
              </label>
            </Field>
            <Field label="Número da carta" className="col-span-6 md:col-span-3">
              <Input
                value={variant.tcgCardNumber ?? ""}
                onChange={(e) => onChange({ tcgCardNumber: e.target.value || null })}
                placeholder="025/198"
              />
            </Field>
          </>
        )}

        {/* Figure fields */}
        {isFigure && (
          <>
            <Field label="Tem caixa?" className="col-span-6 md:col-span-3">
              <Select
                value={variant.figureHasBox === null ? "" : variant.figureHasBox ? "true" : "false"}
                onChange={(v) =>
                  onChange({
                    figureHasBox: v === "" ? null : v === "true",
                  })
                }
                options={[
                  { value: "", label: "—" },
                  { value: "true", label: "Com caixa" },
                  { value: "false", label: "Loose (sem caixa)" },
                ]}
              />
            </Field>
            <Field label="Condição da caixa" className="col-span-6 md:col-span-3">
              <Select
                value={variant.figureBoxCondition ?? ""}
                onChange={(v) => onChange({ figureBoxCondition: v || null })}
                options={[
                  { value: "", label: "—" },
                  ...FIGURE_BOX_CONDITIONS.map((c) => ({
                    value: c,
                    label: c.replace(/_/g, " "),
                  })),
                ]}
              />
            </Field>
            <Field label="Escala" className="col-span-6 md:col-span-3">
              <Input
                value={variant.figureScale ?? ""}
                onChange={(e) => onChange({ figureScale: e.target.value || null })}
                placeholder='1/7, S.H. Figuarts'
              />
            </Field>
            <Field label="Fabricante" className="col-span-6 md:col-span-3">
              <Input
                value={variant.figureManufacturer ?? ""}
                onChange={(e) => onChange({ figureManufacturer: e.target.value || null })}
                placeholder="Good Smile Company"
              />
            </Field>
          </>
        )}
      </FieldGrid>
    </div>
  );
}
