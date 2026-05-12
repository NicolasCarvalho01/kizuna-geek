"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // TODO Fase 7: integrar com Sentry
    console.error("[kizuna] erro de rota:", error);
  }, [error]);

  return (
    <div className="wrap py-24 lg:py-32">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <span
            aria-hidden
            className="font-[var(--font-jp)] text-[clamp(5rem,12vw,9rem)] leading-none font-black text-[color:var(--color-vermilion)]/80"
          >
            傷
          </span>
        </div>
        <div className="col-span-12 lg:col-span-7 lg:col-start-4">
          <Eyebrow index="—">Erro inesperado</Eyebrow>
          <h1 className="display mt-5 text-[clamp(2.25rem,5vw,3.75rem)]">
            Alguma coisa{" "}
            <em className="display-italic text-[color:var(--color-vermilion)]">
              se rompeu
            </em>{" "}
            nesse caminho.
          </h1>
          <p className="mt-6 max-w-md text-[var(--text-body)] text-[color:var(--color-fg-soft)] leading-[var(--leading-relaxed)]">
            Nossa equipe já foi notificada. Você pode tentar de novo agora — ou
            voltar pra vitrine principal enquanto a gente investiga.
          </p>

          {error.digest && (
            <p className="mt-4 font-[var(--font-mono)] text-[var(--text-eyebrow)] text-[color:var(--color-fg-mute)]">
              Código de referência: {error.digest}
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button onClick={reset}>
              <RotateCw className="h-4 w-4" strokeWidth={1.5} />
              Tentar novamente
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                Voltar para a vitrine
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
