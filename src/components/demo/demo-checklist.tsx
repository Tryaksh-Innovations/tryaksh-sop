"use client";

import { useState } from "react";
import { Check, MinusCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoItem {
  num: string;
  label: string;
  criterion: string;
  initial: "checked" | "na" | "unchecked";
  initials?: string;
  reason?: string;
}

const ITEMS: DemoItem[] = [
  {
    num: "01",
    label: "Every comm path has explicit data rate",
    criterion:
      "SPI clock for SCL3300, I2C bus rate, UART baud, BLE update rate — all named, all sized against MCU capability.",
    initial: "checked",
    initials: "RR",
  },
  {
    num: "02",
    label: "Latency budget closed",
    criterion:
      "For real-time paths, worst-case latency through the chain is calculated and within product spec.",
    initial: "checked",
    initials: "RR",
  },
  {
    num: "03",
    label: "BLE link budget reasonable",
    criterion:
      "Antenna placement plan, expected range against an Android tablet in railside conditions.",
    initial: "na",
    reason: "No BLE module in v2.1 — sensor-only revision.",
  },
];

/**
 * Interactive demo checklist — clickable in the tour, doesn't persist
 * anything to the database. Just shows how the real one works.
 */
export function DemoChecklist() {
  const [items, setItems] = useState(ITEMS);

  function toggle(num: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.num !== num) return it;
        if (it.initial === "checked") return { ...it, initial: "unchecked" };
        return { ...it, initial: "checked", initials: it.initials ?? "RR" };
      })
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 pb-2 border-b border-rule">
        <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.14em]">
          8.1.1 · Communication lines and latency
        </span>
        <div className="flex-1 h-px bg-rule" />
      </div>

      <ol className="space-y-2">
        {items.map((item) => {
          const checked = item.initial === "checked";
          const na = item.initial === "na";
          return (
            <li
              key={item.num}
              className={cn(
                "relative grid grid-cols-[auto_minmax(0,1fr)] gap-3 border p-3 transition-colors",
                checked && "border-seal-ink/30 bg-seal-soft/60",
                na && "border-warn-ink/30 bg-warn-soft/60",
                !checked && !na && "border-rule bg-paper-2"
              )}
            >
              <div className="flex flex-col items-center gap-2 pt-0.5">
                <span className="font-mono text-[10px] text-ink-3">{item.num}</span>
                <button
                  type="button"
                  onClick={() => toggle(item.num)}
                  className={cn(
                    "size-[14px] rounded-sm border border-ink/70 transition-all",
                    checked ? "bg-ink" : "bg-paper"
                  )}
                  aria-label={`Toggle ${item.label}`}
                >
                  {checked && (
                    <Check
                      className="size-3 text-paper m-auto"
                      strokeWidth={3}
                    />
                  )}
                </button>
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-medium text-ink leading-snug">
                      {item.label}
                    </div>
                    <div className="mt-1 text-[12px] text-ink-2 leading-snug">
                      {item.criterion}
                    </div>
                  </div>
                  {checked && (
                    <span className="inline-flex items-center gap-1 border border-seal-ink/40 bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-seal-ink shrink-0">
                      <Check className="size-2.5" />
                      Done
                    </span>
                  )}
                  {na && (
                    <span className="inline-flex items-center border border-warn-ink/40 bg-paper px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-warn-ink shrink-0">
                      N/A
                    </span>
                  )}
                </div>

                {checked && item.initials && (
                  <div className="flex items-center gap-2">
                    <span className="mono-caps text-ink-3">Initials</span>
                    <span className="font-mono text-[12px] text-ink border-b border-rule-2 px-2 py-0.5">
                      {item.initials}
                    </span>
                  </div>
                )}

                {na && item.reason && (
                  <div>
                    <span className="mono-caps text-ink-3 block mb-1">
                      Reason
                    </span>
                    <div className="text-[12px] text-ink-2 italic border-l-2 border-warn-ink/40 pl-2">
                      {item.reason}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex items-start gap-2 border border-rule-2 bg-paper-2/40 px-3 py-2">
        <MinusCircle className="mt-0.5 size-3 shrink-0 text-ink-3" />
        <p className="text-[11px] text-ink-3 leading-snug">
          Click a checkbox to toggle. In the real app, every check requires
          initials, and every &quot;N/A&quot; requires a written reason —
          enforced server-side before approval can be requested.
        </p>
      </div>

      <div className="flex items-start gap-2 border border-alert-ink/30 bg-alert-soft/40 px-3 py-2">
        <AlertCircle className="mt-0.5 size-3 shrink-0 text-alert-ink" />
        <p className="text-[11px] text-ink-2 leading-snug">
          <span className="mono-caps text-alert-ink">Submit blocked</span>{" "}
          while any item is unresolved. Once submitted, the checklist locks
          until the CEO decides.
        </p>
      </div>
    </div>
  );
}
