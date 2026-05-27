import { getQuoteForDate, formatEpigraphDate } from "@/lib/quotes";

/**
 * The day's epigraph — a single rotating quote shown on the dashboard.
 * Same quote for everyone on a given day, deterministically picked.
 */
export function DailyEpigraph() {
  const today = new Date();
  const quote = getQuoteForDate(today);
  const label = formatEpigraphDate(today);

  return (
    <section
      aria-label="Morning note"
      className="relative border border-rule-3 bg-paper-2/40"
    >
      {/* Header strip */}
      <div className="border-b border-rule px-5 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="mono-caps text-ink-3">Morning note</span>
          <span className="text-ink-4">·</span>
          <span className="font-mono text-[10px] text-ink-2 uppercase tracking-[0.14em]">
            {label}
          </span>
        </div>
        <span className="section-mark hidden md:inline">§ †</span>
      </div>

      {/* The quote */}
      <blockquote className="relative px-6 md:px-10 py-8 md:py-10">
        {/* Open quote mark — large, decorative */}
        <span
          aria-hidden
          className="absolute left-2 md:left-4 top-3 md:top-4 font-display text-[80px] md:text-[120px] leading-none text-ink-4 select-none"
          style={{
            fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1',
          }}
        >
          “
        </span>

        <p
          className="relative font-display text-[clamp(20px,2.4vw,30px)] leading-snug italic text-ink"
          style={{
            fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 0',
          }}
        >
          {quote.text}
        </p>

        {/* Attribution */}
        <footer className="relative mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[11px] text-ink uppercase tracking-[0.14em]">
            — {quote.author}
          </span>
          {quote.context && (
            <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
              · {quote.context}
            </span>
          )}
        </footer>
      </blockquote>
    </section>
  );
}
