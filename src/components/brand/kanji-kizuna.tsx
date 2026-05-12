"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Caligrafia de 絆 (kizuna) — desenhada traço por traço.
 *
 * Paths vindos do projeto KanjiVG (CC BY-SA 3.0, http://kanjivg.tagaini.net),
 * mantendo a ordem oficial de pinceladas japonesas:
 *   1-6 → radical 糸 (laço/fio, lado esquerdo)
 *   7-11 → 半 (metade, lado direito)
 *
 * Cada path é animado individualmente via `stroke-dashoffset` + `pathLength="1"`,
 * com delay escalonado para emular o gesto de um calígrafo. O filtro `kanji-ink`
 * dá um leve borrão de tinta absorvendo no papel + glow dourado de assinatura.
 */

const STROKES: ReadonlyArray<string> = [
  "M28.4,12.17c0.36,1.42,0.1,2.82-0.68,4.26c-3.96,7.31-8.96,14.06-13.78,19.51c-1.12,1.27-0.66,3.31,0.81,3.84c3.79,1.38,9.06,3.16,12.1,5.58",
  "M39.18,23.86c0.87,1.74,0.12,3.21-0.82,4.66c-6.09,9.36-15.57,22.48-22.77,30.55c-1.05,1.18-0.66,3.92,2.03,2.99c4.76-1.64,15.58-5.06,21.71-6.63",
  "M34.25,46.25c3.35,2.43,8.66,9.97,9.5,13.75",
  "M28.89,61.62c0.87,0.87,1.23,2.51,1.23,3.84c0,8.21-0.07,21.26-0.1,28.67c-0.01,2.34-0.02,4.12-0.02,5",
  "M21.35,72.6c0.27,1.4,0.02,2.28-0.41,3.47c-1.61,4.49-6.3,12.35-8.95,16.12",
  "M37.38,69.88c4.27,3.33,7.55,11.08,8.55,14.1",
  "M60.49,22.75c0.13,1.11-0.04,2.17-0.61,3.12c-2.62,4.38-7.47,9.8-13.88,14.88",
  "M81.09,21.04c5.34,2.68,13.81,11.01,15.15,15.17",
  "M55.31,45.2c1.72,0.46,3.56,0.26,5.3,0.12c8.13-0.64,17.87-1.38,26.02-1.66c1.66-0.06,3.25-0.06,4.89,0.21",
  "M49,65.23c1.94,0.61,4.14,0.6,6.12,0.48c9.85-0.6,30.11-2.14,37.88-2.56c1.88-0.1,4.25-0.03,5.5,0.5",
  "M69.62,11.75c1.13,1.13,1.46,2.62,1.46,3.69c0,0.84,0.02,53.37,0.03,75.31c0,4.3,0,7.42,0,8.75",
];

interface KanjiKizunaProps extends Omit<React.SVGAttributes<SVGSVGElement>, "color"> {
  /** Cor das pinceladas — aceita var() */
  color?: string;
  /** Largura proporcional ao viewBox 0-109 (8 ≈ pincel grosso, 4 ≈ caneta) */
  strokeWidth?: number;
  /** Anima ao montar */
  animated?: boolean;
  /** Multiplicador de velocidade da animação (1 = 3s total) */
  speed?: number;
}

export function KanjiKizuna({
  color = "var(--color-gold)",
  strokeWidth = 8,
  animated = true,
  speed = 1,
  className,
  ...rest
}: KanjiKizunaProps) {
  // Único ID por instância — evita colisão se renderizar 2 vezes na mesma página
  const id = React.useId();
  const glowId = `kanji-glow-${id}`;

  return (
    <svg
      viewBox="0 0 109 109"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="絆 — kizuna, os laços que colecionamos"
      shapeRendering="geometricPrecision"
      className={cn("overflow-visible", className)}
      style={{ "--kanji-speed": speed } as React.CSSProperties}
      {...rest}
    >
      <defs>
        {/* Glow dourado de fundo — usa só como halo decorativo (NÃO toca nas pinceladas) */}
        <radialGradient id={glowId} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="55%" stopColor={color} stopOpacity="0.06" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo atrás do kanji — entra depois que o desenho termina */}
      {animated && (
        <circle
          cx="54.5"
          cy="54.5"
          r="55"
          fill={`url(#${glowId})`}
          className="kanji-halo"
        />
      )}

      <g
        style={{
          fill: "none",
          stroke: color,
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        {STROKES.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className={animated ? "kanji-stroke" : undefined}
            style={animated ? ({ "--idx": i } as React.CSSProperties) : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
