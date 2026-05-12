import * as React from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Numeração editorial estilo magazine: "01", "02"… */
  index?: string;
  /** Rótulo separado por hairline */
  separator?: boolean;
}

/**
 * Microlabel uppercase dourado — anatomia editorial de seção.
 * Acompanha a maioria das sections do site (eyebrow → título → descrição).
 *
 * Ex: <Eyebrow index="01">Vitrine</Eyebrow>
 */
export function Eyebrow({ index, separator = true, className, children, ...props }: EyebrowProps) {
  return (
    <div
      className={cn(
        "eyebrow flex items-center gap-3",
        className,
      )}
      {...props}
    >
      {index && (
        <>
          <span aria-hidden className="font-[var(--font-mono)]">
            {`/ ${index}`}
          </span>
          {separator && (
            <span
              aria-hidden
              className="h-px w-6 bg-[color:var(--color-gold)]/40"
            />
          )}
        </>
      )}
      <span>{children}</span>
    </div>
  );
}
