/**
 * Loading state global — exibido durante data fetching no nível root.
 * Visual: 絆 pulsando + linha hairline animada.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60svh] flex-col items-center justify-center gap-6 py-24"
    >
      <span
        aria-hidden
        className="font-[var(--font-jp)] text-[clamp(4rem,10vw,7rem)] font-black text-[color:var(--color-gold)] leading-none animate-[shimmer-gold_1.8s_var(--ease-io-1)_infinite]"
      >
        絆
      </span>
      <div className="relative h-px w-40 overflow-hidden bg-[color:var(--color-border)]">
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1/3 bg-[color:var(--color-gold)] animate-[loader_1.4s_var(--ease-io-3)_infinite]"
        />
      </div>
      <p className="eyebrow">Carregando · Just a moment</p>

      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(420%); }
        }
      `}</style>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
