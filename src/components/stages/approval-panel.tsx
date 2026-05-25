"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  approveStage,
  sendBack,
  decideStage8,
  requestApproval,
} from "@/server/actions/workflow";
import { AlertCircle, Send, RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Designer: request approval
// ─────────────────────────────────────────────────────────────────

export function RequestApprovalButton({
  stageRunId,
  disabled,
}: {
  stageRunId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await requestApproval({ stageRunId });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={submit} disabled={disabled || pending} variant="signal" size="lg">
        <Send className="size-3.5" />
        {pending ? "Submitting…" : "Submit for approval"}
      </Button>
      {error && (
        <div className="flex items-start gap-2 border border-alert-ink/40 bg-alert-soft px-2.5 py-2 text-[11px]">
          <AlertCircle className="mt-0.5 size-3 shrink-0 text-alert-ink" />
          <span className="text-ink-2">{error}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CEO: approve / send back (standard stages)
// ─────────────────────────────────────────────────────────────────

export function ApprovalPanel({
  stageRunId,
  isLockGate,
  ceoName,
}: {
  stageRunId: string;
  isLockGate: boolean;
  ceoName: string;
}) {
  const router = useRouter();
  const [typedName, setTypedName] = useState("");
  const [note, setNote] = useState("");
  const [sendBackNote, setSendBackNote] = useState("");
  const [mode, setMode] = useState<"approve" | "send_back">("approve");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "approve"
          ? await approveStage({ stageRunId, typedName, note: note || null })
          : await sendBack({ stageRunId, note: sendBackNote });
      if (result.ok) {
        router.refresh();
        setTypedName("");
        setNote("");
        setSendBackNote("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mono-caps text-signal-ink mb-1">CEO decision required</div>
        <div className="font-display text-[22px] text-ink leading-tight">
          {isLockGate ? "Approve or send back this lock gate" : "Approve or send back"}
        </div>
      </div>

      <RadioGroup
        value={mode}
        onValueChange={(v) => setMode(v as "approve" | "send_back")}
        className="grid grid-cols-1 md:grid-cols-2 gap-2"
      >
        <label
          className={`flex items-start gap-2.5 cursor-pointer border px-3 py-2.5 transition-colors ${mode === "approve" ? "border-ink bg-paper-2" : "border-rule bg-transparent hover:bg-paper-3"}`}
        >
          <RadioGroupItem value="approve" className="mt-0.5" />
          <div>
            <div className="text-[13px] font-medium text-ink">Approve</div>
            <div className="mt-0.5 text-[11px] text-ink-3">
              {isLockGate
                ? "Lock this stage; advance to next."
                : "Mark complete; advance to next stage."}
            </div>
          </div>
        </label>
        <label
          className={`flex items-start gap-2.5 cursor-pointer border px-3 py-2.5 transition-colors ${mode === "send_back" ? "border-ink bg-paper-2" : "border-rule bg-transparent hover:bg-paper-3"}`}
        >
          <RadioGroupItem value="send_back" className="mt-0.5" />
          <div>
            <div className="text-[13px] font-medium text-ink">Send back</div>
            <div className="mt-0.5 text-[11px] text-ink-3">
              Return to designer with a written change list.
            </div>
          </div>
        </label>
      </RadioGroup>

      {mode === "approve" ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="typedName" className="block mb-1.5">
              Type your full name to confirm
            </Label>
            <Input
              id="typedName"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={ceoName}
              autoComplete="off"
              className="font-display text-[18px]"
            />
            <p className="mt-1.5 text-[11px] text-ink-3 font-mono">
              Recorded as your sign-off in the audit trail.
            </p>
          </div>
          <div>
            <Label htmlFor="note" className="block mb-1.5">Optional comment</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Good work — proceeding to layout."
              className="min-h-16 text-[13px]"
            />
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="sendBackNote" className="block mb-1.5">
            What needs to change · required
          </Label>
          <Textarea
            id="sendBackNote"
            value={sendBackNote}
            onChange={(e) => setSendBackNote(e.target.value)}
            placeholder="Specific items to fix; tag them by checklist heading."
            className="min-h-24 text-[13px]"
          />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 border border-alert-ink/40 bg-alert-soft px-2.5 py-2 text-[11px]">
          <AlertCircle className="mt-0.5 size-3 shrink-0 text-alert-ink" />
          <span className="text-ink-2">{error}</span>
        </div>
      )}

      <div className="flex justify-end border-t border-rule pt-4">
        <Button
          onClick={submit}
          disabled={pending}
          variant={mode === "approve" ? "signal" : "default"}
          size="lg"
        >
          {pending
            ? mode === "approve"
              ? "Approving…"
              : "Sending back…"
            : mode === "approve"
              ? "Approve & advance"
              : "Send back to designer"}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CEO: Stage 8 decision — proceed | reopen
// ─────────────────────────────────────────────────────────────────

export function Stage8DecisionPanel({
  stageRunId,
  ceoName,
}: {
  stageRunId: string;
  ceoName: string;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<"proceed" | "reopen">("proceed");
  const [typedName, setTypedName] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await decideStage8({
        stageRunId,
        decision,
        typedName,
        note: note || null,
      });
      if (result.ok) {
        router.refresh();
        setTypedName("");
        setNote("");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mono-caps text-signal-ink mb-1">
          Stage 8 · Decision gate
        </div>
        <div className="font-display text-[22px] text-ink leading-tight">
          Proceed to layout, or re-open the schematic?
        </div>
      </div>

      <RadioGroup
        value={decision}
        onValueChange={(v) => setDecision(v as "proceed" | "reopen")}
        className="grid grid-cols-1 gap-2"
      >
        <label
          className={`flex items-start gap-2.5 cursor-pointer border px-3 py-3 transition-colors ${decision === "proceed" ? "border-ink bg-paper-2" : "border-rule bg-transparent hover:bg-paper-3"}`}
        >
          <RadioGroupItem value="proceed" className="mt-0.5" />
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
          className={`flex items-start gap-2.5 cursor-pointer border px-3 py-3 transition-colors ${decision === "reopen" ? "border-alert bg-alert-soft/60" : "border-rule bg-transparent hover:bg-paper-3"}`}
        >
          <RadioGroupItem value="reopen" className="mt-0.5" />
          <div>
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <RefreshCw className="size-3 text-alert" />
              Re-open schematic
            </div>
            <div className="mt-0.5 text-[11px] text-ink-3">
              A P1 block failed or a marginal result warrants a schematic
              change. Creates a new Stage 6 run; project returns to schematic
              lock.
            </div>
          </div>
        </label>
      </RadioGroup>

      <div>
        <Label htmlFor="typedName" className="block mb-1.5">
          Type your full name to confirm
        </Label>
        <Input
          id="typedName"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder={ceoName}
          autoComplete="off"
          className="font-display text-[18px]"
        />
      </div>

      <div>
        <Label htmlFor="note" className="block mb-1.5">
          {decision === "reopen"
            ? "Root-cause explanation · required"
            : "Optional comment"}
        </Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            decision === "reopen"
              ? "Which P1 block failed and what triggered the failure; why it wasn't caught at Stage 5/6."
              : ""
          }
          className="min-h-20 text-[13px]"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 border border-alert-ink/40 bg-alert-soft px-2.5 py-2 text-[11px]">
          <AlertCircle className="mt-0.5 size-3 shrink-0 text-alert-ink" />
          <span className="text-ink-2">{error}</span>
        </div>
      )}

      <div className="flex justify-end border-t border-rule pt-4">
        <Button
          onClick={submit}
          disabled={pending}
          variant={decision === "reopen" ? "destructive" : "signal"}
          size="lg"
        >
          {pending
            ? "Submitting…"
            : decision === "proceed"
              ? "Proceed to Stage 9a"
              : "Re-open schematic"}
        </Button>
      </div>
    </div>
  );
}
