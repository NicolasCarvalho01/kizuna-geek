"use client";

import * as React from "react";
import { Loader2, Truck, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { quoteShipping, type ShippingOption } from "@/server/actions/shipping-actions";
import { cn, formatBRL } from "@/lib/utils";

interface CepCalculatorProps {
  /** ID do produto pra cotar (single-item quote) */
  productId: string;
  /** Peso unitário em gramas */
  weightGrams: number;
  /** Dimensões em cm */
  dimensions: { length: number; width: number; height: number };
  /** Preço unitário em reais (valor de seguro) */
  unitPrice: number;
}

/**
 * Mini-calculadora de frete na página do produto.
 * Cota assumindo qty=1 desse item. No carrinho rola cotação real do conjunto.
 */
export function CepCalculator({
  productId,
  weightGrams,
  dimensions,
  unitPrice,
}: CepCalculatorProps) {
  const [cep, setCep] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [options, setOptions] = React.useState<ShippingOption[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOptions(null);

    startTransition(async () => {
      const res = await quoteShipping({
        destinationZip: cep,
        items: [
          {
            productId,
            weightGrams,
            length: dimensions.length,
            width: dimensions.width,
            height: dimensions.height,
            unitPrice,
            quantity: 1,
          },
        ],
      });

      if (res.ok && res.data) {
        setOptions(res.data.options);
      } else {
        setError(res.error ?? "Erro ao cotar frete.");
      }
    });
  }

  function formatCepInput(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-hairline)] p-5">
      <div className="flex items-start gap-3 mb-4">
        <Truck className="h-4 w-4 text-[color:var(--color-gold)] mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="eyebrow">Cotação de frete</p>
          <p className="mt-1 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
            Calcule prazo e valor pro seu CEP. Cotação válida por 1h.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(formatCepInput(e.target.value))}
          maxLength={9}
          className="h-10 flex-1"
          aria-label="CEP de destino"
        />
        <button
          type="submit"
          disabled={pending || cep.replace(/\D/g, "").length !== 8}
          className={cn(
            "inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)]",
            "border border-[color:var(--color-border-strong)] bg-transparent",
            "text-[0.875rem] text-[color:var(--color-fg)]",
            "transition-all duration-[var(--motion-fast)] ease-[var(--ease-out-3)]",
            "hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
          Calcular
        </button>
      </form>

      <a
        href="https://buscacepinter.correios.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)] hover:text-[color:var(--color-gold)] transition-colors"
      >
        Não sei meu CEP ↗
      </a>

      {error && (
        <p
          role="alert"
          className="mt-4 text-[var(--text-caption)] text-[color:var(--color-vermilion)] leading-snug"
        >
          {error}
        </p>
      )}

      {options && options.length > 0 && (
        <ul className="mt-5 divide-y divide-[color:var(--color-hairline)] border-t border-[color:var(--color-hairline)]">
          {options.map((opt) => (
            <li
              key={`${opt.serviceId}-${opt.carrier}`}
              className={cn(
                "py-3 flex items-start justify-between gap-3",
                opt.error && "opacity-60",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] font-medium text-[color:var(--color-fg)] truncate">
                  {opt.serviceName}
                </p>
                <p className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-fg-mute)]">
                  {opt.carrier}
                  {!opt.error &&
                    ` · ${opt.deliveryRange.min}–${opt.deliveryRange.max} dia(s) úteis`}
                </p>
              </div>
              <div className="text-right shrink-0 max-w-[14rem]">
                {opt.error ? (
                  <>
                    <p className="text-[var(--text-eyebrow)] uppercase tracking-[var(--tracking-eyebrow)] font-[var(--font-mono)] text-[color:var(--color-vermilion)]">
                      Indisponível
                    </p>
                    <p
                      className="mt-0.5 text-[var(--text-caption)] text-[color:var(--color-fg-mute)] leading-snug"
                      title={opt.error}
                    >
                      {opt.error}
                    </p>
                  </>
                ) : (
                  <p className="font-[var(--font-mono)] text-[0.9375rem] font-medium text-[color:var(--color-fg)]">
                    {formatBRL(opt.price)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {options && options.length === 0 && (
        <p className="mt-4 text-[var(--text-caption)] text-[color:var(--color-fg-soft)]">
          Nenhuma transportadora atende esse CEP para as dimensões/peso deste produto.
        </p>
      )}
    </div>
  );
}
