import * as React from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";

interface EditorialPageProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
  /** 絆 marca d'água gigante (true) ou sem decoração */
  withWatermark?: boolean;
}

/**
 * Layout editorial compartilhado pra páginas institucionais
 * (sobre, privacidade, termos, FAQ, etc.).
 *
 * Hero com Eyebrow + H1 + lead (opcional), depois conteúdo livre.
 * Mantém consistência visual com a /sobre.
 */
export function EditorialPage({
  eyebrow,
  title,
  lead,
  children,
  withWatermark = false,
}: EditorialPageProps) {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-20 lg:pt-28 pb-12 lg:pb-16 overflow-hidden isolate">
        {withWatermark && (
          <span
            aria-hidden
            className="absolute top-10 right-[-3rem] lg:right-[-4rem] font-[var(--font-jp)] text-[18rem] lg:text-[28rem] leading-none font-black text-[color:var(--color-gold)]/[0.08] select-none pointer-events-none"
          >
            絆
          </span>
        )}

        <div className="wrap relative">
          <Eyebrow index="—">{eyebrow}</Eyebrow>
          <h1
            className={cn(
              "display mt-4",
              "text-[clamp(2rem,5.5vw,4rem)] leading-[1.05]",
              "max-w-[22ch]",
            )}
          >
            {title}
          </h1>

          {lead && (
            <p className="mt-8 max-w-2xl text-[var(--text-lead)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
              {lead}
            </p>
          )}
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="border-t border-[color:var(--color-hairline)] py-16 lg:py-24">
        <div className="wrap">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-9 lg:col-start-3">
              <article className="editorial-content text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg)] [&_h2]:font-[var(--font-display)] [&_h2]:text-[clamp(1.5rem,2.6vw,2rem)] [&_h2]:leading-[1.2] [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:first:mt-0 [&_h3]:font-[var(--font-display)] [&_h3]:text-[1.25rem] [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_strong]:text-[color:var(--color-fg)] [&_strong]:font-medium [&_a]:text-[color:var(--color-gold)] [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-[color:var(--color-gold-soft)]">
                {children}
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Box destaque pra avisos importantes dentro do conteúdo editorial.
 * Use pra alertas tipo "Atenção: período de pré-venda não tem reembolso após X".
 */
export function CalloutBox({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "gold";
  title?: string;
  children: React.ReactNode;
}) {
  const variants = {
    info: "border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)]",
    warning:
      "border-[color:var(--color-vermilion)]/40 bg-[color:var(--color-vermilion)]/8",
    gold: "border-[color:var(--color-gold)]/40 bg-[color:var(--color-gold)]/6",
  };
  return (
    <aside
      className={cn(
        "my-8 rounded-[var(--radius-md)] border p-5 lg:p-6",
        "[&_p]:mb-3 [&_p:last-child]:mb-0 [&_p]:text-[0.9375rem]",
        variants[variant],
      )}
    >
      {title && (
        <p className="eyebrow mb-3 text-[color:var(--color-gold)]">{title}</p>
      )}
      {children}
    </aside>
  );
}

/**
 * Lista de tópicos com eyebrow numerada — visual estilo "manifesto".
 */
export function TopicList({
  items,
}: {
  items: Array<{ index: string; title: string; body: React.ReactNode }>;
}) {
  return (
    <ul className="not-prose grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10 my-10">
      {items.map((item) => (
        <li key={item.index} className="flex gap-5">
          <span className="eyebrow text-[color:var(--color-gold)] shrink-0 pt-1">
            {item.index}
          </span>
          <div>
            <h3 className="font-[var(--font-display)] text-[1.25rem] leading-tight mb-2">
              {item.title}
            </h3>
            <div className="text-[var(--text-body)] leading-[var(--leading-relaxed)] text-[color:var(--color-fg-soft)]">
              {item.body}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
