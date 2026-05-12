"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { DemoImage } from "@/server/demo-data";

interface GalleryProps {
  images: DemoImage[];
  productName: string;
}

/**
 * Galeria editorial — imagem principal + thumbs verticais.
 * Sem zoom modal nessa fase (Phase 7 polish), apenas hover scale.
 */
export function Gallery({ images, productName }: GalleryProps) {
  const ordered = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const active = ordered[activeIdx] ?? ordered[0];

  if (!active) {
    return (
      <div className="aspect-[4/5] w-full rounded-[var(--radius-lg)] bg-[color:var(--color-bg-sunken)]" />
    );
  }

  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3 lg:gap-4">
      {/* Thumbs */}
      <div className="flex flex-col gap-3">
        {ordered.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIdx(idx)}
            aria-label={`Ver imagem ${idx + 1} de ${ordered.length}`}
            aria-pressed={idx === activeIdx}
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-[var(--radius-sm)]",
              "border transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
              idx === activeIdx
                ? "border-[color:var(--color-gold)] ring-2 ring-[color:var(--color-gold)]/30 ring-offset-2 ring-offset-[color:var(--color-bg)]"
                : "border-[color:var(--color-border)] opacity-65 hover:opacity-100 hover:border-[color:var(--color-fg-soft)]",
            )}
          >
            <Image
              src={img.url}
              alt={img.altText ?? `${productName} — vista ${idx + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--color-bg-sunken)]">
        <Image
          key={active.id}
          src={active.url}
          alt={active.altText ?? productName}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          priority
          className="object-cover animate-[fade-in_var(--motion-base)_var(--ease-out-3)_forwards]"
        />
        {/* Index pill */}
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color:var(--color-navy-deep)]/70 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-cream)]">
          {String(activeIdx + 1).padStart(2, "0")} / {String(ordered.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
