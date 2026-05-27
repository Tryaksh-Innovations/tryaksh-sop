import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

type StageState = "approved" | "current" | "awaiting" | "in_progress" | "pending";

const DEMO_STAGES: {
  num: string;
  name: string;
  state: StageState;
  lock: boolean;
  runNumber?: number;
}[] = [
  { num: "01", name: "Parts Selection", state: "approved", lock: false },
  { num: "02", name: "Block Diagram", state: "approved", lock: false },
  { num: "03", name: "Symbol & Footprint", state: "approved", lock: false },
  { num: "04", name: "Schematic Capture", state: "approved", lock: false },
  { num: "05", name: "Schematic Review #1", state: "approved", lock: false, runNumber: 2 },
  { num: "06", name: "Schematic Lock", state: "current", lock: true },
  { num: "07", name: "Priority + Breadboard", state: "pending", lock: false },
  { num: "08", name: "Decision Gate", state: "pending", lock: true },
  { num: "9a", name: "Placement Review", state: "pending", lock: false },
  { num: "9b", name: "Routing & DFM", state: "pending", lock: false },
];

function StateMarker({ state, lock }: { state: StageState; lock: boolean }) {
  const base = "size-3.5 shrink-0 relative";
  if (state === "approved") {
    return <span className={cn(base, "bg-ink", lock && "ring-2 ring-ink ring-offset-2 ring-offset-paper")} />;
  }
  if (state === "current") {
    return (
      <span className={cn(base, "border-2 border-ink bg-paper", lock && "ring-2 ring-alert ring-offset-1 ring-offset-paper")}>
        <span className="absolute inset-1 bg-signal" />
      </span>
    );
  }
  if (state === "awaiting") {
    return (
      <span className={cn(base, "border-2 border-warn-ink bg-warn-soft")}>
        <span className="absolute inset-1 bg-warn animate-pulse" />
      </span>
    );
  }
  if (state === "in_progress") {
    return <span className={cn(base, "border-2 border-blueprint-ink bg-blueprint-soft")} />;
  }
  return <span className={cn(base, "border border-rule-2 bg-paper")} />;
}

function labelForState(state: StageState) {
  return {
    approved: "Approved",
    current: "Current",
    awaiting: "Awaiting",
    in_progress: "Active",
    pending: "Pending",
  }[state];
}

export function DemoStepper() {
  return (
    <div className="space-y-5">
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-0">
        {DEMO_STAGES.map((stage, idx) => {
          const isLast = idx === DEMO_STAGES.length - 1;
          return (
            <li key={stage.num} className="min-w-0">
              <div
                className={cn(
                  "relative h-full px-3 py-3 border-r border-rule transition-colors",
                  isLast && "border-r-0",
                  stage.state === "current" && "bg-paper-2"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.1em]">
                    {stage.num}
                  </span>
                  {stage.lock && <Lock className="size-2.5 text-alert" />}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <StateMarker state={stage.state} lock={stage.lock} />
                  {stage.runNumber && (
                    <span className="font-mono text-[9px] text-ink-3">
                      r{stage.runNumber}
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "text-[11px] leading-tight font-medium",
                    stage.state === "pending" ? "text-ink-3" : "text-ink"
                  )}
                >
                  {stage.name}
                </div>
                <div className="mt-1 mono-caps text-ink-4">
                  {labelForState(stage.state)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-3">
        <span className="mono-caps text-ink-4 mr-2">Legend</span>
        <Legend state="approved" />
        <Legend state="current" />
        <Legend state="awaiting" />
        <Legend state="in_progress" />
        <Legend state="pending" />
        <div className="flex items-center gap-1.5">
          <Lock className="size-2.5 text-alert" />
          <span className="mono-caps text-ink-3">Lock gate</span>
        </div>
      </div>
    </div>
  );
}

function Legend({ state }: { state: StageState }) {
  return (
    <span className="flex items-center gap-1.5">
      <StateMarker state={state} lock={false} />
      <span className="mono-caps text-ink-3">{labelForState(state)}</span>
    </span>
  );
}
