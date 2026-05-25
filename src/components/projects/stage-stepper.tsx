import Link from "next/link";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { StageRunForStepper } from "@/server/queries/projects";

interface StageStepperProps {
  projectId: string;
  stages: StageRunForStepper[];
  currentStageId: string | null;
}

type StageState =
  | "approved"
  | "current"
  | "awaiting"
  | "in_progress"
  | "pending";

function getStageState(
  stage: StageRunForStepper,
  isCurrent: boolean
): StageState {
  if (stage.runStatus === "approved" || stage.runStatus === "skipped") {
    return "approved";
  }
  if (stage.runStatus === "awaiting_approval") return "awaiting";
  if (isCurrent) return "current";
  if (stage.runStatus === "in_progress") return "in_progress";
  return "pending";
}

function StateMarker({
  state,
  isLockGate,
}: {
  state: StageState;
  isLockGate: boolean;
}) {
  // Each state gets its own precision shape — like a technical drawing legend.
  const base = "size-3.5 shrink-0 relative";

  if (state === "approved") {
    return (
      <span
        className={cn(base, "bg-ink", isLockGate && "ring-2 ring-ink ring-offset-2 ring-offset-paper")}
        aria-label="Approved"
      />
    );
  }
  if (state === "current") {
    return (
      <span
        className={cn(base, "border-2 border-ink bg-paper", isLockGate && "ring-2 ring-alert ring-offset-1 ring-offset-paper")}
        aria-label="Current"
      >
        <span className="absolute inset-1 bg-signal" />
      </span>
    );
  }
  if (state === "awaiting") {
    return (
      <span
        className={cn(base, "border-2 border-warn-ink bg-warn-soft")}
        aria-label="Awaiting approval"
      >
        <span className="absolute inset-1 bg-warn animate-pulse" />
      </span>
    );
  }
  if (state === "in_progress") {
    return (
      <span
        className={cn(base, "border-2 border-blueprint-ink bg-blueprint-soft")}
        aria-label="In progress"
      />
    );
  }
  return (
    <span
      className={cn(base, "border border-rule-2 bg-paper")}
      aria-label="Pending"
    />
  );
}

function labelForState(state: StageState) {
  switch (state) {
    case "approved":
      return "Approved";
    case "current":
      return "Current";
    case "awaiting":
      return "Awaiting approval";
    case "in_progress":
      return "In progress";
    case "pending":
      return "Pending";
  }
}

export function StageStepper({
  projectId,
  stages,
  currentStageId,
}: StageStepperProps) {
  return (
    <div className="space-y-5">
      {/* The diagram itself */}
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-0 relative">
        {stages.map((stage, idx) => {
          const isCurrent = stage.stageId === currentStageId;
          const state = getStageState(stage, isCurrent);
          const href = stage.runId
            ? `/projects/${projectId}/stages/${stage.runId}`
            : null;
          const isLast = idx === stages.length - 1;

          const inner = (
            <div
              className={cn(
                "relative h-full px-3 py-3 border-r border-rule transition-colors",
                isLast && "border-r-0",
                href && "hover:bg-paper-3 cursor-pointer",
                isCurrent && "bg-paper-2"
              )}
            >
              {/* Stage number rail */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.1em]">
                  {stage.stageNumber.padStart(2, "0")}
                </span>
                {stage.isLockGate && (
                  <Lock className="size-2.5 text-alert" aria-hidden />
                )}
              </div>

              {/* State marker */}
              <div className="flex items-center gap-2 mb-2">
                <StateMarker state={state} isLockGate={stage.isLockGate} />
                {stage.runNumber && stage.runNumber > 1 && (
                  <span className="font-mono text-[9px] text-ink-3">
                    r{stage.runNumber}
                  </span>
                )}
              </div>

              {/* Stage name */}
              <div
                className={cn(
                  "text-[11px] leading-tight font-medium",
                  state === "pending" ? "text-ink-3" : "text-ink"
                )}
              >
                {stage.stageName}
              </div>

              {/* Status label */}
              <div className="mt-1 mono-caps text-ink-4">
                {labelForState(state)}
              </div>
            </div>
          );

          return (
            <li key={stage.stageId} className="min-w-0">
              {href ? (
                <Link href={href} className="block h-full">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ol>

      {/* Legend strip */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-3">
        <span className="mono-caps text-ink-4 mr-2">Legend</span>
        <LegendItem state="approved" />
        <LegendItem state="current" />
        <LegendItem state="awaiting" />
        <LegendItem state="in_progress" />
        <LegendItem state="pending" />
        <div className="flex items-center gap-1.5">
          <Lock className="size-2.5 text-alert" aria-hidden />
          <span className="mono-caps text-ink-3">Lock gate</span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ state }: { state: StageState }) {
  return (
    <span className="flex items-center gap-1.5">
      <StateMarker state={state} isLockGate={false} />
      <span className="mono-caps text-ink-3">{labelForState(state)}</span>
    </span>
  );
}
