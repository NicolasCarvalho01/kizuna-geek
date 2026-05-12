import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Itens repetidos pra preencher a faixa infinita */
  items: ReadonlyArray<React.ReactNode>;
  /** Velocidade em segundos pra um ciclo completo */
  duration?: number;
  /** Direção (left = padrão) */
  direction?: "left" | "right";
  /** Pausar ao hover */
  pauseOnHover?: boolean;
  /** Separador entre itens */
  separator?: React.ReactNode;
}

/**
 * Marquee infinito CSS-only. Duplica os filhos pra manter loop sem cuts.
 * Pausa no `prefers-reduced-motion`.
 *
 * Usado pra faixa de "PRÉ-VENDA · LANÇAMENTOS · COLECIONÁVEIS" e
 * para o ticker de produtos curados.
 */
export function Marquee({
  items,
  duration = 32,
  direction = "left",
  pauseOnHover = false,
  separator = (
    <span aria-hidden className="font-[var(--font-jp)] text-[color:var(--color-gold)] mx-8">
      ・
    </span>
  ),
  className,
  ...props
}: MarqueeProps) {
  const repeated = [...items, ...items];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "[mask-image:linear-gradient(90deg,transparent_0,black_8%,black_92%,transparent_100%)]",
        className,
      )}
      role="region"
      aria-label="Faixa de destaque"
      {...props}
    >
      <div
        className={cn(
          "flex w-max items-center will-change-transform",
          "[animation:marquee_var(--duration)_linear_infinite]",
          direction === "right" && "[animation-direction:reverse]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={{ "--duration": `${duration}s` } as React.CSSProperties}
      >
        {repeated.map((item, i) => (
          <React.Fragment key={i}>
            <div className="shrink-0">{item}</div>
            {separator}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
