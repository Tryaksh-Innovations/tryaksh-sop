"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A mock of the CEO approval panel — Stage 8 variant with proceed/reopen.
 * Looks and feels like the real one but doesn't submit anywhere.
 */
export function DemoApprovalPanel() {
  const [decision, setDecision] = useState<"proceed" | "reopen">("proceed");
  const [typedName, setTypedName] = useState("");

  return (
    <div className="border border-ink shadow-[4px_4px_0_0_var(--rule)] bg-paper-2">
      <div className="border-b border-rule px-5 py-3 flex items-center gap-2">
        <span className="size-1.5 bg-signal rounded-full animate-pulse" />
        <span className="mono-caps text-signal-ink">
          Stage 8 · Decision required
        </span>
        <span className="ml-auto mono-caps text-ink-4">§ A</span>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div>
          <h3 className="font-display text-[22px] text-ink leading-tight">
            Proceed to layout, or re-open the schematic?
          </h3>
          <p className="mt-1 text-[12px] text-ink-3">
            All P1 breadboard blocks must PASS before Stage 9a placement
            review begins.
          </p>
        </div>

        <div className="space-y-2">
          <label
            className={cn(
              "flex items-start gap-3 cursor-pointer border px-3 py-3 transition-colors",
              decision === "proceed"
                ? "border-ink bg-paper"
                : "border-rule hover:bg-paper-3"
            )}
            onClick={() => setDecision("proceed")}
          >
            <span
              className={cn(
                "mt-0.5 size-[14px] rounded-full border border-ink/70 grid place-items-center",
                decision === "proceed" && "bg-paper"
              )}
            >
              {decision === "proceed" && (
                <span className="size-2 rounded-full bg-ink" />
              )}
            </span>
            <div>
              <div className="text-[13px] font-medium text-ink">
                Proceed to layout
              </div>
              <div className="mt-0.5 text-[11px] text-ink-3">
                All P1 blocks PASS — advance to Stage 9a (placement review).
              </div>
            </div>
          </label>

          <label
            className={cn(
              "flex items-start gap-3 cursor-pointer border px-3 py-3 transition-colors",
              decision === "reopen"
                ? "border-alert bg-alert-soft/60"
                : "border-rule hover:bg-paper-3"
            )}
            onClick={() => setDecision("reopen")}
          >
            <span
              className={cn(
                "mt-0.5 size-[14px] rounded-full border border-ink/70 grid place-items-center"
              )}
            >
              {decision === "reopen" && (
                <span className="size-2 rounded-full bg-ink" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <RefreshCw className="size-3 text-alert" />
                Re-open schematic
              </div>
              <div className="mt-0.5 text-[11px] text-ink-3">
                A P1 block failed. Creates a new Stage 6 run with{" "}
                <span className="font-mono">runNumber+1</span>; project
                returns to schematic lock.
              </div>
            </div>
          </label>
        </div>

        <div className="space-y-1.5">
          <div className="mono-caps text-ink-2">Type your full name to confirm</div>
          <input
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Richansh"
            className="w-full bg-transparent border-0 border-b border-rule-2 px-0 py-1.5 font-display text-[18px] text-ink placeholder:text-ink-4 focus:outline-none focus:border-ink"
          />
          <p className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
            Recorded as your sign-off in the audit trail
          </p>
        </div>

        <div className="flex justify-end pt-3 border-t border-rule">
          <button
            type="button"
            className={cn(
              "h-9 px-4 font-mono text-[11px] uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors",
              decision === "proceed"
                ? "bg-signal text-paper hover:opacity-90"
                : "bg-alert text-paper hover:opacity-90"
            )}
          >
            {decision === "proceed" ? (
              <>
                <CheckCircle2 className="size-3.5" />
                Proceed to Stage 9a
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                Re-open schematic
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
