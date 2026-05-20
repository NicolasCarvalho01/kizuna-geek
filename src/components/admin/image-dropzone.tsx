"use client";

import * as React from "react";
import Image from "next/image";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  uploadProductImageAction,
  deleteProductImageAction,
} from "@/server/actions/upload-actions";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  urls: string[];
  onAdd: (url: string) => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, direction: "up" | "down") => void;
  maxFiles?: number;
}

/**
 * Dropzone de imagens com upload pro Supabase Storage.
 *
 * Aceita:
 *  - Drag & drop de múltiplos arquivos
 *  - Click pra abrir file picker
 *  - Colar URL diretamente (sem upload, pra imagens externas)
 *
 * UX:
 *  - Cada upload aparece com placeholder de loading
 *  - Erro mostra inline, sem alert
 *  - Reorder via setas (drag & drop entre cards: TODO Fase 8)
 */
export function ImageDropzone({
  urls,
  onAdd,
  onRemove,
  onMove,
  maxFiles = 12,
}: ImageDropzoneProps) {
  const [uploading, setUploading] = React.useState<number>(0);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const canAddMore = urls.length + uploading < maxFiles;

  const handleFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      const slotsLeft = Math.max(0, maxFiles - urls.length - uploading);
      const toUpload = list.slice(0, slotsLeft);

      if (slotsLeft === 0) {
        setErrors((e) => [...e, `Máximo de ${maxFiles} imagens atingido.`]);
        return;
      }

      setUploading((n) => n + toUpload.length);

      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const result = await uploadProductImageAction(formData);
          if (result.ok && result.data) {
            onAdd(result.data.url);
          } else {
            setErrors((e) => [...e, `${file.name}: ${result.error}`]);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Erro inesperado";
          setErrors((e) => [...e, `${file.name}: ${msg}`]);
        } finally {
          setUploading((n) => n - 1);
        }
      }
    },
    [maxFiles, urls.length, uploading, onAdd],
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
      e.target.value = ""; // reset pra permitir upload do mesmo arquivo de novo
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setErrors((e) => [...e, "URL inválida."]);
      return;
    }
    onAdd(trimmed);
    setUrlInput("");
  };

  const handleRemove = async (idx: number, url: string) => {
    onRemove(idx);
    // Fire-and-forget delete do storage se for URL nossa
    if (url.includes("/storage/v1/object/public/products/")) {
      try {
        await deleteProductImageAction(url);
      } catch {
        // ignored — apenas tenta limpar
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => canAddMore && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Solte arquivos aqui ou clique para selecionar"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && canAddMore) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "border-2 border-dashed rounded-[var(--radius-md)] p-8",
          "flex flex-col items-center justify-center gap-3 text-center",
          "transition-all duration-[var(--motion-fast)] cursor-pointer",
          isDragging
            ? "border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5"
            : "border-[color:var(--color-border-strong)] hover:border-[color:var(--color-gold)]/60",
          !canAddMore && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          multiple
          className="sr-only"
          onChange={handleFileInput}
          disabled={!canAddMore}
        />
        {uploading > 0 ? (
          <>
            <Loader2 className="h-6 w-6 text-[color:var(--color-gold)] animate-spin" />
            <p className="text-[0.9375rem] text-[color:var(--color-fg)]">
              Enviando {uploading} {uploading === 1 ? "imagem" : "imagens"}…
            </p>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-[color:var(--color-gold)]/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-[color:var(--color-gold)]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
                Solte arquivos aqui ou{" "}
                <span className="text-[color:var(--color-gold)] underline underline-offset-2">
                  clique pra selecionar
                </span>
              </p>
              <p className="mt-1 text-[0.8125rem] text-[color:var(--color-fg-soft)]">
                JPG, PNG, WebP, AVIF · até 8 MB · {urls.length}/{maxFiles} usadas
              </p>
            </div>
          </>
        )}
      </div>

      {/* Adicionar via URL — pra imagens externas */}
      <details className="text-[0.875rem]">
        <summary className="cursor-pointer text-[color:var(--color-fg-soft)] hover:text-[color:var(--color-fg)] select-none">
          Ou adicionar por URL externa
        </summary>
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)] bg-transparent text-[0.875rem] focus:outline-none focus:border-[color:var(--color-gold)]"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 rounded-[var(--radius-sm)] border border-[color:var(--color-border-strong)] text-[0.875rem] hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition-colors"
          >
            <ImagePlus className="h-3.5 w-3.5 inline mr-1" strokeWidth={1.5} />
            Adicionar
          </button>
        </div>
      </details>

      {/* Erros */}
      {errors.length > 0 && (
        <ul className="space-y-1 text-[0.8125rem] text-[color:var(--color-vermilion)]">
          {errors.map((err, i) => (
            <li key={i} className="flex items-start justify-between gap-2">
              <span>{err}</span>
              <button
                type="button"
                onClick={() => setErrors((e) => e.filter((_, idx) => idx !== i))}
                aria-label="Limpar erro"
                className="opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Grid de imagens */}
      {urls.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {urls.map((url, idx) => (
            <li
              key={`${url}-${idx}`}
              className={cn(
                "group relative aspect-square rounded-[var(--radius-md)] overflow-hidden",
                "border border-[color:var(--color-border-strong)]",
                idx === 0 && "ring-2 ring-[color:var(--color-gold)]/50",
              )}
            >
              <Image
                src={url}
                alt={`Imagem ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />

              {/* Badge "principal" */}
              {idx === 0 && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[color:var(--color-gold)] text-[color:var(--color-gold-ink)] text-[0.6875rem] font-medium uppercase tracking-wider">
                  Principal
                </span>
              )}

              {/* Controles — visíveis no hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(idx, "up")}
                  disabled={idx === 0}
                  title="Mover pra cima"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white"
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(idx, "down")}
                  disabled={idx === urls.length - 1}
                  title="Mover pra baixo"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white"
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(idx, url)}
                  title="Remover"
                  className="h-8 w-8 rounded-full bg-[color:var(--color-vermilion)]/80 hover:bg-[color:var(--color-vermilion)] flex items-center justify-center text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>

              {/* Drag handle indicador (futuro) */}
              <span
                aria-hidden
                className="absolute top-2 right-2 opacity-30"
              >
                <GripVertical className="h-3.5 w-3.5 text-white" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
